import { createReducer, on } from '@ngrx/store';
import * as authActions from '../actions/auth.actions';

export interface AuthState {
  token: string | null;
  role: string | null;
  error: any;
}

export const initialState: AuthState = {
  token: null,
  role: null,
  error: null,
};

export const authReducer = createReducer(
  initialState,
  on(authActions.loginSuccess, (state, { token, role }) => ({
    ...state,
    token,
    role,
    error: null,
  })),
  on(authActions.loginFailure, (state, { error }) => ({
    ...state,
    token: null,
    role: null,
    error: error,
  })),
  on(authActions.logout, (state) => ({
    ...state,
    token: null,
    role: null,
    error: null,
  }))
);
