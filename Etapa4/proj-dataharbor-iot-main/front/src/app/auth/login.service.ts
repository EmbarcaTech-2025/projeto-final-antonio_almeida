import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, catchError, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private loginUrl = 'auth/login';

  constructor(private http: HttpClient, private store: Store) {}

  login(
    login: string,
    password: string
  ): Observable<{ token: string; role: string }> {
    return this.http
      .post<{ token: string; role: string }>(`${this.loginUrl}`, {
        login,
        password,
      })
      .pipe(
        map((result) => result),
        catchError((error: HttpErrorResponse) => {
          const customError = {
            status: error.status.toString(),
            message: error.error.message,
          };
          throw error; // Garante que o erro continua a ser propagado
        })
      );
  }
}
