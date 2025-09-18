import { UserData } from "../models/user-data";

export interface RegistrationFormState {
  userIdToUpdate: string | null;
  user: UserData | null; // UserData é o tipo de dados para usuários
  isUpdateActive: boolean;
  isLoading: boolean;
}

export const initialRegistrationFormState: RegistrationFormState = {
  userIdToUpdate: null,
  user: null,
  isUpdateActive: false,
  isLoading: false,
};
