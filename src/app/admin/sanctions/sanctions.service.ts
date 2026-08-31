import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// ==================== REQUEST MODELS ====================

export interface ScreeningRequest {
  name: string;
  source?: string;
  threshold?: number;
  limit?: number;
}

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

export interface MatchResult {
  entryId: number;
  fullName: string;
  source: string;
  similarity: number;
  matchType: string;
  referenceNumber?: string;
  reason?: string;
}

export interface ScreeningResponse {
  searchName: string;
  matches: MatchResult[];
  matchCount: number;
  processingTimeMs: number;
}

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
  idNumber?: string;
  pinNumber?: string;
  passportNumber?: string;
  address?: string;
  program?: string;
  listedDate?: string;
  remarks?: string;
  gazetteNotice?: string;
  caseReference?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SanctionListResponse {
  source: string;
  displayName: string;
  entryCount: number;
  active: boolean;
  lastSyncedAt?: string;
  isAutoSync: boolean;
}

// ==================== COMPARISON MODELS ====================

export interface MethodResult {
  method: string;
  durationMs: number;
  matchCount: number;
  topMatches: MatchResult[];
}

export interface IndexStats {
  entryCount: number;
  wordCount: number;
  avgWordsPerEntry: number;
  memoryUsageBytes: number;
}

export interface ScreeningComparison {
  searchedName: string;
  fast: MethodResult;
  legacy: MethodResult;
  speedup: string;
  indexStats: IndexStats;
}

export interface SanctionListSourceInfo {
  source: string;
  displayName: string;
  description: string;
  autoSyncAvailable: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class SanctionsService {
  private apiUrl = `${environment.apiUrl}/api/v1/sanctions`;

  constructor(private http: HttpClient) {}

  // ==================== SCREENING ====================

  screen(request: ScreeningRequest): Observable<ScreeningResponse> {
    return this.http.post<ScreeningResponse>(`${this.apiUrl}/screen`, request);
  }

  screenLegacy(request: ScreeningRequest): Observable<ScreeningResponse> {
    return this.http.post<ScreeningResponse>(`${this.apiUrl}/screen/legacy`, request);
  }

  screenBatch(requests: ScreeningRequest[]): Observable<ScreeningResponse[]> {
    return this.http.post<ScreeningResponse[]>(`${this.apiUrl}/screen/batch`, requests);
  }

  compareScreening(name: string): Observable<ScreeningComparison> {
    return this.http.get<ScreeningComparison>(`${this.apiUrl}/screen/compare`, {
      params: new HttpParams().set('name', name)
    });
  }

  // ==================== LIST MANAGEMENT ====================

  getLists(): Observable<SanctionListResponse[]> {
    return this.http.get<SanctionListResponse[]>(`${this.apiUrl}/lists`);
  }

  getList(source: string): Observable<SanctionListResponse> {
    return this.http.get<SanctionListResponse>(`${this.apiUrl}/lists/${source}`);
  }

  syncList(source: string): Observable<string> {
    return this.http.post(`${this.apiUrl}/lists/${source}/sync`, null, {
      responseType: 'text'
    });
  }

  syncAll(): Observable<string> {
    return this.http.post(`${this.apiUrl}/lists/sync-all`, null, {
      responseType: 'text'
    });
  }

  // ==================== SOURCES INFO ====================

  getSources(): Observable<SanctionListSourceInfo[]> {
    return this.http.get<SanctionListSourceInfo[]>(`${this.apiUrl}/sources`);
  }

  getKenyaSources(): Observable<SanctionListSourceInfo[]> {
    return this.http.get<SanctionListSourceInfo[]>(`${this.apiUrl}/sources/kenya`);
  }

  // ==================== ENTRY MANAGEMENT ====================

  addEntry(request: ManualEntryRequest): Observable<SanctionEntryResponse> {
    return this.http.post<SanctionEntryResponse>(`${this.apiUrl}/entries`, request);
  }

  updateEntry(id: number, request: ManualEntryRequest): Observable<SanctionEntryResponse> {
    return this.http.put<SanctionEntryResponse>(`${this.apiUrl}/entries/${id}`, request);
  }

  bulkUpload(request: BulkUploadRequest): Observable<string> {
    return this.http.post(`${this.apiUrl}/entries/bulk`, request, {
      responseType: 'text'
    });
  }

  uploadExcel(source: string, file: File, replaceExisting: boolean = false): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    const params = new HttpParams().set('replaceExisting', replaceExisting.toString());
    return this.http.post(`${this.apiUrl}/entries/upload`, formData, {
      params,
      responseType: 'text'
    });
  }

  downloadTemplate(source: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/entries/template`, {
      params: new HttpParams().set('source', source),
      responseType: 'blob'
    });
  }

  // ==================== ENTRY BROWSING ====================

  getEntries(source: string, page: number = 0, size: number = 20): Observable<any> {
    const params = new HttpParams()
      .set('source', source)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(`${this.apiUrl}/entries`, { params });
  }

  getEntry(id: number): Observable<SanctionEntryResponse> {
    return this.http.get<SanctionEntryResponse>(`${this.apiUrl}/entries/detail`, {
      params: new HttpParams().set('id', id.toString())
    });
  }

  deleteEntry(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/entries`, {
      params: new HttpParams().set('id', id.toString())
    });
  }

  deactivateEntry(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/entries/deactivate`, null, {
      params: new HttpParams().set('id', id.toString())
    });
  }

  // ==================== BENCHMARK & INDEX ====================

  benchmark(name: string, iterations: number = 100): Observable<any> {
    const params = new HttpParams()
      .set('name', name)
      .set('iterations', iterations.toString());
    return this.http.get<any>(`${this.apiUrl}/benchmark`, { params });
  }

  getIndexStats(): Observable<IndexStats> {
    return this.http.get<IndexStats>(`${this.apiUrl}/index/stats`);
  }

  rebuildIndex(): Observable<string> {
    return this.http.post(`${this.apiUrl}/index/rebuild`, null, {
      responseType: 'text'
    });
  }
}