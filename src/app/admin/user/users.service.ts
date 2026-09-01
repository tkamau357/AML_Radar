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
  password: string;
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
  getAllUsers(): Observable<UserResponse[]> {
    return this.http.get<ApiResponse<{ content: UserResponse[] }>>(`${this.apiUrl}`).pipe(
      map(response => response.result?.content || [])
    );
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
}