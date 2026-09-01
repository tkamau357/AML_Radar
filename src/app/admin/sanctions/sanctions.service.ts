import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/data/api-response';
import { PagedResponse } from '../../shared/data/paginated-response';

// ==================== ENUMS ====================
export type AcquisitionMode = 'API' | 'FILE_DOWNLOAD' | 'SFTP' | 'DATABASE' | 'MANUAL_UPLOAD';
export type SyncStatus = 'SUCCESS' | 'FAILED' | 'PARTIAL' | 'IN_PROGRESS' | 'PENDING' | 'COMPLETED' | 'COMPLETED_WITH_ERRORS';
export type SyncTrigger = 'MANUAL' | 'SCHEDULED' | 'API';
export type SyncStrategyType = 'FULL_REPLACE' | 'DELTA_ONLY' | 'HYBRID' | 'INCREMENTAL';

// ==================== SOURCE CONFIG MODELS ====================
export interface SourceConfigResponse {
  id: number;
  source: string;
  displayName: string;
  description: string;
  enabled: boolean;
  acquisitionMode: AcquisitionMode;
  acquisitionConfig: Record<string, any>;
  syncCron: string;
  syncEnabled: boolean;
  // Sync Strategy Configuration
  syncStrategy: SyncStrategyType | null;
  deltaAdditionsUrl: string | null;
  deltaDeletionsUrl: string | null;
  deltaChangesUrl: string | null;
  fullReconciliationCron: string | null;
  lastFullSyncAt: string | null;
  incrementalField: string | null;
  uniqueIdField: string | null;
  hashFields: string | null;
  retentionDays: number | null;
  // Thresholds
  hitThresholdOverride: number | null;
  potentialThresholdOverride: number | null;
  matchThresholdOverride: number | null;
  mappingTemplateId: string | null;
  // Sync Status
  lastSyncAt: string | null;
  lastSyncStatus: SyncStatus | null;
  lastSyncError: string | null;
  entryCount: number;
  version: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SourceConfigRequest {
  source: string;
  displayName?: string;
  description?: string;
  enabled?: boolean;
  acquisitionMode?: AcquisitionMode;
  acquisitionConfig?: Record<string, any>;
  syncCron?: string;
  syncEnabled?: boolean;
  // Sync Strategy Configuration
  syncStrategy?: SyncStrategyType;
  deltaAdditionsUrl?: string;
  deltaDeletionsUrl?: string;
  deltaChangesUrl?: string;
  fullReconciliationCron?: string;
  incrementalField?: string;
  uniqueIdField?: string;
  hashFields?: string;
  retentionDays?: number;
  // Thresholds
  hitThresholdOverride?: number;
  potentialThresholdOverride?: number;
  matchThresholdOverride?: number;
  mappingTemplateId?: string;
}

export interface SyncHistoryResponse {
  id: number;
  source: string;
  startedAt: string;
  completedAt: string | null;
  status: SyncStatus;
  entriesAdded: number;
  entriesUpdated: number;
  entriesRemoved: number;
  entriesSkipped: number;
  totalProcessed: number;
  durationMs: number | null;
  errorMessage: string | null;
  triggeredBy: SyncTrigger;
  triggeredByUser: string | null;
}

// ==================== REQUEST MODELS ====================
export interface ManualEntryRequest {
  source: string;
  sourceEntryId?: string;
  entityType: string;
  fullName: string;
  aliases?: string[];
  dateOfBirth?: string;
  placeOfBirth?: string;
  nationality?: string;
  idNumber?: string;
  pinNumber?: string;
  passportNumber?: string;
  address?: string;
  program?: string;
  listedDate?: string;
  remarks?: string;
  gazetteNotice?: string;
  caseReference?: string;
}

export interface BulkUploadRequest {
  source: string;
  entries: ManualEntryRequest[];
  replaceExisting?: boolean;
}

// ==================== RESPONSE MODELS ====================
export interface SanctionEntryResponse {
  id: number;
  source: string;
  sourceDisplayName: string;
  sourceEntryId?: string;
  entityType: string;
  fullName: string;
  aliases?: string[];
  dateOfBirth?: string;
  placeOfBirth?: string;
  nationality?: string;
  program?: string;
  listedDate?: string;
  remarks?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SanctionListResponse {
  id: number;
  source: string;
  displayName: string;
  description: string;
  sourceUrl: string;
  enabled: boolean;
  lastSyncAt: string;
  entryCount: number;
  lastSyncStatus: string;
}

export interface SanctionListSourceInfo {
  source: string;
  displayName: string;
  description: string;
  autoSyncAvailable: boolean;
}

export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

// ==================== COMPARISON MODELS ====================
export interface MatchResult {
  entryId: number;
  fullName: string;
  matchedOn: string;
  score: number;
  source: string;
  sourceDisplayName: string;
  entityType: string;
  dateOfBirth?: string;
  nationality?: string;
  program?: string;
  listedDate?: string;
  aliases?: string[];
}

export interface ScreeningResponse {
  screeningId: string;
  searchedName: string;
  matchCount: number;
  status: string;
  matches: MatchResult[];
  sourcesSearched: string[];
  thresholdUsed: number;
  durationMs: number;
  timestamp: string;
}

export interface ScreeningRequest {
  name: string;
  sources?: string[];
  matchThreshold?: number;
  maxResults?: number;
  country?: string;
  dateOfBirth?: string;
  entityType?: string;
  hitThreshold?: number;
  potentialThreshold?: number;
}

@Injectable({
  providedIn: 'root',
})
export class SanctionsService {
  private apiUrl = `${environment.apiUrl}/api/v1/sanctions`;
  private configUrl = `${environment.apiUrl}/api/v1/config/sources`;

  constructor(private http: HttpClient) {}

  // ==================== SOURCE CONFIGURATION ====================
  
  /** GET /config/sources - Get all source configs (paginated) */
  getSourceConfigs(params: { page?: number; size?: number; sortBy?: string; sortDir?: string } = {}): Observable<PageResponse<SourceConfigResponse>> {
    let httpParams = new HttpParams();
    if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
    if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params.sortDir) httpParams = httpParams.set('sortDir', params.sortDir);
    
    return this.http.get<ApiResponse<PageResponse<SourceConfigResponse>>>(this.configUrl, { params: httpParams }).pipe(
      map(response => response.result)
    );
  }

  /** GET /config/sources/list - Get all source configs (non-paginated, for dropdowns) */
  getSourceConfigsList(): Observable<SourceConfigResponse[]> {
    return this.http.get<ApiResponse<SourceConfigResponse[]>>(`${this.configUrl}/list`).pipe(
      map(response => response.result || [])
    );
  }

  getSourceConfig(source: string): Observable<SourceConfigResponse> {
    return this.http.get<ApiResponse<SourceConfigResponse>>(`${this.configUrl}/${source}`).pipe(
      map(response => response.result)
    );
  }

  createSourceConfig(request: SourceConfigRequest): Observable<SourceConfigResponse> {
    return this.http.post<ApiResponse<SourceConfigResponse>>(this.configUrl, request).pipe(
      map(response => response.result)
    );
  }

  updateSourceConfig(source: string, request: SourceConfigRequest): Observable<SourceConfigResponse> {
    return this.http.put<ApiResponse<SourceConfigResponse>>(`${this.configUrl}/${source}`, request).pipe(
      map(response => response.result)
    );
  }

  disableSource(source: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.configUrl}/${source}`).pipe(
      map(() => {})
    );
  }

  enableSource(source: string): Observable<SourceConfigResponse> {
    return this.http.post<ApiResponse<SourceConfigResponse>>(`${this.configUrl}/${source}/enable`, null).pipe(
      map(response => response.result)
    );
  }

  getSyncHistory(source: string, page: number = 0, size: number = 10): Observable<PageResponse<SyncHistoryResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<PageResponse<SyncHistoryResponse>>>(`${this.configUrl}/${source}/sync-history`, { params }).pipe(
      map(response => response.result)
    );
  }

  testSourceConnection(source: string): Observable<string> {
    return this.http.post<ApiResponse<string>>(`${this.configUrl}/${source}/test`, null).pipe(
      map(response => response.result || 'OK')
    );
  }

  // ==================== SCREENING ====================
  screen(request: ScreeningRequest): Observable<ScreeningResponse> {
    return this.http.post<ApiResponse<ScreeningResponse>>(`${this.apiUrl}/screen`, request).pipe(
      map(response => response.result)
    );
  }

  // ==================== LIST MANAGEMENT ====================
  getLists(): Observable<SanctionListResponse[]> {
    return this.http.get<ApiResponse<SanctionListResponse[]>>(`${this.apiUrl}/lists`).pipe(
      map(response => response.result || [])
    );
  }

  getSources(): Observable<SanctionListSourceInfo[]> {
    return this.http.get<ApiResponse<SanctionListSourceInfo[]>>(`${this.apiUrl}/lists/sources`).pipe(
      map(response => response.result || [])
    );
  }

  getList(source: string): Observable<SanctionListResponse> {
    return this.http.get<ApiResponse<SanctionListResponse>>(`${this.apiUrl}/lists/detail`, {
      params: new HttpParams().set('source', source)
    }).pipe(
      map(response => response.result)
    );
  }

  syncList(source: string): Observable<string> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/lists/sync`, null, {
      params: new HttpParams().set('source', source)
    }).pipe(
      map(response => response.result || 'Sync started')
    );
  }

  syncAll(): Observable<string> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/lists/sync-all`, null).pipe(
      map(response => response.result || 'Sync started')
    );
  }

  // ==================== ENTRY MANAGEMENT ====================
  addEntry(request: ManualEntryRequest): Observable<SanctionEntryResponse> {
    return this.http.post<ApiResponse<SanctionEntryResponse>>(`${this.apiUrl}/entries`, request).pipe(
      map(response => response.result)
    );
  }

  bulkUpload(request: BulkUploadRequest): Observable<string> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/entries/bulk`, request).pipe(
      map(response => response.result || 'Upload completed')
    );
  }

  uploadExcel(source: string, file: File, replaceExisting: boolean = false): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    const params = new HttpParams()
      .set('source', source)
      .set('replaceExisting', replaceExisting.toString());
    
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/entries/upload`, formData, {
      params
    }).pipe(
      map(response => response.result || 'Upload completed')
    );
  }

  downloadTemplate(source: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/entries/template`, {
      params: new HttpParams().set('source', source),
      responseType: 'blob'
    });
  }

  // ==================== ENTRY BROWSING ====================
  getEntries(source: string, page: number = 0, size: number = 20): Observable<PageResponse<SanctionEntryResponse>> {
    const params = new HttpParams()
      .set('source', source)
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<ApiResponse<PageResponse<SanctionEntryResponse>>>(`${this.apiUrl}/entries`, { params }).pipe(
      map(response => response.result)
    );
  }

  getEntry(id: number): Observable<SanctionEntryResponse> {
    return this.http.get<ApiResponse<SanctionEntryResponse>>(`${this.apiUrl}/entries/detail`, {
      params: new HttpParams().set('id', id.toString())
    }).pipe(
      map(response => response.result)
    );
  }

  deleteEntry(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/entries`, {
      params: new HttpParams().set('id', id.toString())
    }).pipe(
      map(() => {})
    );
  }

  deactivateEntry(id: number): Observable<void> {
    return this.http.patch<ApiResponse<void>>(`${this.apiUrl}/entries/deactivate`, null, {
      params: new HttpParams().set('id', id.toString())
    }).pipe(
      map(() => {})
    );
  }
}