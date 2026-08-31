import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PagedResponse, PaginationParams, buildPaginationParams } from '../../shared/data/paginated-response';
import { ApiResponse } from '../../shared/data/api-response';

export type AuditAction = 
  | 'LOGIN_ATTEMPT' | 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'LOGOUT'
  | 'OTP_SENT' | 'OTP_VERIFIED' | 'PASSWORD_CHANGED'
  | 'USER_CREATED' | 'USER_UPDATED' | 'USER_DELETED' | 'USER_STATUS_CHANGED'
  | 'ROLE_CREATED' | 'ROLE_UPDATED' | 'ROLE_DELETED' | 'PERMISSION_ASSIGNED' | 'PERMISSION_REVOKED'
  | 'BRANCH_CREATED' | 'BRANCH_UPDATED' | 'BRANCH_DELETED' | 'BRANCH_UPLOADED'
  | 'DATA_VIEWED' | 'DATA_EXPORTED' | 'REPORT_GENERATED'
  | 'SANCTION_SCREENED' | 'SANCTION_BATCH_SCREENED' | 'SANCTION_LIST_SYNCED' 
  | 'SANCTION_HIT_FOUND' | 'SANCTION_ENTRY_VIEWED' | 'SANCTION_ENTRY_CREATED'
  | 'SANCTION_ENTRY_DELETED' | 'SANCTION_ENTRY_DEACTIVATED' | 'SANCTION_BULK_UPLOAD';

export interface AuditResponse {
  id: number;
  action: AuditAction;
  userEmail: string;
  userBranchCode?: string;
  entityType?: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
  success?: boolean;
  errorMessage?: string;
  timestamp: string;
}

export interface AuditSearchParams extends PaginationParams {
  userEmail?: string;
  action?: AuditAction;
  entityType?: string;
  startDate?: string;
  endDate?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuditService {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/audit`;

  constructor(private http: HttpClient) {}

  /** GET /audit - Search audit logs */
  search(params: AuditSearchParams = {}): Observable<PagedResponse<AuditResponse>> {
    let httpParams = new HttpParams({ fromObject: buildPaginationParams(params) });
    
    if (params.userEmail) {
      httpParams = httpParams.set('userEmail', params.userEmail);
    }
    if (params.action) {
      httpParams = httpParams.set('action', params.action);
    }
    if (params.entityType) {
      httpParams = httpParams.set('entityType', params.entityType);
    }
    if (params.startDate) {
      httpParams = httpParams.set('startDate', params.startDate);
    }
    if (params.endDate) {
      httpParams = httpParams.set('endDate', params.endDate);
    }

    return this.http.get<ApiResponse<PagedResponse<AuditResponse>>>(this.apiUrl, { params: httpParams })
      .pipe(map(res => res.result));
  }

  /** GET /audit/user/{email} - Get audit logs by user email */
  findByUser(email: string, params: PaginationParams = {}): Observable<PagedResponse<AuditResponse>> {
    const httpParams = new HttpParams({ fromObject: buildPaginationParams(params) });
    return this.http.get<ApiResponse<PagedResponse<AuditResponse>>>(`${this.apiUrl}/user/${email}`, { params: httpParams })
      .pipe(map(res => res.result));
  }

  /** GET /audit/entity/{entityType}/{entityId} - Get audit logs by entity */
  findByEntity(entityType: string, entityId: string, params: PaginationParams = {}): Observable<PagedResponse<AuditResponse>> {
    const httpParams = new HttpParams({ fromObject: buildPaginationParams(params) });
    return this.http.get<ApiResponse<PagedResponse<AuditResponse>>>(`${this.apiUrl}/entity/${entityType}/${entityId}`, { params: httpParams })
      .pipe(map(res => res.result));
  }
}
