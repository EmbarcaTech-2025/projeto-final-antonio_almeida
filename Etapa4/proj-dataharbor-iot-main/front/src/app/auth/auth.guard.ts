import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from "@angular/router";
import { Injectable } from "@angular/core";
import { Observable, combineLatest } from "rxjs";
import { AppState } from "./reducers";
import { select, Store } from "@ngrx/store";
import { isLoggedIn, selectAuthRole } from "./selectors/auth.selectors";
import { map, tap } from "rxjs/operators";

@Injectable()
export class AuthGuard {
  constructor(private store: Store<AppState>, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const expectedRole = route.data['role'] as string; // pegar role da rota

    return combineLatest([
      this.store.select(isLoggedIn),
      this.store.select(selectAuthRole)
    ]).pipe(
      map(([loggedIn, role]) => {
        if (!loggedIn) return false; // não logado
        if (expectedRole && role !== expectedRole) return false; // role não permitido
        return true;
      }),
      tap((canAccess) => {
        if (!canAccess) {
          this.router.navigateByUrl("/login"); // ou página de "sem permissão"
        }
      })
    );
  }
}
