import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

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

  /** GET /branches - Get all branches */
  getAllBranches(): Observable<BranchResponse[]> {
    return this.http.get<BranchResponse[]>(this.apiUrl);
  }

  /** GET /branches/active - Get all active branches */
  getActiveBranches(): Observable<BranchResponse[]> {
    return this.http.get<BranchResponse[]>(`${this.apiUrl}/active`);
  }

  /** GET /branches/{code} - Get branch by code */
  getBranchByCode(code: string): Observable<BranchResponse> {
    return this.http.get<BranchResponse>(`${this.apiUrl}/${code}`);
  }

  /** GET /branches/{id} - Get branch by ID (legacy support) */
  getBranchById(id: number): Observable<BranchResponse> {
    return this.http.get<BranchResponse>(`${this.apiUrl}/${id}`);
  }

  /** POST /branches - Create new branch */
  createBranch(branch: CreateBranchRequest): Observable<BranchResponse> {
    return this.http.post<BranchResponse>(this.apiUrl, branch);
  }

  /** PUT /branches/{code} - Update branch by code */
  updateBranchByCode(code: string, branch: CreateBranchRequest): Observable<BranchResponse> {
    return this.http.put<BranchResponse>(`${this.apiUrl}/${code}`, branch);
  }

  /** PUT /branches/{id} - Update branch by ID (legacy support) */
  updateBranch(id: number, branch: Partial<BranchResponse>): Observable<BranchResponse> {
    return this.http.put<BranchResponse>(`${this.apiUrl}/${id}`, branch);
  }

  /** DELETE /branches/{code} - Delete branch by code */
  deleteBranchByCode(code: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${code}`);
  }

  /** DELETE /branches/{id} - Delete branch by ID (legacy support) */
  deleteBranch(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
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
    return this.http.post<BranchResponse[]>(`${this.apiUrl}/upload`, formData);
  }

  /** PATCH /branches/{id}/status - Change branch status (legacy) */
  changeBranchStatus(id: number, status: string): Observable<BranchResponse> {
    return this.http.patch<BranchResponse>(`${this.apiUrl}/${id}/status`, null, {
      params: new HttpParams().set('status', status),
    });
  }
}