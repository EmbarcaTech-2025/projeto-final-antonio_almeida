import { createReducer, on } from '@ngrx/store';
import * as RegistrationFormActions from '../actions/register.action';
import{initialRegistrationFormState} from '../state/registration-form.state'


export const registrationFormReducer = createReducer(
  initialRegistrationFormState,

  on(RegistrationFormActions.registration, (state, { user }) => ({
    ...state,
    user,
    isLoading: false,
  })),

  on(RegistrationFormActions.registrationSuccess, (state, { user }) => ({
    ...state,
    user,
    isLoading: false,
  })),

  on(RegistrationFormActions.registrationFailure, (state, { error }) => ({
    ...state,
    error,
    isLoading: false,
  })),

  on(RegistrationFormActions.startUpdate, (state, { userId }) => ({
    ...state,
    userIdToUpdate: userId,
  })),

  on(RegistrationFormActions.loadUserSuccess, (state, { user }) => ({
    ...state,
    user,
    isLoading: false,
  })),

  on(RegistrationFormActions.loadUserFailure, (state, { error }) => ({
    ...state,
    user: null,
    isLoading: false,
    // Adicione lógica para lidar com o erro, se necessário
  })),

  on(RegistrationFormActions.setLoading, (state, { isLoading }) => ({
    ...state,
    isLoading,
  }))
);
