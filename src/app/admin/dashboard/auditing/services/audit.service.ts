import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "../../../../../environments/environment";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ApiResponse } from "../../../../shared/data/api-response";

@Injectable({
  providedIn: "root",
})
export class AuditService {
  private url = `${environment.apiUrl}/api/v1/audit`;

  constructor(private _http: HttpClient) {}

  /**
   * GET /api/v1/audit
   * Primary paginated search with optional filters.
   */
  search(
    userEmail?: string,
    action?: string,
    entityType?: string,
    startDate?: string,
    endDate?: string,
    page: number = 0,
    size: number = 20,
    sort: string = "timestamp,desc"
  ): Observable<any> {
    let params = new HttpParams()
      .set("page", page.toString())
      .set("size", size.toString())
      .set("sort", sort);

    if (userEmail) params = params.set("userEmail", userEmail);
    if (action)    params = params.set("action", action);
    if (entityType) params = params.set("entityType", entityType);
    if (startDate) params = params.set("startDate", startDate);
    if (endDate)   params = params.set("endDate", endDate);

    return this._http.get<ApiResponse<any>>(this.url, { params })
      .pipe(map(res => res.result));
  }

  /**
   * GET /api/v1/audit
   * Convenience wrapper used by AuditingComponent — filters by a single
   * calendar date by setting startDate = "yyyy-MM-dd 00:00:00" and
   * endDate = "yyyy-MM-dd 23:59:59".
   */
  getAllByDate(
    date: string,          // expects "yyyy/MM/dd" or "yyyy-MM-dd"
    page: number = 0,
    size: number = 20,
    sortBy: string = "timestamp",
    direction: string = "desc"
  ): Observable<any> {
    const normalised = date.replace(/\//g, "-");   // "yyyy-MM-dd"
    const startDate  = `${normalised} 00:00:00`;
    const endDate    = `${normalised} 23:59:59`;
    const sort       = `${sortBy},${direction}`;

    const params = new HttpParams()
      .set("startDate", startDate)
      .set("endDate",   endDate)
      .set("page",      page.toString())
      .set("size",      size.toString())
      .set("sort",      sort);

    return this._http.get<ApiResponse<any>>(this.url, { params })
      .pipe(map(res => res.result));
  }

  /**
   * GET /api/v1/audit/user/:email
   * All audit events for a specific user.
   */
  findByUser(
    email: string,
    page: number = 0,
    size: number = 20,
    sort: string = "timestamp,desc"
  ): Observable<any> {
    const params = new HttpParams()
      .set("page", page.toString())
      .set("size", size.toString())
      .set("sort", sort);

    return this._http.get<ApiResponse<any>>(
      `${this.url}/user/${encodeURIComponent(email)}`,
      { params }
    ).pipe(map(res => res.result));
  }

  /**
   * GET /api/v1/audit/entity/:type/:id
   * All audit events for a specific entity.
   */
  findByEntity(
    entityType: string,
    entityId: string,
    page: number = 0,
    size: number = 20,
    sort: string = "timestamp,desc"
  ): Observable<any> {
    const params = new HttpParams()
      .set("page", page.toString())
      .set("size", size.toString())
      .set("sort", sort);

    return this._http.get<ApiResponse<any>>(
      `${this.url}/entity/${encodeURIComponent(entityType)}/${encodeURIComponent(entityId)}`,
      { params }
    ).pipe(map(res => res.result));
  }

  /**
   * GET /api/v1/audit
   * Convenience wrapper used by AuditingComponent — filters by a single
   * calendar date by setting startDate = "yyyy-MM-dd 00:00:00" and
   * endDate = "yyyy-MM-dd 23:59:59".
   */
  getAllByDate(
    date: string,
    page: number = 0,
    size: number = 20,
    sortBy: string = "timestamp",
    direction: string = "desc"
  ): Observable<any> {
    const normalised = date.replace(/\//g, "-");
    const startDate  = `${normalised} 00:00:00`;
    const endDate    = `${normalised} 23:59:59`;
    const sort       = `${sortBy},${direction}`;

    const params = new HttpParams()
      .set("startDate", startDate)
      .set("endDate",   endDate)
      .set("page",      page.toString())
      .set("size",      size.toString())
      .set("sort",      sort);

    return this._http.get<any>(this.url, { params });
  }
}