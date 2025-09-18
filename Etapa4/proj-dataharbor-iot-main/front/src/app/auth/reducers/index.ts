/*
Mapa de reducers da aplicação (ActionReducerMap)
É basicamente um “dicionário” que liga cada fatia do estado global a um reducer específico.
Lembra que na arquitetura do NgRx, o estado da aplicação é centralizado em uma store única, 
mas essa store pode ter vários “sub-estados” (fatias).
Cada fatia precisa de alguém que saiba como atualizar esse pedaço do estado quando ações são 
disparadas — esse alguém é o reducer.
*/

// Importações do NgRx
import { ActionReducerMap, MetaReducer } from '@ngrx/store'; // Tipos para mapear reducers e meta-reducers
import { environment } from '../../../environments/environment'; // Importa variáveis de ambiente (produção/desenvolvimento)

// Importa o reducer de autenticação e o tipo do estado dele
import { authReducer, AuthState } from './auth.reducer';

// Define a interface do estado global da aplicação
export interface AppState {
  auth: AuthState; // 'auth' será gerenciado pelo authReducer
}

/*
Aqui, auth é a fatia do estado que lida com autenticação.
authReducer é a função que recebe o estado atual + ação, e retorna um novo estado atualizado.
*/

// Mapeia quais reducers cuidam de cada parte do estado global
export const reducers: ActionReducerMap<AppState> = {
  auth: authReducer, // quando ações relacionadas a auth forem disparadas, authReducer processará
};

// Exemplo de meta-reducer para logging
export function logger(reducer: any): any {
  return (state: any, action: any) => {
    // Antes do reducer processar, imprime estado atual e ação disparada
    console.log('state before: ', state);
    console.log('action', action);

    // Chama o reducer real, que vai atualizar o estado de acordo com a ação
    return reducer(state, action);
  };
}

// Lista de meta-reducers aplicados à store
export const metaReducers: MetaReducer<AppState>[] = !environment.production
  ? [logger] // Se não estiver em produção, habilita o logger
  : []; // Em produção, nenhum meta-reducer é aplicado
