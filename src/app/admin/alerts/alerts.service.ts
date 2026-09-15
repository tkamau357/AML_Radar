import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse, PagedResponse } from '../screening/screening.service';
import { ScreeningDetail, ScreeningStats, ScreeningSummary, Severity } from '../../data/types/screening-results.model';

@Injectable({
  providedIn: 'root',
})
export class AlertsService {
  private base = `${environment.apiUrl}/api/v1/screening`;

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 20): Observable<PagedResponse<ScreeningSummary>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http
      .get<ApiResponse<PagedResponse<ScreeningSummary>>>(`${this.base}/results`, { params })
      .pipe(map((r) => r.result));
  }

  getAlerts(page = 0, size = 20, severity?: Severity): Observable<PagedResponse<ScreeningSummary>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (severity) params = params.set('severity', severity);
    return this.http
      .get<ApiResponse<PagedResponse<ScreeningSummary>>>(`${this.base}/results/alerts`, { params })
      .pipe(map((r) => r.result));
  }

  getDetail(transactionId: string): Observable<ScreeningDetail> {
    return this.http
      .get<ApiResponse<ScreeningDetail>>(`${this.base}/results/${transactionId}`)
      .pipe(map((r) => r.result));
  }

  getStats(): Observable<ScreeningStats> {
    return this.http
      .get<ApiResponse<ScreeningStats>>(`${this.base}/stats`)
      .pipe(map((r) => r.result));
  }

  getStatsByRange(from: string, to: string): Observable<ScreeningStats> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http
      .get<ApiResponse<ScreeningStats>>(`${this.base}/stats/range`, { params })
      .pipe(map((r) => r.result));
  }
}
