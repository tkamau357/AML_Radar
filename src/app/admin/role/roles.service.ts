import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagedResponse, PaginationParams, buildPaginationParams } from '../../shared/data/paginated-response';

export interface RoleResponse {
  id: number;
  name: string;
  description?: string;
  isSystemRole?: boolean;
  permissions?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PermissionResponse {
  name: string;
  code: string;
  endpoint: string;
  method: string;
  branchScoped: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  private apiUrl = `${environment.apiUrl}/api/v1/roles`;

  constructor(private http: HttpClient) { }

  /** GET /roles - Get all roles (paginated) */
  getAllRoles(params: PaginationParams = {}): Observable<PagedResponse<RoleResponse>> {
    const httpParams = new HttpParams({ fromObject: buildPaginationParams(params) });
    return this.http.get<PagedResponse<RoleResponse>>(this.apiUrl, { params: httpParams });
  }

  /** GET /roles/list - Get all roles (list for dropdowns) */
  getRolesList(): Observable<RoleResponse[]> {
    return this.http.get<RoleResponse[]>(`${this.apiUrl}/list`);
  }

  /** GET /roles/{id} - Get role by ID */
  getRoleById(id: number): Observable<RoleResponse> {
    return this.http.get<RoleResponse>(`${this.apiUrl}/${id}`);
  }

  /** GET /roles/{id}/permissions - Get permissions for a specific role */
  getRolePermissions(roleId: number): Observable<PermissionResponse[]> {
    return this.http.get<PermissionResponse[]>(`${this.apiUrl}/${roleId}/permissions`);
  }

  /** POST /roles - Create a new role */
  createRole(role: any): Observable<RoleResponse> {
    return this.http.post<RoleResponse>(`${this.apiUrl}`, role);
  }

  /** PUT /roles/{id} - Update a role */
  updateRole(id: number, role: any): Observable<RoleResponse> {
    return this.http.put<RoleResponse>(`${this.apiUrl}/${id}`, role);
  }

  /** DELETE /roles/{id} - Delete a role */
  deleteRole(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}