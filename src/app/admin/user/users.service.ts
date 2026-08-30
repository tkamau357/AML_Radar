import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  branch: {
    id: number;
    branchCode: string;
    branchName: string;
  };
  role: {
    id: number;
    name: string;
    description?: string;
    permissions?: string[]; // ✅ Added this
  };
  status?: string;
  mustChangePassword?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
  // Add any other fields from your backend
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private apiUrl = `${environment.apiUrl}/api/v1/users`;

  constructor(private http: HttpClient) { }

  /** GET /users - Get all users */
  getAllUsers(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.apiUrl}`);
  }

  /** GET /users/{id} - Get user by ID */
  getUserById(id: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/${id}`);
  }

  /** GET /users/branch/{branchCode} - Get users by branch */
  getUsersByBranch(branchCode: string): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.apiUrl}/branch/${branchCode}`);
  }

  /** POST /users - Create new user */
  createUser(user: any): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.apiUrl}`, user);
  }

  /** PUT /users/{id} - Update user */
  updateUser(id: number, user: any): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiUrl}/${id}`, user);
  }

  /** PATCH /users/{id}/status - Change user status */
  changeUserStatus(id: number, status: string): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${this.apiUrl}/${id}/status`, null, {
      params: new HttpParams().set('status', status)
    });
  }

  /** DELETE /users/{id} - Delete a user */
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}