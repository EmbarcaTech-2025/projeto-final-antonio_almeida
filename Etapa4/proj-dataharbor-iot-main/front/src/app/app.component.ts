import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
} from '@angular/router';
import { AppState } from './auth/reducers';
import { isLoggedIn, isLoggedOut } from './auth/selectors/auth.selectors';
import { login, logout } from './auth/actions/auth.actions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  loading = true;

  isLoggedIn$!: Observable<boolean>;

  isLoggedOut$!: Observable<boolean>;

  authRole$!: Observable<string | null>;

  constructor(private router: Router, private store: Store<AppState>) {}

  ngOnInit() {
    // localStorage persistence apenas em MODO DEVELOPMENT, em produção usar JWT
    // alterando em environment.ts e environment.prod.ts
    // const userProfile = localStorage.getItem('user');
    // if (userProfile) {
    //   this.store.dispatch(login({ user: JSON.parse(userProfile) }));
    // }

    this.router.events.subscribe((event) => {
      switch (true) {
        case event instanceof NavigationStart: {
          this.loading = true;
          break;
        }

        case event instanceof NavigationEnd:
        case event instanceof NavigationCancel:
        case event instanceof NavigationError: {
          this.loading = false;
          break;
        }
        default: {
          break;
        }
      }
    });

    this.isLoggedIn$ = this.store.pipe(select(isLoggedIn));
    this.isLoggedOut$ = this.store.pipe(select(isLoggedOut));
    this.authRole$ = this.store.pipe(
      select((state) => state.auth.role),
      distinctUntilChanged(),
      map((role) => role)
    );
  }

  logout() {
    this.store.dispatch(logout());
  }
}
