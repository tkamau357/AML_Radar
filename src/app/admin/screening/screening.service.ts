import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// ============ API RESPONSE HELPERS ============

/**
 * Standard API response wrapper matching backend ApiResponse<T>
 */
export interface ApiResponse<T> {
  id: string;
  message: string;
  result: T;
  timestamp: string;
}

/**
 * Helper to extract result from ApiResponse
 */
export function extractResult<T>(response: ApiResponse<T>): T {
  return response.result;
}

// ============ PAGINATION HELPERS ============

/**
 * Standard Spring Boot Page response structure
 */
export interface PagedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      empty: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    empty: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  empty: boolean;
}

/**
 * Pagination request parameters
 */
export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
}

/**
 * Helper to build query params for pagination
 */
export function buildPaginationParams(params: PaginationParams): { [key: string]: string } {
  const result: { [key: string]: string } = {};
  if (params.page !== undefined) result['page'] = params.page.toString();
  if (params.size !== undefined) result['size'] = params.size.toString();
  if (params.sort) result['sort'] = params.sort;
  return result;
}

// ============ REQUEST MODELS ============

export interface ScreeningRequest {
  name: string;
  sources?: SanctionListSource[];
  matchThreshold?: number;
  maxResults?: number;
  country?: string;
  dateOfBirth?: string;
  entityType?: string;
  hitThreshold?: number;
  potentialThreshold?: number;
}

export interface ScreeningConfigUpdateRequest {
  matchThreshold?: number;
  hitThreshold?: number;
  potentialThreshold?: number;
  reviewThreshold?: number;
  maxCandidates?: number;
  maxResults?: number;
  cacheEnabled?: boolean;
  cacheTtlMinutes?: number;
  batchParallelism?: number;
  indexRebuildCron?: string;
  syncCron?: string;
  syncOnStartup?: boolean;
  syncRetryMax?: number;
  syncRetryDelayMinutes?: number;
}

export interface MappingTemplateRequest {
  templateId: string;
  name: string;
  description?: string;
  sourceFormat: SourceFormat;
  rootPath?: string;
  fieldMappings: Record<string, string>;
  transformations?: Record<string, any>;
  validations?: Record<string, string>;
}

export interface BatchScreeningRequest {
  requests: ScreeningRequest[];
}

// ============ RESPONSE MODELS ============

export interface ScreeningResponse {
  screeningId: string;
  searchedName: string;
  matchCount: number;
  status: ScreeningStatus;
  matches: MatchResult[];
  sourcesSearched: string[];
  thresholdUsed: number;
  durationMs: number;
  timestamp: string;
  entityType?: string;
  country?: string;
}

export interface MatchResult {
  entryId: string;
  fullName: string;
  source: string;
  sourceType: string;
  score: number;
  matchType: MatchType;
  matchedFields: string[];
  listedDate?: string;
  country?: string;
  entityType?: string;
  riskLevel?: RiskLevel;
}

export interface ScreeningConfigResponse {
  thresholds: {
    match: number;
    hit: number;
    potential: number;
    review: number;
  };
  limits: {
    maxCandidates: number;
    maxResults: number;
  };
  cache: {
    enabled: boolean;
    ttlMinutes: number;
  };
  batch: {
    parallelism: number;
  };
  index: {
    rebuildCron: string;
  };
  sync: {
    cron: string;
    onStartup: boolean;
    retryMax: number;
    retryDelayMinutes: number;
  };
}

export interface ResolvedScreeningConfig {
  global: ScreeningConfigResponse;
  sourceOverrides: Record<string, Partial<ScreeningConfigResponse>>;
  effective: ScreeningConfigResponse;
}

export interface MappingTemplateResponse {
  id: number;
  templateId: string;
  name: string;
  description: string;
  sourceFormat: SourceFormat;
  rootPath: string;
  fieldMappings: Record<string, string>;
  transformations: Record<string, any>;
  validations: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

// ============ ENUMS ============

export enum SanctionListSource {
  OFAC_SDN = 'OFAC_SDN',
  OFAC_NS = 'OFAC_NS',
  EU = 'EU',
  UN = 'UN',
  UK = 'UK',
  INTERPOL = 'INTERPOL',
  PEP = 'PEP',
  CUSTOM = 'CUSTOM'
}

export enum SourceFormat {
  JSON = 'JSON',
  XML = 'XML',
  CSV = 'CSV',
  HTML = 'HTML',
  PDF = 'PDF'
}

export enum ScreeningStatus {
  COMPLETED = 'COMPLETED',
  PARTIAL = 'PARTIAL',
  FAILED = 'FAILED',
  PENDING = 'PENDING'
}

export enum MatchType {
  HIT = 'HIT',
  POTENTIAL = 'POTENTIAL',
  REVIEW = 'REVIEW'
}

export enum RiskLevel {
  HIGH = 'HIGH',
  MEDIUM_HIGH = 'MEDIUM_HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export enum ScreeningCategory {
  PEP = 'PEP',
  SANCTIONS = 'SANCTIONS',
  WATCHLIST = 'WATCHLIST',
  ADVERSE_MEDIA = 'ADVERSE_MEDIA',
  CRYPTO = 'CRYPTO',
  FIU_WATCHLIST = 'FIU_WATCHLIST',
  CRIMINAL_WANTED = 'CRIMINAL_WANTED',
  INTERNAL = 'INTERNAL',
  REGULATORY_DUE_DILIGENCE = 'REGULATORY_DUE_DILIGENCE', 
  ANTI_CORRUPTION = 'ANTI_CORRUPTION',
  REGIONAL = 'REGIONAL', 
}

@Injectable({
  providedIn: 'root',
})
export class ScreeningService {
  private baseUrl = `${environment.apiUrl}/api/v1`;
  private configUrl = `${this.baseUrl}/config`;
  private sanctionBaseUrl = `${this.baseUrl}/sanctions`;

  constructor(private http: HttpClient) { }

  // ============ SCREENING ENDPOINTS (from ScreeningController) ============

  /**
   * Screen a name against sanction lists
   * POST /sanctions/screen
   */
  screen(request: ScreeningRequest): Observable<ScreeningResponse> {
    return this.http.post<ApiResponse<ScreeningResponse>>(
      `${this.sanctionBaseUrl}/screen`,
      request
    ).pipe(map(extractResult));
  }

  /**
   * Screen multiple names in batch
   * POST /sanctions/screen/batch
   */
  screenBatch(requests: ScreeningRequest[]): Observable<ScreeningResponse[]> {
    return this.http.post<ApiResponse<ScreeningResponse[]>>(
      `${this.sanctionBaseUrl}/screen/batch`,
      requests
    ).pipe(map(extractResult));
  }

  // ============ SCREENING CONFIGURATION ENDPOINTS ============

  /**
   * Get current screening configuration
   */
  getConfig(): Observable<ScreeningConfigResponse> {
    return this.http.get<ApiResponse<ScreeningConfigResponse>>(
      `${this.configUrl}/screening`
    ).pipe(map(extractResult));
  }

  /**
   * Get resolved configuration with hierarchy applied
   */
  getResolvedConfig(): Observable<ResolvedScreeningConfig> {
    return this.http.get<ApiResponse<ResolvedScreeningConfig>>(
      `${this.configUrl}/screening/resolved`
    ).pipe(map(extractResult));
  }

  /**
   * Update screening configuration
   */
  updateConfig(request: ScreeningConfigUpdateRequest): Observable<ScreeningConfigResponse> {
    return this.http.put<ApiResponse<ScreeningConfigResponse>>(
      `${this.configUrl}/screening`,
      request
    ).pipe(map(extractResult));
  }

  /**
   * Reset configuration to defaults
   */
  resetConfig(): Observable<ScreeningConfigResponse> {
    return this.http.post<ApiResponse<ScreeningConfigResponse>>(
      `${this.configUrl}/screening/reset`,
      {}
    ).pipe(map(extractResult));
  }

  // ============ MAPPING TEMPLATE ENDPOINTS ============

  /**
   * Get all mapping templates
   */
  getMappingTemplates(): Observable<MappingTemplateResponse[]> {
    return this.http.get<ApiResponse<MappingTemplateResponse[]>>(
      `${this.configUrl}/screening/mappings`
    ).pipe(map(extractResult));
  }

  /**
   * Get a specific mapping template
   */
  getMappingTemplate(templateId: string): Observable<MappingTemplateResponse> {
    return this.http.get<ApiResponse<MappingTemplateResponse>>(
      `${this.configUrl}/screening/mappings/${templateId}`
    ).pipe(map(extractResult));
  }

  /**
   * Create a mapping template
   */
  createMappingTemplate(request: MappingTemplateRequest): Observable<MappingTemplateResponse> {
    return this.http.post<ApiResponse<MappingTemplateResponse>>(
      `${this.configUrl}/screening/mappings`,
      request
    ).pipe(map(extractResult));
  }

  /**
   * Update a mapping template
   */
  updateMappingTemplate(templateId: string, request: MappingTemplateRequest): Observable<MappingTemplateResponse> {
    return this.http.put<ApiResponse<MappingTemplateResponse>>(
      `${this.configUrl}/screening/mappings/${templateId}`,
      request
    ).pipe(map(extractResult));
  }

  /**
   * Delete a mapping template
   */
  deleteMappingTemplate(templateId: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(
      `${this.configUrl}/screening/mappings/${templateId}`
    ).pipe(map(extractResult));
  }
}