// import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
// import { Injectable } from "@angular/core";
// import { Observable, map } from "rxjs";
// import { environment } from "src/environments/environment";
// import { DatePipe } from "@angular/common";
// import { Response } from "../../data/types/response";

// const httpOptions = {
//   headers: new HttpHeaders({ "Content-Type": "application/json" }),
// };

// @Injectable({
//   providedIn: "root",
// })
// export class DashboardService {
//   constructor(
//     private http: HttpClient,
//     private _http: HttpClient,
//   ) {}

//   searchAtmData(
//     page: number,
//     limit: number,
//     value: string,
//     status: string,
//     selectedDateString: string,
//     subsidiary: string,
//   ) {
//     const searchUrl = `${environment.baseUrl}/atm-recon/search`;

//     return this.http.get<any>(searchUrl, {
//       params: {
//         page: page,
//         size: limit,
//         searchValue: value,
//         status: status,
//         subsidiary,
//         date: selectedDateString,
//       },
//     });
//   }

//   headers = new HttpHeaders().set("Content-Type", "application/json");

//   uploadFiles(formData): Observable<any> {
//     const formDataUrl = `${environment.baseUrl}/api/file/upload`;

//     return this.http.post<any>(formDataUrl, formData);
//   }

//   initiateATMReconciliation(date: string): Observable<Response> {
//     const formDataUrl = `${environment.baseUrl}/atm-recon/init?date=${date}`;

//     return this.http.post<Response>(formDataUrl, {});
//   }

//   generateMatchTransactionsExcelReport(subsidiary: string): Observable<any> {
//     let headers = new HttpHeaders();
//     headers.append("Accept", "application/octet-stream");
//     let requestOptions: any = {
//       params: { status: "Match", subsidiary },
//       headers: headers,
//       responseType: "blob",
//       withCredentials: false,
//     };
//     let API_URL = `${environment.baseUrl}/atm-recon/excel`;
//     return this.http.get(API_URL, requestOptions).pipe(
//       map((response) => {
//         return {
//           data: new Blob([response], { type: "octet/stream" }),
//         };
//       }),
//     );
//   }

//   generateExceptionsTransactionsExcelReport(
//     subsidiary: string,
//   ): Observable<any> {
//     let headers = new HttpHeaders();
//     headers.append("Accept", "application/octet-stream");
//     let requestOptions: any = {
//       params: { status: "Exception", subsidiary },
//       headers: headers,
//       responseType: "blob",
//       withCredentials: false,
//     };
//     let API_URL = `${environment.baseUrl}/atm-recon/excel/status`;
//     return this.http.get(API_URL, requestOptions).pipe(
//       map((response) => {
//         return {
//           data: new Blob([response], { type: "octet/stream" }),
//         };
//       }),
//     );
//   }

//   generateReportByStatus(
//     status: string,
//     subsidiary: string,
//     date: string,
//   ): Observable<Blob> {
//     const headers = new HttpHeaders();
//     headers.append("Accept", "application/octet-stream");
//     const requestOptions: any = {
//       params: { status, subsidiary, date },
//       headers,
//       responseType: "blob",
//       withCredentials: false,
//     };

//     return this.http
//       .get(`${environment.baseUrl}/atm-recon/excel/status`, requestOptions)
//       .pipe(
//         map((response) => {
//           return new Blob([response], { type: "octet/stream" });
//         }),
//       );
//   }

//   generateNoRNNExceptionsTransactionsExcelReport(
//     subsidiary: string,
//   ): Observable<any> {
//     let headers = new HttpHeaders();
//     headers.append("Accept", "application/octet-stream");
//     let requestOptions: any = {
//       params: { status: "NO_RRN", subsidiary },
//       headers: headers,
//       responseType: "blob",
//       withCredentials: false,
//     };
//     let API_URL = `${environment.baseUrl}/atm-recon/excel/status`;
//     return this.http.get(API_URL, requestOptions).pipe(
//       map((response) => {
//         return {
//           data: new Blob([response], { type: "octet/stream" }),
//         };
//       }),
//     );
//   }

//   generateRNNNotMatchExceptionsTransactionsExcelReport(
//     subsidiary: string,
//   ): Observable<any> {
//     let headers = new HttpHeaders();
//     headers.append("Accept", "application/octet-stream");
//     let requestOptions: any = {
//       params: { status: "RRN  Mismatch", subsidiary },
//       headers: headers,
//       responseType: "blob",
//       withCredentials: false,
//     };
//     let API_URL = `${environment.baseUrl}/atm-recon/excel/status`;
//     return this.http.get(API_URL, requestOptions).pipe(
//       map((response) => {
//         return {
//           data: new Blob([response], { type: "octet/stream" }),
//         };
//       }),
//     );
//   }

//   generateHTTUMExcelFile(): Observable<any> {
//     let headers = new HttpHeaders();
//     headers.append("Accept", "application/octet-stream");
//     let requestOptions: any = {
//       headers: headers,
//       responseType: "blob",
//       withCredentials: false,
//     };
//     let API_URL = `${environment.baseUrl}/atm-recon/excel/httum`;
//     return this.http.get(API_URL, requestOptions).pipe(
//       map((response) => {
//         return {
//           data: new Blob([response], { type: "octet/stream" }),
//         };
//       }),
//     );
//   }

//   filterBySegmentName(
//     page,
//     limit,
//     subsidiary: string,
//     date?: string,
//   ): Observable<any> {
//     const filterBySegmentUrl = `${environment.baseUrl}/atm-recon/all/pagination`;
//     const params = { page: page, size: limit, subsidiary };

//     if (date) {
//       params["date"] = date;
//     }
//     return this.http.get<any>(filterBySegmentUrl, {
//       params,
//     });
//   }

//   getAllMatchedTransactions(
//     page,
//     limit,
//     subsidiary: string,
//     date?: string,
//   ): Observable<any> {
//     const filterBySegmentUrl = `${environment.baseUrl}/atm-recon/all/pagination/status`;

//     const params = { page: page, size: limit, status: "Match", subsidiary };
//     if (date) {
//       params["date"] = date;
//     }
//     return this.http.get<any>(filterBySegmentUrl, {
//       params,
//     });
//   }

//   getAtmRecordsByStatus(
//     page,
//     limit,
//     subsidiary: string,
//     status: string,
//     date?: string,
//   ): Observable<any> {
//     status = status == "all" ? ".*" : status;
//     const url = `${environment.baseUrl}/atm-recon/all/pagination/status`;
//     const params = {
//       page: page,
//       size: limit,
//       status: status,
//       subsidiary,
//       date,
//     };
//     return this.http.get(url, { params });
//   }

//   getAllMismatchTransactions(
//     page,
//     limit,
//     subsidiary: string,
//     date?: string,
//   ): Observable<any> {
//     const filterBySegmentUrl = `${environment.baseUrl}/atm-recon/all/pagination/status`;

//     const params = { page: page, size: limit, status: "Exception", subsidiary };
//     if (date) {
//       params["date"] = date;
//     }

//     return this.http.get<any>(filterBySegmentUrl, {
//       params,
//     });
//   }

//   getCashRetractATMExceptions(page, limit): Observable<any> {
//     const filterBySegmentUrl = `${environment.baseUrl}/atm-recon/all/pagination/status/error_code`;

//     return this.http.get<any>(filterBySegmentUrl, {
//       params: {
//         page: page,
//         size: limit,
//         status: "Exception",
//         error_code: "CASH RETRACT",
//       },
//     });
//   }

//   getCashTakenATMExceptions(page, limit): Observable<any> {
//     const filterBySegmentUrl = `${environment.baseUrl}/atm-recon/all/pagination/status/error_code`;

//     return this.http.get<any>(filterBySegmentUrl, {
//       params: {
//         page: page,
//         size: limit,
//         status: "Exception",
//         error_code: "CASH TAKEN",
//       },
//     });
//   }

//   getCDMErrorATMExceptions(page, limit): Observable<any> {
//     const filterBySegmentUrl = `${environment.baseUrl}/atm-recon/all/pagination/status/error_code`;

//     return this.http.get<any>(filterBySegmentUrl, {
//       params: {
//         page: page,
//         size: limit,
//         status: "Exception",
//         error_code: "CDM ERROR",
//       },
//     });
//   }

//   getIssuerUnavailableTMExceptions(page, limit): Observable<any> {
//     const filterBySegmentUrl = `${environment.baseUrl}/atm-recon/all/pagination/status/error_code`;

//     return this.http.get<any>(filterBySegmentUrl, {
//       params: {
//         page: page,
//         size: limit,
//         status: "Exception",
//         error_code: "ISSUER UNAVAILABLE",
//       },
//     });
//   }

//   generateCashRetractATMExceptions(): Observable<any> {
//     let headers = new HttpHeaders();
//     headers.append("Accept", "application/octet-stream");
//     let requestOptions: any = {
//       params: { status: "Exception", error_code: "CASH RETRACT" },
//       headers: headers,
//       responseType: "blob",
//       withCredentials: false,
//     };
//     let API_URL = `${environment.baseUrl}/atm-recon/excel/status/error_code`;
//     return this.http.get(API_URL, requestOptions).pipe(
//       map((response) => {
//         return {
//           data: new Blob([response], { type: "octet/stream" }),
//         };
//       }),
//     );
//   }

//   generateCustomerNotDebitedExceptions(): Observable<any> {
//     let headers = new HttpHeaders();
//     headers.append("Accept", "application/octet-stream");
//     let requestOptions: any = {
//       params: { status: "Exception", error_code: "CASH TAKEN" },
//       headers: headers,
//       responseType: "blob",
//       withCredentials: false,
//     };
//     let API_URL = `${environment.baseUrl}/atm-recon/excel/status/error_code`;
//     return this.http.get(API_URL, requestOptions).pipe(
//       map((response) => {
//         return {
//           data: new Blob([response], { type: "octet/stream" }),
//         };
//       }),
//     );
//   }

//   generateCDMErrorExceptions(): Observable<any> {
//     let headers = new HttpHeaders();
//     headers.append("Accept", "application/octet-stream");
//     let requestOptions: any = {
//       params: { status: "Exception", error_code: "CDM ERROR" },
//       headers: headers,
//       responseType: "blob",
//       withCredentials: false,
//     };
//     let API_URL = `${environment.baseUrl}/atm-recon/excel/status/error_code`;
//     return this.http.get(API_URL, requestOptions).pipe(
//       map((response) => {
//         return {
//           data: new Blob([response], { type: "octet/stream" }),
//         };
//       }),
//     );
//   }

//   generateIssuerUnavailableExceptions(): Observable<any> {
//     let headers = new HttpHeaders();
//     headers.append("Accept", "application/octet-stream");
//     let requestOptions: any = {
//       params: { status: "Exception", error_code: "ISSUER UNAVAILABLE" },
//       headers: headers,
//       responseType: "blob",
//       withCredentials: false,
//     };
//     let API_URL = `${environment.baseUrl}/atm-recon/excel/status/error_code`;
//     return this.http.get(API_URL, requestOptions).pipe(
//       map((response) => {
//         return {
//           data: new Blob([response], { type: "octet/stream" }),
//         };
//       }),
//     );
//   }

//   getRRNNotMatchTransactions(page, limit): Observable<any> {
//     const filterBySegmentUrl = `${environment.baseUrl}/atm-recon/all/pagination/status`;

//     return this.http.get<any>(filterBySegmentUrl, {
//       params: { page: page, size: limit, status: "Mismatch" },
//     });
//   }

//   getTransactionAnalytics(subsidiary: string): Observable<any> {
//     const getTransactionAnalyticsUrl = `${environment.baseUrl}/atm-recon/all/analytics`;

//     return this.http.get<any>(getTransactionAnalyticsUrl, {
//       params: { subsidiary },
//     });
//   }

//   editExceptionTransaction(transaction): Observable<any> {
//     const geditExceptionTransactionUrl = `${environment.baseUrl}/atm-httum/add`;

//     return this.http.post<any>(geditExceptionTransactionUrl, transaction);
//   }

//   approveHTTUMRecord(transaction): Observable<any> {
//     const geditExceptionTransactionUrl = `${environment.baseUrl}/atm-httum/add`;

//     return this.http.post<any>(geditExceptionTransactionUrl, transaction);
//   }

//   fetchPendingHTTUMRecords(page, limit, date) {
//     const fetchPendingHTTUMRecordsUrl = `${environment.baseUrl}/atm-httum/all/paginated`;

//     return this.http.get<any>(fetchPendingHTTUMRecordsUrl, {
//       params: {
//         page: page,
//         size: limit,
//         status: "Pending",
//         Date: date,
//       },
//     });
//   }

//   searchAtmHttum(
//     page: number,
//     limit: number,
//     status: string,
//     value: string,
//     date: string,
//   ) {
//     const searchUrl = `${environment.baseUrl}/atm-httum/search`;

//     return this.http.get<any>(searchUrl, {
//       params: {
//         page: page,
//         size: limit,
//         status: status,
//         date: date,
//         searchValue: value,
//       },
//     });
//   }

//   fetchApprovedHTTUMRecords(page, limit, date) {
//     const fetchApprovedHTTUMRecordsUrl = `${environment.baseUrl}/atm-httum/all/paginated`;

//     return this.http.get<any>(fetchApprovedHTTUMRecordsUrl, {
//       params: {
//         page: page,
//         size: limit,
//         status: "Approved",
//         Date: date,
//       },
//     });
//   }

//   fetchRejectedHTTUMRecords(page, limit, date) {
//     const fetchRejectedHTTUMRecordsUrl = `${environment.baseUrl}/atm-httum/all/paginated`;

//     return this.http.get<any>(fetchRejectedHTTUMRecordsUrl, {
//       params: {
//         page: page,
//         size: limit,
//         status: "Rejected",
//         Date: date,
//       },
//     });
//   }

//   fetchPostedHTTUMRecords(page, limit, date) {
//     const fetchPostedHTTUMRecordsUrl = `${environment.baseUrl}/atm-httum/all/paginated`;

//     return this.http.get<any>(fetchPostedHTTUMRecordsUrl, {
//       params: {
//         page: page,
//         size: limit,
//         status: "Posted",
//         Date: date,
//       },
//     });
//   }

//   fetchFailedHTTUMRecords(page, limit, date) {
//     const fetchFailedHTTUMRecordsUrl = `${environment.baseUrl}/atm-httum/all/paginated`;

//     return this.http.get<any>(fetchFailedHTTUMRecordsUrl, {
//       params: {
//         page: page,
//         size: limit,
//         status: "Failed",
//         Date: date,
//       },
//     });
//   }

//   verifyHTTUMRecord(params) {
//     const fetchRejectedHTTUMRecordsUrl = `${environment.baseUrl}/atm-httum/approve`;

//     return this.http.put<any>(fetchRejectedHTTUMRecordsUrl, {}, { params });
//   }

//   //airtime starts here

//   initiateAirtimeReconciliation(date: string): Observable<any> {
//     const formDataUrl = `${environment.baseUrl}/equitel-airtime/init?date=${date}`;

//     return this.http.post<any>(formDataUrl, {});
//   }

//   searchAirtime(value: string, status: string, dateString: string) {
//     const url = `${environment.baseUrl}/equitel-airtime/all/pagination/search/searchValue?date=${dateString}&status=${status}&value=${value}`;
//     return this.http.get(url);
//   }

//   getAirtimeAnalytics(): Observable<any> {
//     const getAirtimeAnalyticsUrl = `${environment.baseUrl}/equitel-airtime/all/analytics`;

//     return this.http.get<any>(getAirtimeAnalyticsUrl);
//   }

//   VerifyEquitelAirtimeExceptions(exceptions): Observable<any> {
//     const VerifyExceptionsUrl = `${environment.baseUrl}/equitel-airtime/verify-exception-records`;

//     return this.http.post<any>(VerifyExceptionsUrl, exceptions);
//   }

//   getAllAirtimeReconcilliationRecords(
//     page,
//     limit,
//     reconStatus,
//     reconDate?,
//   ): Observable<any> {
//     const getAllAirtimeReconcilliationRecordsUrl = `${environment.baseUrl}/equitel-airtime/all/pagination`;

//     return this.http.get<any>(getAllAirtimeReconcilliationRecordsUrl, {
//       params: { page: page, size: limit, reconStatus, date: reconDate },
//     });
//   }

//   getAllMatchedAirtimeReconciallitionRecords(
//     page,
//     limit,
//     reconStatus,
//     reconDate?,
//   ): Observable<any> {
//     const getAllMatchedAirtimeReconciallitionRecordsUrl = `${environment.baseUrl}/equitel-airtime/all/pagination/status`;

//     return this.http.get<any>(getAllMatchedAirtimeReconciallitionRecordsUrl, {
//       params: {
//         page: page,
//         size: limit,
//         reconStatus,
//         date: reconDate,
//         status: "Match",
//       },
//     });
//   }

//   getAllMismatchAirtimeReconcilliationRecords(
//     page,
//     limit,
//     reconStatus,
//     reconDate?,
//   ): Observable<any> {
//     const getAllMismatchAirtimeReconcilliationRecordsUrl = `${environment.baseUrl}/equitel-airtime/all/pagination/status`;

//     return this.http.get<any>(getAllMismatchAirtimeReconcilliationRecordsUrl, {
//       params: {
//         page: page,
//         size: limit,
//         status: "Exception",
//         reconStatus,
//         date: reconDate,
//       },
//     });
//   }

//   fetchAutoreversedAirtimeTransactionRecords(
//     page,
//     limit,
//     reconStatus,
//     reconDate?,
//   ) {
//     const fetchRejectedHTTUMRecordsUrl = `${environment.baseUrl}/equitel-airtime/all/pagination/status`;

//     return this.http.get<any>(fetchRejectedHTTUMRecordsUrl, {
//       params: {
//         page: page,
//         size: limit,
//         status: "Auto Reversed",
//         reconStatus,
//         date: reconDate,
//       },
//     });
//   }

//   fetchMpesaAirtimeTransactionRecords(page, limit, reconStatus, reconDate?) {
//     const fetchRejectedHTTUMRecordsUrl = `${environment.baseUrl}/equitel-airtime/all/pagination/status`;

//     return this.http.get<any>(fetchRejectedHTTUMRecordsUrl, {
//       params: {
//         page: page,
//         size: limit,
//         reconStatus,
//         date: reconDate,
//         status: "Mpesa",
//       },
//     });
//   }

//   fetchVerifiedExceptionsRecords(page, limit, reconStatus, reconDate?) {
//     const fetchRejectedHTTUMRecordsUrl = `${environment.baseUrl}/equitel-airtime/all/pagination/status`;

//     return this.http.get<any>(fetchRejectedHTTUMRecordsUrl, {
//       params: {
//         page: page,
//         size: limit,
//         reconStatus,
//         date: reconDate,
//         status: "Verified",
//       },
//     });
//   }

//   generateAllAirtimeExcelReport(): Observable<any> {
//     let headers = new HttpHeaders();
//     headers.append("Accept", "application/octet-stream");
//     let requestOptions: any = {
//       headers: headers,
//       responseType: "blob",
//       withCredentials: false,
//     };
//     let API_URL = `${environment.baseUrl}/equitel-airtime/excel/status`;
//     return this.http.get(API_URL, requestOptions).pipe(
//       map((response) => {
//         return {
//           data: new Blob([response], { type: "octet/stream" }),
//         };
//       }),
//     );
//   }

//   generateMatchAirtimeReconcilliationRecordsExcelReport(
//     reconDate,
//     reconStatus,
//   ): Observable<any> {
//     let headers = new HttpHeaders();
//     headers.append("Accept", "application/octet-stream");
//     let requestOptions: any = {
//       params: { status: "Match", date: reconDate, reconStatus: reconStatus },
//       headers: headers,
//       responseType: "blob",
//       withCredentials: false,
//     };
//     let API_URL = `${environment.baseUrl}/equitel-airtime/excel/status`;
//     return this.http.get(API_URL, requestOptions).pipe(
//       map((response) => {
//         return {
//           data: new Blob([response], { type: "octet/stream" }),
//         };
//       }),
//     );
//   }

//   generateVerifiedRecordsExcelReport(reconDate, reconStatus): Observable<any> {
//     let headers = new HttpHeaders();
//     headers.append("Accept", "application/octet-stream");
//     let requestOptions: any = {
//       params: { status: "Verified", date: reconDate, reconStatus: reconStatus },
//       headers: headers,
//       responseType: "blob",
//       withCredentials: false,
//     };
//     let API_URL = `${environment.baseUrl}/equitel-airtime/excel/status`;
//     return this.http.get(API_URL, requestOptions).pipe(
//       map((response) => {
//         return {
//           data: new Blob([response], { type: "octet/stream" }),
//         };
//       }),
//     );
//   }

//   generateAutoReversedRecordsExcelReport(): Observable<any> {
//     let headers = new HttpHeaders();
//     headers.append("Accept", "application/octet-stream");
//     let requestOptions: any = {
//       params: { status: "Auto Reversed" },
//       headers: headers,
//       responseType: "blob",
//       withCredentials: false,
//     };
//     let API_URL = `${environment.baseUrl}/equitel-airtime/excel/status`;
//     return this.http.get(API_URL, requestOptions).pipe(
//       map((response) => {
//         return {
//           data: new Blob([response], { type: "octet/stream" }),
//         };
//       }),
//     );
//   }

//   generateMpesaRecordsExcelReport(reconDate, reconStatus): Observable<any> {
//     let headers = new HttpHeaders();
//     headers.append("Accept", "application/octet-stream");
//     let requestOptions: any = {
//       params: { status: "Mpesa", date: reconDate, reconStatus: reconStatus },
//       headers: headers,
//       responseType: "blob",
//       withCredentials: false,
//     };
//     let API_URL = `${environment.baseUrl}/equitel-airtime/excel/status`;
//     return this.http.get(API_URL, requestOptions).pipe(
//       map((response) => {
//         return {
//           data: new Blob([response], { type: "octet/stream" }),
//         };
//       }),
//     );
//   }

//   generateAirtimeExceptionRecordsExcelReport(): Observable<any> {
//     let headers = new HttpHeaders();
//     headers.append("Accept", "application/octet-stream");
//     let requestOptions: any = {
//       params: { status: "Match" },
//       headers: headers,
//       responseType: "blob",
//       withCredentials: false,
//     };
//     let API_URL = `${environment.baseUrl}/equitel-airtime/excel/status`;
//     return this.http.get(API_URL, requestOptions).pipe(
//       map((response) => {
//         return {
//           data: new Blob([response], { type: "octet/stream" }),
//         };
//       }),
//     );
//   }

//   generateMismatchAirtimeReconcilliationExcelReport(): Observable<any> {
//     let headers = new HttpHeaders();
//     headers.append("Accept", "application/octet-stream");
//     let requestOptions: any = {
//       params: { status: "Mismatch" },
//       headers: headers,
//       responseType: "blob",
//       withCredentials: false,
//     };
//     let API_URL = `${environment.baseUrl}/equitel-airtime/excel/status`;
//     return this.http.get(API_URL, requestOptions).pipe(
//       map((response) => {
//         return {
//           data: new Blob([response], { type: "octet/stream" }),
//         };
//       }),
//     );
//   }

//   generateExceptionsAirtimeReconcilliationExcelReport(
//     reconDate,
//     reconStatus,
//   ): Observable<any> {
//     let headers = new HttpHeaders();
//     headers.append("Accept", "application/octet-stream");
//     let requestOptions: any = {
//       params: {
//         status: "Exception",
//         date: reconDate,
//         reconStatus: reconStatus,
//       },
//       headers: headers,
//       responseType: "blob",
//       withCredentials: false,
//     };
//     let API_URL = `${environment.baseUrl}/equitel-airtime/excel/status`;
//     return this.http.get(API_URL, requestOptions).pipe(
//       map((response) => {
//         return {
//           data: new Blob([response], { type: "octet/stream" }),
//         };
//       }),
//     );
//   }

//   generateTransactionRecordsExcel(
//     status: string,
//     reconDate: any,
//     reconType: any,
//   ): Observable<any> {
//     let headers = new HttpHeaders();
//     headers.append("Accept", "application/octet-stream");
//     let requestOptions: any = {
//       params: { status: status, date: reconDate, reconType: reconType },
//       headers: headers,
//       responseType: "blob",
//       withCredentials: false,
//     };
//     let API_URL = `${environment.baseUrl}/equitel-airtime/excel/httum`;
//     return this.http.get(API_URL, requestOptions).pipe(
//       map((response) => {
//         return {
//           data: new Blob([response], { type: "octet/stream" }),
//         };
//       }),
//     );
//   }

//   generateNoRNNAirtimeReconcilliationExcelReport(): Observable<any> {
//     let headers = new HttpHeaders();
//     headers.append("Accept", "application/octet-stream");
//     let requestOptions: any = {
//       params: { status: "NO_RRN" },
//       headers: headers,
//       responseType: "blob",
//       withCredentials: false,
//     };
//     let API_URL = `${environment.baseUrl}/equitel-airtime/excel/status`;
//     return this.http.get(API_URL, requestOptions).pipe(
//       map((response) => {
//         return {
//           data: new Blob([response], { type: "octet/stream" }),
//         };
//       }),
//     );
//   }

//   // generateTransactionRecordsExcel(status: string, date: any, reconType: any): Observable<any> {
//   //     let headers = new HttpHeaders();
//   //     headers.append("Accept", "application/octet-stream");
//   //     let requestOptions: any = {
//   //         params: {status: status, date: date, reconType: reconType},
//   //         headers: headers,
//   //         responseType: "blob",
//   //         withCredentials: false,
//   //     };
//   //     let API_URL = `${environment.baseUrl}/equitel-airtime/excel/httum`;
//   //     return this.http.get(API_URL, requestOptions).pipe(
//   //         map((response) => {
//   //             return {
//   //                 data: new Blob([response], {type: "octet/stream"}),
//   //             };
//   //         })
//   //     );
//   // }

//   generateTransactionRecordsExcelKenya(
//     status: string,
//     date: any,
//     reconType: any,
//   ): Observable<any> {
//     let headers = new HttpHeaders();
//     headers.append("Accept", "application/octet-stream");
//     let requestOptions: any = {
//       params: { status: status, date: date, reconType: reconType },
//       headers: headers,
//       responseType: "blob",
//       withCredentials: false,
//     };
//     let API_URL = `${environment.baseUrl}/api/v1/airtime-recon/excel/httum`;
//     return this.http.get(API_URL, requestOptions).pipe(
//       map((response) => {
//         return {
//           data: new Blob([response], { type: "octet/stream" }),
//         };
//       }),
//     );
//   }

//   generateRNNNotMatchAirtimeReconcilliationExcelReport(): Observable<any> {
//     let headers = new HttpHeaders();
//     headers.append("Accept", "application/octet-stream");
//     let requestOptions: any = {
//       params: { status: "RRN  Mismatch" },
//       headers: headers,
//       responseType: "blob",
//       withCredentials: false,
//     };
//     let API_URL = `${environment.baseUrl}/equitel-airtime/excel/status`;
//     return this.http.get(API_URL, requestOptions).pipe(
//       map((response) => {
//         return {
//           data: new Blob([response], { type: "octet/stream" }),
//         };
//       }),
//     );
//   }

//   generateAirtimeHTTUMReconcilliationExcelFile(): Observable<any> {
//     let headers = new HttpHeaders();
//     headers.append("Accept", "application/octet-stream");
//     let requestOptions: any = {
//       headers: headers,
//       responseType: "blob",
//       withCredentials: false,
//     };
//     let API_URL = `${environment.baseUrl}/equitel-airtime/excel/status`;
//     return this.http.get(API_URL, requestOptions).pipe(
//       map((response) => {
//         return {
//           data: new Blob([response], { type: "octet/stream" }),
//         };
//       }),
//     );
//   }

//   editAirtimeExceptionTransaction(transaction): Observable<any> {
//     const geditExceptionTransactionUrl = `${environment.baseUrl}/atm-httum/airtime/add`;

//     return this.http.post<any>(geditExceptionTransactionUrl, transaction);
//   }

//   approveAirtimeHTTUMRecord(params): Observable<any> {
//     const approveAirtimeHTTUMRecordUrl = `${environment.baseUrl}/api/v1/httum/airtime/update`;

//     return this.http.put<any>(approveAirtimeHTTUMRecordUrl, {}, { params });
//   }

//   bulkApproveHTTUMRecords(records): Observable<any> {
//     const approveAirtimeHTTUMRecordUrl = `${environment.baseUrl}/equitel-airtime-httum/update/bulk`;

//     return this.http.put<any>(approveAirtimeHTTUMRecordUrl, records);
//   }

//   approveBulk(records): Observable<any> {
//     const approveAirtimeHTTUMRecordUrl = `${environment.baseUrl}/atm-httum/approve/bulk`;

//     return this.http.put<any>(approveAirtimeHTTUMRecordUrl, records);
//   }

//   fetchPendingAirtimeHTTUMRecords(page, limit, date) {
//     const fetchPendingHTTUMRecordsUrl = `${environment.baseUrl}/equitel-airtime-httum/all/paginated`;

//     return this.http.get<any>(fetchPendingHTTUMRecordsUrl, {
//       params: {
//         page: page,
//         size: limit,
//         status: "Pending",
//         date,
//       },
//     });
//   }

//   fetchApprovedAirtimeHTTUMRecords(page, limit, date) {
//     const fetchApprovedHTTUMRecordsUrl = `${environment.baseUrl}/equitel-airtime-httum/all/paginated`;

//     return this.http.get<any>(fetchApprovedHTTUMRecordsUrl, {
//       params: {
//         page: page,
//         size: limit,
//         status: "Approved",
//         date,
//       },
//     });
//   }

//   fetchRejectedAirtimeHTTUMRecords(page, limit, date) {
//     const fetchRejectedHTTUMRecordsUrl = `${environment.baseUrl}/equitel-airtime-httum/all/paginated`;

//     return this.http.get<any>(fetchRejectedHTTUMRecordsUrl, {
//       params: {
//         page: page,
//         size: limit,
//         status: "Rejected",
//         date,
//       },
//     });
//   }

//   fetchPostedAirtimeHTTUMRecords(page, limit, date) {
//     const fetchRejectedHTTUMRecordsUrl = `${environment.baseUrl}/equitel-airtime-httum/all/paginated`;

//     return this.http.get<any>(fetchRejectedHTTUMRecordsUrl, {
//       params: {
//         page: page,
//         size: limit,
//         status: "Posted",
//         date,
//       },
//     });
//   }

//   fetchFailedAirtimeHTTUMRecords(page, limit, date) {
//     const fetchRejectedHTTUMRecordsUrl = `${environment.baseUrl}/equitel-airtime-httum/all/paginated`;

//     return this.http.get<any>(fetchRejectedHTTUMRecordsUrl, {
//       params: {
//         page: page,
//         size: limit,
//         status: "Failed",
//         date,
//       },
//     });
//   }

//   getAllArchivedAirtimeReconcilliationRecords(
//     page,
//     limit,
//     date?,
//   ): Observable<any> {
//     const getAllArchivedAirtimeReconcilliationRecordsUrl = `${environment.baseUrl}/equitel-airtime/archive/all/pagination/status`;

//     return this.http.get<any>(getAllArchivedAirtimeReconcilliationRecordsUrl, {
//       params: { page: page, size: limit, date: date },
//     });
//   }

//   getArchivedMatchedAirtimeReconciallitionRecords(
//     page,
//     limit,
//     date?,
//   ): Observable<any> {
//     const getArchivedMatchedAirtimeReconciallitionRecordsUrl = `${environment.baseUrl}/equitel-airtime/archive/all/pagination/status`;

//     return this.http.get<any>(
//       getArchivedMatchedAirtimeReconciallitionRecordsUrl,
//       {
//         params: { page: page, size: limit, date: date, status: "Match" },
//       },
//     );
//   }

//   getArchivedMismatchAirtimeReconcilliationRecords(
//     page,
//     limit,
//     date?,
//   ): Observable<any> {
//     const getArchivedMismatchAirtimeReconcilliationRecordsUrl = `${environment.baseUrl}/equitel-airtime/archive/all/pagination/status`;

//     return this.http.get<any>(
//       getArchivedMismatchAirtimeReconcilliationRecordsUrl,
//       {
//         params: { page: page, size: limit, date: date, status: "Exception" },
//       },
//     );
//   }

//   fetchArchivedAutoreversedAirtimeTransactionRecords(page, limit, date?) {
//     const fetchArchivedAutoreversedAirtimeTransactionRecordsUrl = `${environment.baseUrl}/equitel-airtime/archive/all/pagination/status`;

//     return this.http.get<any>(
//       fetchArchivedAutoreversedAirtimeTransactionRecordsUrl,
//       {
//         params: {
//           page: page,
//           size: limit,
//           date: date,
//           status: "Verified",
//         },
//       },
//     );
//   }

//   fetchArchivedMpesaAirtimeTransactionRecords(page, limit, date?) {
//     const fetchArchivedMpesaAirtimeTransactionRecordsUrl = `${environment.baseUrl}/equitel-airtime/archive/all/pagination/status`;

//     return this.http.get<any>(fetchArchivedMpesaAirtimeTransactionRecordsUrl, {
//       params: {
//         page: page,
//         size: limit,
//         date: date,
//         status: "Mpesa",
//       },
//     });
//   }

//   searchArchiveData(page, limit, searchValue) {
//     const searchArchiveDataUrl = `${environment.baseUrl}/equitel-airtime/archive/all/pagination/search/searchValue`;

//     return this.http.get<any>(searchArchiveDataUrl, {
//       params: { page: page, size: limit, searchValue: searchValue },
//     });
//   }

//   findAirtimeReconRecords() {
//     const findAirtimeReconRecordsUrl = `${environment.baseUrl}/api/v1/recon-management/airtime-reconciliation-records`;

//     return this.http.get<any>(findAirtimeReconRecordsUrl);
//   }

//   redoAirtimeRecon(reconRecordDetails) {
//     const redoAirtimeReconUrl = `${environment.baseUrl}/api/v1/recon-management/update-airtime-recon-record`;

//     return this.http.put<any>(redoAirtimeReconUrl, reconRecordDetails);
//   }

//   verifyATMExceptions(exceptions) {
//     const verifyATMExceptionsUrl = `${environment.baseUrl}/atm-recon/verify-exception-records`;

//     return this.http.put<any>(verifyATMExceptionsUrl, exceptions);
//   }

//   //B2C services
//   getArchivedMatchedB2cReconcilliationRecords(
//     page,
//     limit,
//     date?,
//   ): Observable<any> {
//     const getArchivedMatchedB2cReconcilliationRecordsUrl = `${environment.baseUrl}/api/v1/archivedFiles/find/pgination/archicivedByDateAndStatus`;

//     return this.http.get<any>(getArchivedMatchedB2cReconcilliationRecordsUrl, {
//       params: { page: page, size: limit, date: date, status: "Match" },
//     });
//   }

//   getArchivedMismatchB2cReconcilliationRecords(
//     page,
//     limit,
//     date?,
//   ): Observable<any> {
//     const getArchivedMismatchB2cReconcilliationRecordsUrl = `${environment.baseUrl}/api/v1/archivedFiles/find/pgination/archicivedByDateAndStatus`;

//     return this.http.get<any>(getArchivedMismatchB2cReconcilliationRecordsUrl, {
//       params: { page: page, size: limit, date: date, status: "Exception" },
//     });
//   }

//   getAllArchivedB2cReconcilliationRecords(page, limit, date?): Observable<any> {
//     const getAllArchivedB2cReconcilliationRecordsUrl = `${environment.baseUrl}/api/v1/archivedFiles/find/pagination/archivedByDate`;

//     return this.http.get<any>(getAllArchivedB2cReconcilliationRecordsUrl, {
//       params: { page: page, size: limit, date: date },
//     });
//   }

//   //B2C recon
//   initiateB2cReconciliation(date: string): Observable<any> {
//     const B2cDataUrl = `${environment.baseUrl}/atm-recon/init?date=${date}`;

//     return this.http.post<any>(B2cDataUrl, {});
//   }

//   getB2cMatchedTransactions(page, limit): Observable<any> {
//     const B2cTransUrl = `${environment.baseUrl}/b2c-kenya/all/pagination/perStatus`;

//     return this.http.get<any>(B2cTransUrl, {
//       params: { page: page, size: limit, status: "Match" },
//     });
//   }

//   getB2cMismatchTransactions(page, limit): Observable<any> {
//     const B2cTransUrl = `${environment.baseUrl}/b2c-kenya/all/pagination/perStatus`;

//     return this.http.get<any>(B2cTransUrl, {
//       params: { page: page, size: limit, status: "Exception" },
//     });
//   }

//   getAllB2cRecords(page, limit): Observable<any> {
//     const B2cTransUrl = `${environment.baseUrl}/b2c-kenya/find/pagination/all`;

//     return this.http.get<any>(B2cTransUrl, {
//       params: { page: page, size: limit },
//     });
//   }

//   //vinamic
//   getSummary(): Observable<any> {
//     const url = `${environment.baseUrl}api/v1/vynamic`;
//     return this._http.get<any>(url);
//   }

//   getSummaryofAtm(): Observable<any> {
//     const vinamic = `${environment.apiUrl}/api/v1/vynamic`;
//     return this._http.get<any>(vinamic);
//   }

//   getData(): Observable<any> {
//     const datedUrl = `${environment.apiUrl}/api/v1/vynamic/mergedData`;
//     return this._http.get<any>(datedUrl);
//   }

//   initiateReconciliation(date) {
//     const initUrl = `${environment.apiUrl}/api/v1/vynamic/mergedData?date=${date}`;
//     return this._http.get<any>(initUrl, {});
//   }

//   getMatchedDataRead(date: String): Observable<any> {
//     const matchedUrl = `${environment.apiUrl}/api/v1/vynamic/mergedData?date=${date}`;
//     return this._http.get<any>(matchedUrl);
//   }

//   getVarianceData(date: String): Observable<any> {
//     const matchedUrl = `${environment.apiUrl}/api/v1/vynamic/exceptions?date=${date}`;
//     return this._http.get<any>(matchedUrl);
//   }

//   updateAtmRecord(data: any) {
//     return this._http.put(`${environment.apiUrl}/atm-recon/update`, data);
//   }

//   ///httum/particulars
//   generateParticularsExcel(
//     title: string,
//     reconDate: any,
//     reconType: any,
//   ): Observable<any> {
//     let headers = new HttpHeaders();
//     headers.append("Accept", "application/octet-stream");
//     let requestOptions: any = {
//       params: { status: title, date: reconDate, reconType: reconType },
//       headers: headers,
//       responseType: "blob",
//       withCredentials: false,
//     };
//     let API_URL = `${environment.baseUrl}/httum/particulars`;
//     return this.http.get(API_URL, requestOptions).pipe(
//       map((response) => {
//         return {
//           data: new Blob([response], { type: "octet/stream" }),
//         };
//       }),
//     );
//   }
// }
