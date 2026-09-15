import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/data/api-response';
import { environment } from '../../../environments/environment';

// ── Enums (mirror backend SubEngineId) ──────────────────────────────────────
export type SubEngineId =
  | 'RAW_TRANSACTION'
  | 'PARTY'
  | 'CHANNEL'
  | 'DEVICE'
  | 'GEO'
  | 'BENEFICIARY';

// ── Catalog types (mirror backend records) ──────────────────────────────────

/** Mirror of backend ParamSpec.Kind */
export type ParamKind =
  | 'NUMBER'
  | 'DECIMAL'
  | 'STRING'
  | 'ENUM'
  | 'STRING_LIST'
  | 'BOOLEAN';

/** Mirror of backend ParamSpec record */
export interface ParamSpec {
  key: string;
  kind: ParamKind;
  label: string;
  hint: string | null;
  meaning: string;
  engineUse: string;
  allowedValues: string[];
  defaultValue: any;
  exampleValue: any;
  uiControl: string;
  inputFormat: string;
  emptyValueMeaning: string;
}

/** Mirror of backend FeatureCatalogEntry record */
export interface FeatureCatalogEntry {
  id: string;
  label: string;
  description: string;
  readsFields: string[];
  needsHistory: boolean;
  params: ParamSpec[];
  defaultScore: number;
  enabledByDefault: boolean;
  defaultParams: Record<string, any>;
}

/** Mirror of backend SubEngineCatalogEntry.Status */
export type SubEngineStatus = 'ACTIVE' | 'PLANNED';

/** Mirror of backend SubEngineCatalogEntry record */
export interface SubEngineCatalogEntry {
  id: SubEngineId;
  label: string;
  description: string;
  status: SubEngineStatus;
  enabled: boolean;
  note: string | null;
  features: FeatureCatalogEntry[];
}

/** Response shape of GET /engine/catalog */
export interface EngineCatalog {
  subEngines: SubEngineCatalogEntry[];
}

// ── Live engine config types ────────────────────────────────────────────────

export interface FeatureConfig {
  enabled: boolean;
  score: number;
  params: Record<string, any>;
}

export interface RawTransactionSection {
  enabled: boolean;
  features: Record<string, FeatureConfig>;
}

export interface SubEngineSection {
  enabled: boolean;
  note?: string;
  features?: Record<string, FeatureConfig>;
}

export interface EngineConfigRules {
  alertThreshold: number;
  rawTransaction: RawTransactionSection;
  party?: SubEngineSection;
  channel?: SubEngineSection;
  device?: SubEngineSection;
  geo?: SubEngineSection;
  beneficiary?: SubEngineSection;
  finacleMapping?: {
    canonicalToSource: Record<string, string>;
  };
  /** @deprecated kept for backward compat */
  rawSubEngineEnabled?: boolean;
  /** @deprecated kept for backward compat */
  features?: Record<string, FeatureConfig>;
}

// ── Backwards-compat alias so existing rules.ts / view-rules.ts still compile ─
/** @deprecated use FeatureCatalogEntry */
export type RawFeatureDef = FeatureCatalogEntry;
/** @deprecated use ParamSpec */
export type ParamDef = ParamSpec;

/** A flat row derived from EngineConfigRules.rawTransaction.features for display in the table. */
export interface EngineFeatureRow {
  featureId: string;
  featureName: string;
  enabled: boolean;
  score: number;
  params: Record<string, any>;
  _expanded?: boolean;
  showParams?: boolean;
}

// ── Screening types ─────────────────────────────────────────────────────────

export interface ScreenResult {
  context: any;
  hits: FeatureHit[];
  score: number;
  severity: string;
  alert: boolean;
}

export interface FeatureHit {
  featureId: string;
  context: string;
  score: number;
  reason: string;
  evidence: Record<string, any>;
}

export interface ScreenRequest {
  row: Record<string, any>;
  overlay?: any;
}

export interface ChannelRequest {
  transaction: RawTransactionEvent;
  overlay?: DigitalChannelOverlay;
}

export interface RawTransactionEvent {
  transactionId: string;
  customerId: string;
  accountId: string;
  amount: number;
  currency: string;
  type: string;
  channel: string;
  timestamp: string;
  beneficiaryAccountId?: string;
  narration?: string;
  deviceId?: string;
  ipAddress?: string;
  sessionId?: string;
  newDevice?: boolean;
  counterpartyName?: string;
  counterpartyBankCode?: string;
  counterpartyCountry?: string;
}

export interface DigitalChannelOverlay {
  deviceId?: string;
  ipAddress?: string;
  sessionId?: string;
  newDevice?: boolean;
}

// ── Config management types ─────────────────────────────────────────────────

/** Mirror of backend EngineConfigEntity (audit history rows). */
export interface EngineConfigEntity {
  id: number;
  active: boolean;
  alertThreshold: number;
  configJson?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

// ── Service ─────────────────────────────────────────────────────────────────

@Injectable({
  providedIn: 'root',
})
export class RulesService {
  private baseUrl = `${environment.apiUrl}/api/v1/engine`;

  constructor(private http: HttpClient) {}

  // ════════ Catalogue ════════

  /** One UI bootstrap response containing every subengine and its feature catalogue. */
  getCatalog(): Observable<ApiResponse<EngineCatalog>> {
    return this.http.get<ApiResponse<EngineCatalog>>(`${this.baseUrl}/catalog`);
  }

  /** Returns one subengine's catalogue for lazy-loaded UI views. */
  getSubEngineCatalog(
    subEngineId: SubEngineId
  ): Observable<ApiResponse<SubEngineCatalogEntry>> {
    return this.http.get<ApiResponse<SubEngineCatalogEntry>>(
      `${this.baseUrl}/catalog/${subEngineId}`
    );
  }

  // ════════ Engine config ════════

  /** Get the current live engine configuration. */
  getConfig(): Observable<ApiResponse<EngineConfigRules>> {
    return this.http.get<ApiResponse<EngineConfigRules>>(
      `${this.baseUrl}/config`
    );
  }

  /** Create a new engine config (becomes the candidate for activation). */
  createConfig(
    config: EngineConfigRules
  ): Observable<ApiResponse<EngineConfigRules>> {
    return this.http.post<ApiResponse<EngineConfigRules>>(
      `${this.baseUrl}/config`,
      config
    );
  }

  /** Activate an existing config by id. */
  activateConfig(id: number): Observable<ApiResponse<EngineConfigRules>> {
    return this.http.put<ApiResponse<EngineConfigRules>>(
      `${this.baseUrl}/config`,
      null,
      { params: { id: id.toString() } }
    );
  }

  /** Config change audit trail. */
  getConfigHistory(): Observable<ApiResponse<EngineConfigEntity[]>> {
    return this.http.get<ApiResponse<EngineConfigEntity[]>>(
      `${this.baseUrl}/config/history`
    );
  }

  /** Change the global alert threshold. */
  patchAlertThreshold(
    alertThreshold: number
  ): Observable<ApiResponse<EngineConfigRules>> {
    return this.http.patch<ApiResponse<EngineConfigRules>>(
      `${this.baseUrl}/config`,
      { alertThreshold }
    );
  }

  /** Enable or disable an implemented subengine. */
  patchSubEngine(
    subEngineId: SubEngineId,
    enabled: boolean
  ): Observable<ApiResponse<EngineConfigRules>> {
    return this.http.patch<ApiResponse<EngineConfigRules>>(
      `${this.baseUrl}/subengines/${subEngineId}`,
      { enabled }
    );
  }

  /** Patch one feature using its subengine-scoped identifier and settings. */
  patchFeature(
    subEngineId: SubEngineId,
    featureId: string,
    body: { enabled?: boolean; score?: number; params?: Record<string, any> }
  ): Observable<ApiResponse<EngineConfigRules>> {
    return this.http.patch<ApiResponse<EngineConfigRules>>(
      `${this.baseUrl}/subengines/${subEngineId}/features/${featureId}`,
      body
    );
  }

  // ════════ Ingest mapping ════════

  /** Replace the Finacle → canonical field mapping used by the ingest adapter. */
  replaceFinacleMapping(
    canonicalToSource: Record<string, string>
  ): Observable<ApiResponse<EngineConfigRules>> {
    return this.http.put<ApiResponse<EngineConfigRules>>(
      `${this.baseUrl}/ingest/mapping`,
      canonicalToSource
    );
  }

  // ════════ Screening ════════

  /** Manually screen a raw Finacle row (for officer testing). */
  screenTransaction(
    req: ScreenRequest
  ): Observable<ApiResponse<ScreenResult>> {
    return this.http.post<ApiResponse<ScreenResult>>(
      `${this.baseUrl}/screen`,
      req
    );
  }

  /** Production/core-banking intake. */
  ingestCore(req: ScreenRequest): Observable<ApiResponse<ScreenResult>> {
    return this.http.post<ApiResponse<ScreenResult>>(
      `${this.baseUrl}/ingest/core`,
      req
    );
  }

  /** Channel intake for already-normalized events. */
  ingestChannel(req: ChannelRequest): Observable<ApiResponse<ScreenResult>> {
    return this.http.post<ApiResponse<ScreenResult>>(
      `${this.baseUrl}/ingest/channel`,
      req
    );
  }

  // ════════ Results ════════

  /** Get scores for a single transaction. */
  getScores(transactionId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.baseUrl}/results/${transactionId}`
    );
  }

  /** Paginated alert transactions. */
  getAlerts(page = 0, size = 20): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/results`, {
      params: { page: page.toString(), size: size.toString() },
    });
  }
}