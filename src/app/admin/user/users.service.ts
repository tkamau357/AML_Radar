import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PagedResponse, PaginationParams, buildPaginationParams } from '../../shared/data/paginated-response';
import { ApiResponse } from '../../shared/data/api-response';

export interface UserResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
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
  status?: string;
  mustChangePassword?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
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
  getUsersList(): Observable<UserResponse[]> {
    return this.http.get<ApiResponse<UserResponse[]>>(`${this.apiUrl}/list`)
      .pipe(map(res => res.result));
  }

  /** GET /users/{id} - Get user by ID */
  getUserById(id: number): Observable<UserResponse> {
    return this.http.get<ApiResponse<UserResponse>>(`${this.apiUrl}/${id}`)
      .pipe(map(res => res.result));
  }

  /** GET /users/branch/{branchCode} - Get users by branch */
  getUsersByBranch(branchCode: string): Observable<UserResponse[]> {
    return this.http.get<ApiResponse<UserResponse[]>>(`${this.apiUrl}/branch/${branchCode}`)
      .pipe(map(res => res.result));
  }

  /** POST /users - Create new user */
  createUser(user: any): Observable<UserResponse> {
    return this.http.post<ApiResponse<UserResponse>>(`${this.apiUrl}`, user)
      .pipe(map(res => res.result));
  }

  /** PUT /users/{id} - Update user */
  updateUser(id: number, user: any): Observable<UserResponse> {
    return this.http.put<ApiResponse<UserResponse>>(`${this.apiUrl}/${id}`, user)
      .pipe(map(res => res.result));
  }

  /** PATCH /users/{id}/status - Change user status */
  changeUserStatus(id: number, status: string): Observable<UserResponse> {
    return this.http.patch<ApiResponse<UserResponse>>(`${this.apiUrl}/${id}/status`, null, {
      params: new HttpParams().set('status', status)
    }).pipe(map(res => res.result));
  }

  /** DELETE /users/{id} - Delete a user */
  deleteUser(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`)
      .pipe(map(() => void 0));
  }
}