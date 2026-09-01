// roles.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ApiResponse<T> {
  id?: string;
  message: string;
  result: T;
  pageable?: {
    offset: number;
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
  };
  totalElements?: number;
  totalPages?: number;
  timestamp?: string;
}

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
  id?: number;
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
  getAllRoles(): Observable<RoleResponse[]> {
    return this.http.get<ApiResponse<{ content: RoleResponse[] }>>(`${this.apiUrl}`).pipe(
      map(response => response.result?.content || [])
    );
  }

  /** GET /roles/list - Get all roles (list for dropdowns) */
  getAllRolesList(): Observable<RoleResponse[]> {
    return this.http.get<ApiResponse<RoleResponse[]>>(`${this.apiUrl}/list`).pipe(
      map(response => response.result || [])
    );
  }

  /** GET /roles/{id} - Get role by ID */
  getRoleById(id: number): Observable<RoleResponse> {
    return this.http.get<ApiResponse<RoleResponse>>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.result)
    );
  }

  /** GET /roles/permissions - Get all available permissions */
  getAllPermissions(): Observable<PermissionResponse[]> {
    return this.http.get<ApiResponse<PermissionResponse[]>>(`${this.apiUrl}/permissions`).pipe(
      map(response => response.result || [])
    );
  }

  /** GET /roles/{id}/permissions - Get permissions for a specific role */
  getRolePermissions(roleId: number): Observable<PermissionResponse[]> {
    return this.http.get<ApiResponse<PermissionResponse[]>>(`${this.apiUrl}/${roleId}/permissions`).pipe(
      map(response => response.result || [])
    );
  }

  // roles.service.ts
/** POST /roles - Create a new role */
createRole(role: { name: string; description?: string; permissions: string[] }): Observable<RoleResponse> {
  return this.http.post<ApiResponse<RoleResponse>>(`${this.apiUrl}`, role).pipe(
    map(response => response.result)
  );
}

/** PUT /roles/{id} - Update a role */
updateRole(id: number, role: { name: string; description?: string; permissions: string[] }): Observable<RoleResponse> {
  return this.http.put<ApiResponse<RoleResponse>>(`${this.apiUrl}/${id}`, role).pipe(
    map(response => response.result)
  );
}

  /** DELETE /roles/{id} - Delete a role */
  deleteRole(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`).pipe(
      map(response => {})
    );
  }
}