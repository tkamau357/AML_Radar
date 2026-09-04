import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/data/api-response';
import { environment } from '../../../environments/environment';

export interface RawFeatureDef {
  id: string;
  label: string;
  blurb: string;
  readsFields: string[];
  needsHistory: boolean;
  params: ParamDef[];
  defaultScore: number;
  enabledByDefault: boolean;
  defaultParams: Record<string, any>;
}

export interface ParamDef {
  key: string;
  kind: string;          // NUMBER | DECIMAL | ENUM | STRING | STRING_LIST
  label: string;
  hint: string | null;
  meaning: string;
  engineUse: string;
  allowedValues: string[];
  defaultValue: any;
  exampleValue: any;
  uiControl: string;     // SELECT | NUMBER_INPUT | TEXT_INPUT | MULTI_SELECT | TAG_INPUT
  inputFormat: string;
  emptyValueMeaning: string;
}

export interface EngineConfigRules {
  rawSubEngineEnabled: boolean;
  alertThreshold: number;
  features: Record<string, FeatureConfig>;
}

export interface FeatureConfig {
  enabled: boolean;
  score: number;
  params: Record<string, any>;
}

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

@Injectable({
  providedIn: 'root',
})
export class RulesService {
  private baseUrl = `${environment.apiUrl}/api/v1/engine`;

  constructor(private http: HttpClient) {}

  // ============ Catalog & Config ============

  getCatalog(): Observable<ApiResponse<RawFeatureDef[]>> {
    return this.http.get<ApiResponse<RawFeatureDef[]>>(`${this.baseUrl}/catalog`);
  }

  getConfig(): Observable<ApiResponse<EngineConfigRules>> {
    return this.http.get<ApiResponse<EngineConfigRules>>(`${this.baseUrl}/config`);
  }

  // ============ Patch Operations ============

  patchSubEngine(body: { enabled?: boolean; alertThreshold?: number }): Observable<ApiResponse<EngineConfigRules>> {
    return this.http.patch<ApiResponse<EngineConfigRules>>(`${this.baseUrl}/raw`, body);
  }

  patchFeature(
    id: string,
    body: { enabled?: boolean; score?: number; params?: Record<string, any> }
  ): Observable<ApiResponse<EngineConfigRules>> {
    return this.http.patch<ApiResponse<EngineConfigRules>>(`${this.baseUrl}/raw/features/${id}`, body);
  }

  // ============ Ingest Mapping ============

  replaceFinacleMapping(mapping: Record<string, string>): Observable<ApiResponse<EngineConfigRules>> {
    return this.http.put<ApiResponse<EngineConfigRules>>(`${this.baseUrl}/ingest/mapping`, mapping);
  }

  // ============ Screening ============

  screenTransaction(req: ScreenRequest): Observable<ApiResponse<ScreenResult>> {
    return this.http.post<ApiResponse<ScreenResult>>(`${this.baseUrl}/screen`, req);
  }

  ingestCore(req: ScreenRequest): Observable<ApiResponse<ScreenResult>> {
    return this.http.post<ApiResponse<ScreenResult>>(`${this.baseUrl}/ingest/core`, req);
  }

  ingestChannel(req: ChannelRequest): Observable<ApiResponse<ScreenResult>> {
    return this.http.post<ApiResponse<ScreenResult>>(`${this.baseUrl}/ingest/channel`, req);
  }
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