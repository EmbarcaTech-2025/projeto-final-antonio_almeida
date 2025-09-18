import { createAction, props } from '@ngrx/store';
import { UserData } from '../models/user-data';

export const registration = createAction(
  '[Registration Form] Registration',
  props<{ user: UserData }>()
);
export const registrationSuccess = createAction(
  '[Registration Form] Registration User Success',
  props<{ user: UserData }>()
);
export const registrationFailure = createAction(
  '[Registration Form] Registration User Failure',
  props<{ error: any }>()
);
export const startUpdate = createAction(
  '[Registration Form] Start Update',
  props<{ userId: string }>()
);
export const loadUserSuccess = createAction(
  '[Registration Form] Load User Success',
  props<{ user: UserData }>()
);
export const loadUserFailure = createAction(
  '[Registration Form] Load User Failure',
  props<{ error: any }>()
);
export const setLoading = createAction(
  '[Registration Form] Set Loading',
  props<{ isLoading: boolean }>()
);
