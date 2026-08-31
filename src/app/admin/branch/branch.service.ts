import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PagedResponse, PaginationParams, buildPaginationParams } from '../../shared/data/paginated-response';
import { ApiResponse } from '../../shared/data/api-response';

export interface BranchResponse {
  id: number;
  branchCode: string;
  branchName: string;
  branchType?: string;
  region?: string;
  address?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBranchRequest {
  branchCode: string;
  branchName: string;
  branchType?: string;
  region?: string;
  address?: string;
  status?: string;
}

@Injectable({
  providedIn: 'root',
})
export class BranchService {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/branches`;

  constructor(private http: HttpClient) {}

  /** GET /branches - Get all branches (paginated) */
  getAllBranches(params: PaginationParams = {}): Observable<PagedResponse<BranchResponse>> {
    const httpParams = new HttpParams({ fromObject: buildPaginationParams(params) });
    return this.http.get<ApiResponse<PagedResponse<BranchResponse>>>(this.apiUrl, { params: httpParams })
      .pipe(map(res => res.result));
  }

  /** GET /branches/list - Get all branches (list for dropdowns) */
  getBranchesList(): Observable<BranchResponse[]> {
    return this.http.get<ApiResponse<BranchResponse[]>>(`${this.apiUrl}/list`)
      .pipe(map(res => res.result));
  }

  /** GET /branches/active - Get all active branches */
  getActiveBranches(): Observable<BranchResponse[]> {
    return this.http.get<ApiResponse<BranchResponse[]>>(`${this.apiUrl}/active`)
      .pipe(map(res => res.result));
  }

  /** GET /branches/{code} - Get branch by code */
  getBranchByCode(code: string): Observable<BranchResponse> {
    return this.http.get<ApiResponse<BranchResponse>>(`${this.apiUrl}/${code}`)
      .pipe(map(res => res.result));
  }

  /** GET /branches/{id} - Get branch by ID (legacy support) */
  getBranchById(id: number): Observable<BranchResponse> {
    return this.http.get<ApiResponse<BranchResponse>>(`${this.apiUrl}/${id}`)
      .pipe(map(res => res.result));
  }

  /** POST /branches - Create new branch */
  createBranch(branch: CreateBranchRequest): Observable<BranchResponse> {
    return this.http.post<ApiResponse<BranchResponse>>(this.apiUrl, branch)
      .pipe(map(res => res.result));
  }

  /** PUT /branches/{code} - Update branch by code */
  updateBranchByCode(code: string, branch: CreateBranchRequest): Observable<BranchResponse> {
    return this.http.put<ApiResponse<BranchResponse>>(`${this.apiUrl}/${code}`, branch)
      .pipe(map(res => res.result));
  }

  /** PUT /branches/{id} - Update branch by ID (legacy support) */
  updateBranch(id: number, branch: Partial<BranchResponse>): Observable<BranchResponse> {
    return this.http.put<ApiResponse<BranchResponse>>(`${this.apiUrl}/${id}`, branch)
      .pipe(map(res => res.result));
  }

  /** DELETE /branches/{code} - Delete branch by code */
  deleteBranchByCode(code: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${code}`)
      .pipe(map(() => void 0));
  }

  /** DELETE /branches/{id} - Delete branch by ID (legacy support) */
  deleteBranch(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`)
      .pipe(map(() => void 0));
  }

  /** GET /branches/template - Download branch upload template */
  downloadTemplate(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/template`, {
      responseType: 'blob'
    });
  }

  /** POST /branches/upload - Upload branches from Excel file */
  uploadBranches(file: File): Observable<BranchResponse[]> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<BranchResponse[]>>(`${this.apiUrl}/upload`, formData)
      .pipe(map(res => res.result));
  }

  /** PATCH /branches/{id}/status - Change branch status (legacy) */
  changeBranchStatus(id: number, status: string): Observable<BranchResponse> {
    return this.http.patch<ApiResponse<BranchResponse>>(`${this.apiUrl}/${id}/status`, null, {
      params: new HttpParams().set('status', status),
    }).pipe(map(res => res.result));
  }
}
