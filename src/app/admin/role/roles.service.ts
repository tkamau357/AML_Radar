import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PagedResponse, PaginationParams, buildPaginationParams } from '../../shared/data/paginated-response';
import { ApiResponse } from '../../shared/data/api-response';

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
    return this.http.get<ApiResponse<PagedResponse<RoleResponse>>>(this.apiUrl, { params: httpParams })
      .pipe(map(res => res.result));
  }

  /** GET /roles/list - Get all roles (list for dropdowns) */
  getRolesList(): Observable<RoleResponse[]> {
    return this.http.get<ApiResponse<RoleResponse[]>>(`${this.apiUrl}/list`)
      .pipe(map(res => res.result));
  }

  /** GET /roles/{id} - Get role by ID */
  getRoleById(id: number): Observable<RoleResponse> {
    return this.http.get<ApiResponse<RoleResponse>>(`${this.apiUrl}/${id}`)
      .pipe(map(res => res.result));
  }

  /** GET /roles/permissions - Get all available permissions */
  getAllPermissions(): Observable<PermissionResponse[]> {
    return this.http.get<ApiResponse<PermissionResponse[]>>(`${this.apiUrl}/permissions`)
      .pipe(map(res => res.result));
  }

  /** POST /roles - Create a new role */
  createRole(role: any): Observable<RoleResponse> {
    return this.http.post<ApiResponse<RoleResponse>>(`${this.apiUrl}`, role)
      .pipe(map(res => res.result));
  }

  /** PUT /roles/{id} - Update a role */
  updateRole(id: number, role: any): Observable<RoleResponse> {
    return this.http.put<ApiResponse<RoleResponse>>(`${this.apiUrl}/${id}`, role)
      .pipe(map(res => res.result));
  }

  /** DELETE /roles/{id} - Delete a role */
  deleteRole(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`)
      .pipe(map(() => void 0));
  }

  /** POST /roles/{id}/permissions - Assign permissions to role */
  assignPermissions(id: number, permissionCodes: string[]): Observable<RoleResponse> {
    return this.http.post<ApiResponse<RoleResponse>>(`${this.apiUrl}/${id}/permissions`, { permissionCodes })
      .pipe(map(res => res.result));
  }

  /** DELETE /roles/{id}/permissions - Revoke permissions from role */
  revokePermissions(id: number, permissionCodes: string[]): Observable<RoleResponse> {
    return this.http.delete<ApiResponse<RoleResponse>>(`${this.apiUrl}/${id}/permissions`, { body: { permissionCodes } })
      .pipe(map(res => res.result));
  }

  /** Get permissions for a specific role by fetching the role and extracting permissions */
  getRolePermissions(roleId: number): Observable<PermissionResponse[]> {
    return this.getRoleById(roleId).pipe(
      map(role => {
        // Transform role.permissions (string array) to PermissionResponse array
        if (role.permissions) {
          return role.permissions.map(code => ({
            name: code,
            code: code,
            endpoint: '',
            method: '',
            branchScoped: false
          }));
        }
        return [];
      })
    );
  }
}
