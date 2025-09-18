import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserData } from './models/user-data';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private registerUrl = 'auth/register';  
  private userAll = `auth`;

  constructor(private http: HttpClient) {}


  public setRegisteredUser(registerDTO: UserData): Observable<any> {
    return this.http.post<any>(`${this.registerUrl}`, registerDTO);
  }

  getRegisteredUser(): Observable<any> {
    return this.http.get<UserData[]>(`${this.userAll}`);
  }
}
