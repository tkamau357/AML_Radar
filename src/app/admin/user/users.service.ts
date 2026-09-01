import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/data/api-response';
import { PagedResponse, PaginationParams, buildPaginationParams } from '../../shared/data/paginated-response';

export interface UserResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  branch?: {
    id: number;
    branchCode: string;
    branchName: string;
  };
  role?: {
    id: number;
    name: string;
    description?: string;
    permissions?: string[];
  };
  status: string;
  mustChangePassword?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  branchCode: string;
  roleId: number;
}

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  branchCode: string;
  roleId: number;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private apiUrl = `${environment.apiUrl}/api/v1/users`;

  constructor(private http: HttpClient) { }

  /** GET /users - Get all users (paginated) */
  getAllUsers(params: PaginationParams = {}): Observable<PagedResponse<UserResponse>> {
    const httpParams = new HttpParams({ fromObject: buildPaginationParams(params) });
    return this.http.get<ApiResponse<PagedResponse<UserResponse>>>(this.apiUrl, { params: httpParams })
      .pipe(map(res => res.result));
  }

  /** GET /users/list - Get all users (list for dropdowns) */
  getAllUsersList(): Observable<UserResponse[]> {
    return this.http.get<ApiResponse<UserResponse[]>>(`${this.apiUrl}/list`).pipe(
      map(response => response.result || [])
    );
  }

  /** GET /users/{id} - Get user by ID */
  getUserById(id: number): Observable<UserResponse> {
    return this.http.get<ApiResponse<UserResponse>>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.result)
    );
  }

  /** GET /users/branch/{branchCode} - Get users by branch */
  getUsersByBranch(branchCode: string): Observable<UserResponse[]> {
    return this.http.get<ApiResponse<UserResponse[]>>(`${this.apiUrl}/branch/${branchCode}`).pipe(
      map(response => response.result || [])
    );
  }

  /** POST /users - Create new user */
  createUser(user: CreateUserRequest): Observable<UserResponse> {
    return this.http.post<ApiResponse<UserResponse>>(`${this.apiUrl}`, user).pipe(
      map(response => response.result)
    );
  }

  /** PUT /users/{id} - Update user */
  updateUser(id: number, user: UpdateUserRequest): Observable<UserResponse> {
    return this.http.put<ApiResponse<UserResponse>>(`${this.apiUrl}/${id}`, user).pipe(
      map(response => response.result)
    );
  }

  /** PATCH /users/{id}/status - Change user status */
  changeUserStatus(id: number, status: string): Observable<UserResponse> {
    return this.http.patch<ApiResponse<UserResponse>>(`${this.apiUrl}/${id}/status`, null, {
      params: new HttpParams().set('status', status)
    }).pipe(
      map(response => response.result)
    );
  }

  /** DELETE /users/{id} - Delete a user */
  deleteUser(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`).pipe(
      map(() => {})
    );
  }

  /** POST /users/{id}/force-reset-password - Force reset user password */
  forceResetPassword(id: number): Observable<UserResponse> {
    return this.http.post<ApiResponse<UserResponse>>(`${this.apiUrl}/${id}/force-reset-password`, null).pipe(
      map(response => response.result)
    );
  }
}