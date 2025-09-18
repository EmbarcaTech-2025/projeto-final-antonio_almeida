import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { userActions } from '../actions/action-types';
import { UserService } from '../user.service';
import { catchError, map, of, switchMap } from 'rxjs';
import { UserData } from '../models/user-data';

@Injectable()
export class UserEffects {
  registered$ = createEffect(() =>
    this.actions$.pipe(
      ofType(userActions.registration),
      switchMap((action) =>
        this.userService.setRegisteredUser(action.user).pipe(
          map((response) => userActions.registrationSuccess({ user: response })),
          catchError((error) => of(userActions.registrationFailure({ error })))
        )
      )
    )
  );

  loadRegisteredUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(userActions.registration),
      switchMap(() =>
        this.userService.getRegisteredUser().pipe(
          map((user) => userActions.loadUserSuccess({ user })),
          catchError((error) => of(userActions.loadUserFailure({ error })))
        )
      )
    )
  );

  constructor(private actions$: Actions, private userService: UserService) {}
}
