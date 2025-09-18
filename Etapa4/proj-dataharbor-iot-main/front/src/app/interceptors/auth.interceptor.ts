import { Injectable, NgModule } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { Observable, switchMap, take } from 'rxjs';
import { environment } from '../../environments/environment';
import { select, Store } from '@ngrx/store';
import { selectAuthToken } from '.././auth/selectors/auth.selectors';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private store: Store) {}

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    console.log('Req..: ', JSON.stringify(req));
    return this.store.pipe(
      select(selectAuthToken),
      take(1),
      switchMap((token) => {
        const url = `${environment.apiUrlBase.replace(/\/$/, '')}/${req.url.replace(/^\//, '')}`;
        let modifiedRequest = req.clone({ url: url });        
        if (token) {
          modifiedRequest = modifiedRequest.clone({
            setHeaders: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });
        } else {
          modifiedRequest = modifiedRequest.clone({
            setHeaders: {
              'Content-Type': 'application/json',
            },
          });
        }
        console.log('Req modified..: ', JSON.stringify(modifiedRequest));
        return next.handle(modifiedRequest);
      })
    );
  }
}

@NgModule({
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
})
export class HttpRequestInterceptor {}