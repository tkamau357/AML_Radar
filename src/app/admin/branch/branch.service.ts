import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/data/api-response';
import { PagedResponse, PaginationParams, buildPaginationParams } from '../../shared/data/paginated-response';

export interface BranchResponse {
  id: number;
  branchCode: string;
  branchName: string;
  description?: string;
  address?: string;
  region?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBranchRequest {
  branchCode: string;
  branchName: string;
  description?: string;
  address?: string;
  region?: string;
  // Note: status might not be in the request DTO based on CreateBranchRequest.java
}

export interface UploadResponse {
  success: boolean;
  message: string;
  branches: BranchResponse[];
  errors?: Array<{ row: number; field: string; message: string }>;
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
  getAllBranchesList(): Observable<BranchResponse[]> {
    return this.http.get<ApiResponse<BranchResponse[]>>(`${this.apiUrl}/list`).pipe(
      map(response => response.result || [])
    );
  }

  /** GET /branches/active - Get all active branches */
  getActiveBranches(): Observable<BranchResponse[]> {
    return this.http.get<ApiResponse<BranchResponse[]>>(`${this.apiUrl}/active`).pipe(
      map(response => response.result || [])
    );
  }

  /** GET /branches/{code} - Get branch by code */
  getBranchByCode(code: string): Observable<BranchResponse> {
    return this.http.get<ApiResponse<BranchResponse>>(`${this.apiUrl}/${code}`).pipe(
      map(response => response.result)
    );
  }

  /** POST /branches - Create new branch */
  createBranch(branch: CreateBranchRequest): Observable<BranchResponse> {
    return this.http.post<ApiResponse<BranchResponse>>(this.apiUrl, branch).pipe(
      map(response => response.result)
    );
  }

  /** PUT /branches/{code} - Update branch by code */
  updateBranchByCode(code: string, branch: CreateBranchRequest): Observable<BranchResponse> {
    return this.http.put<ApiResponse<BranchResponse>>(`${this.apiUrl}/${code}`, branch).pipe(
      map(response => response.result)
    );
  }

  /** DELETE /branches/{code} - Delete branch by code */
  deleteBranchByCode(code: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${code}`).pipe(
      map(() => {})
    );
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
    return this.http.post<ApiResponse<BranchResponse[]>>(`${this.apiUrl}/upload`, formData).pipe(
      map(response => response.result || [])
    );
  }
}