import { createAction, props } from '@ngrx/store';

export const login = createAction(
  '[Auth] Login',
  props<{ login: string; password: string }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ token: string; role: string }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: { status: string; message: string } }>()
);

export const logout = createAction('[Auth] Logout');
