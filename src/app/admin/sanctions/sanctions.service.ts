import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// ==================== REQUEST/EXPORT MODELS ====================

export interface ScreeningRequest {
  name: string;
  source?: string;
  threshold?: number;
  limit?: number;
}

export interface ManualEntryRequest {
  fullName: string;
  alias?: string;
  source: string;
  referenceNumber?: string;
  category?: string;
  reason?: string;
  dateListed?: string;
  additionalInfo?: Record<string, any>;
}

export interface BulkUploadRequest {
  source: string;
  entries: ManualEntryRequest[];
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
  fullName: string;
  alias?: string;
  source: string;
  referenceNumber?: string;
  category?: string;
  reason?: string;
  dateListed?: string;
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

  /** POST /sanctions/screen - Screen a name against sanction lists (fast phonetic index) */
  screen(request: ScreeningRequest): Observable<ScreeningResponse> {
    return this.http.post<ScreeningResponse>(`${this.apiUrl}/screen`, request);
  }

  /** POST /sanctions/screen/legacy - Screen using legacy DB-based search (slower) */
  screenLegacy(request: ScreeningRequest): Observable<ScreeningResponse> {
    return this.http.post<ScreeningResponse>(`${this.apiUrl}/screen/legacy`, request);
  }

  /** POST /sanctions/screen/batch - Screen multiple names against sanction lists */
  screenBatch(requests: ScreeningRequest[]): Observable<ScreeningResponse[]> {
    return this.http.post<ScreeningResponse[]>(`${this.apiUrl}/screen/batch`, requests);
  }

  /** GET /sanctions/screen/compare - Compare fast vs legacy screening performance */
  compareScreening(name: string): Observable<ScreeningComparison> {
    return this.http.get<ScreeningComparison>(`${this.apiUrl}/screen/compare`, {
      params: new HttpParams().set('name', name)
    });
  }

  // ==================== LIST MANAGEMENT ====================

  /** GET /sanctions/lists - Get all sanction list sources and their status */
  getLists(): Observable<SanctionListResponse[]> {
    return this.http.get<SanctionListResponse[]>(`${this.apiUrl}/lists`);
  }

  /** GET /sanctions/lists/{source} - Get sanction list status by source */
  getList(source: string): Observable<SanctionListResponse> {
    return this.http.get<SanctionListResponse>(`${this.apiUrl}/lists/${source}`);
  }

  /** POST /sanctions/lists/{source}/sync - Trigger sync for a specific sanction list */
  syncList(source: string): Observable<string> {
    return this.http.post(`${this.apiUrl}/lists/${source}/sync`, null, {
      responseType: 'text'
    });
  }

  /** POST /sanctions/lists/sync-all - Trigger sync for all enabled sanction lists */
  syncAll(): Observable<string> {
    return this.http.post(`${this.apiUrl}/lists/sync-all`, null, {
      responseType: 'text'
    });
  }

  // ==================== SOURCES INFO ====================

  /** GET /sanctions/sources - Get available sanction list sources */
  getSources(): Observable<SanctionListSourceInfo[]> {
    return this.http.get<SanctionListSourceInfo[]>(`${this.apiUrl}/sources`);
  }

  /** GET /sanctions/sources/kenya - Get Kenya-specific sanction list sources */
  getKenyaSources(): Observable<SanctionListSourceInfo[]> {
    return this.http.get<SanctionListSourceInfo[]>(`${this.apiUrl}/sources/kenya`);
  }

  // ==================== MANUAL UPLOAD (Kenya Lists) ====================

  /** POST /sanctions/entries - Add a single sanction entry manually */
  addEntry(request: ManualEntryRequest): Observable<SanctionEntryResponse> {
    return this.http.post<SanctionEntryResponse>(`${this.apiUrl}/entries`, request);
  }

  /** POST /sanctions/entries/bulk - Bulk upload sanction entries */
  bulkUpload(request: BulkUploadRequest): Observable<string> {
    return this.http.post(`${this.apiUrl}/entries/bulk`, request, {
      responseType: 'text'
    });
  }

  /** POST /sanctions/entries/upload/{source} - Upload sanction entries from Excel file */
  uploadExcel(source: string, file: File, replaceExisting: boolean = false): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    const params = new HttpParams().set('replaceExisting', replaceExisting.toString());
    return this.http.post(`${this.apiUrl}/entries/upload/${source}`, formData, {
      params,
      responseType: 'text'
    });
  }

  /** GET /sanctions/entries/template/{source} - Download Excel template for manual upload */
  downloadTemplate(source: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/entries/template/${source}`, {
      responseType: 'blob'
    });
  }

  // ==================== ENTRY BROWSING ====================

  /** GET /sanctions/entries - Browse sanction entries by source */
  getEntries(source: string, page: number = 0, size: number = 20): Observable<any> {
    const params = new HttpParams()
      .set('source', source)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(`${this.apiUrl}/entries`, { params });
  }

  /** GET /sanctions/entries/{id} - Get sanction entry details */
  getEntry(id: number): Observable<SanctionEntryResponse> {
    return this.http.get<SanctionEntryResponse>(`${this.apiUrl}/entries/${id}`);
  }

  /** DELETE /sanctions/entries/{id} - Delete a sanction entry */
  deleteEntry(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/entries/${id}`);
  }

  /** PATCH /sanctions/entries/{id}/deactivate - Deactivate a sanction entry (soft delete) */
  deactivateEntry(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/entries/${id}/deactivate`, null);
  }

  // ==================== BENCHMARK & INDEX ====================

  /** GET /sanctions/benchmark - Benchmark screening algorithms */
  benchmark(name: string, iterations: number = 100): Observable<any> {
    const params = new HttpParams()
      .set('name', name)
      .set('iterations', iterations.toString());
    return this.http.get<any>(`${this.apiUrl}/benchmark`, { params });
  }

  /** GET /sanctions/index/stats - Get phonetic index statistics */
  getIndexStats(): Observable<IndexStats> {
    return this.http.get<IndexStats>(`${this.apiUrl}/index/stats`);
  }

  /** POST /sanctions/index/rebuild - Rebuild phonetic index from database */
  rebuildIndex(): Observable<string> {
    return this.http.post(`${this.apiUrl}/index/rebuild`, null, {
      responseType: 'text'
    });
  }
}