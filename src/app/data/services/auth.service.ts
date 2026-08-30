// import { HttpClient } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs';
// import { environment } from 'src/environments/environment';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {

//   constructor(private http: HttpClient) { }

//   login(credentials): Observable<any>{
//     const restoreDeletedUserAccountUrl = `${environment.apiUrl}/api/v1/authentication/login`;

//     return this.http.post<any>(restoreDeletedUserAccountUrl, credentials)
//   }

//   forgotPasswordDetails(passwordDetails): Observable<any>{
//     const forgotPasswordDetailsUrl = `${environment.apiUrl}/api/v1/authentication/forgot-password`;

//     return this.http.post<any>(forgotPasswordDetailsUrl, passwordDetails)
//   }

//   resetPassword(passwordDetails): Observable<any>{
//     const resetPasswordUrl = `${environment.apiUrl}/api/v1/authentication/reset-password`;

//     return this.http.put<any>(resetPasswordUrl, passwordDetails)
//   }

//   updateUserPassword(passwordDetails): Observable<any>{
//     const updateUserPasswordUrl = `${environment.apiUrl}/api/v1/authentication/update-user-password`;

//     return this.http.put<any>(updateUserPasswordUrl, passwordDetails)
//   }
// }
