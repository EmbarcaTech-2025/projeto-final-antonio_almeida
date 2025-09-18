import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from '../reducers/auth.reducer';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectAuthError = createSelector(
  selectAuthState,
  (authState: AuthState) => authState.error
);

export const selectAuthToken = createSelector(
  selectAuthState,
  (authState: AuthState) => authState.token
);

export const selectAuthRole = createSelector(
  selectAuthState,
  (authState: AuthState) => authState.role
);

export const isLoggedIn = createSelector(
  selectAuthToken,
  (token) => !!token
);

export const isLoggedOut = createSelector(isLoggedIn, (loggedIn) => !loggedIn);
