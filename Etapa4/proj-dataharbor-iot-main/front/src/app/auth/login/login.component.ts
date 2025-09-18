import { Component, OnInit } from '@angular/core'; // Componentes Angular e lifecycle hook OnInit
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; // Formulários reativos
import { Router } from '@angular/router'; // Navegação entre rotas
import { Store } from '@ngrx/store'; // NgRx Store para gerenciamento de estado
import * as authActions from '../actions/auth.actions'; // Importa ações de autenticação
import * as authSelectors from '../selectors/auth.selectors'; // Importa selectors de autenticação

@Component({
  selector: 'app-login', // Nome do seletor do componente
  templateUrl: './login.component.html', // Template HTML do componente
  styleUrls: ['./login.component.scss'], // Arquivo de estilo do componente
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup; // Formulário reativo
  errorMessage: string | null = null; // Armazena mensagens de erro
  isLoading: boolean = false; // Flag para indicar carregamento

  constructor(
    private router: Router, // Injeção do Router para navegação
    private fb: FormBuilder, // Injeção do FormBuilder para criar formulários
    private store: Store // Injeção da Store do NgRx
  ) {}

  ngOnInit(): void {
    this.formBuilderInit(); // Inicializa o formulário

    // Assina o estado do token de autenticação na store
    this.store.select(authSelectors.selectAuthToken).subscribe((token) => {
      if (token) {
        // Se existir token, o login foi bem-sucedido
        this.router.navigate(['/institutional']); // Redireciona para a rota institucional
      }
    });

    this.subscribeToErrorMessage(); // Assina mensagens de erro
  }

  // Inicializa o formulário reativo
  formBuilderInit(): void {
    this.loginForm = this.fb.group({
      login: ['', [Validators.required]], // Campo login obrigatório
      password: ['', [Validators.required]], // Campo senha obrigatório
    });
  }

  // Função chamada ao submeter o formulário
  onSubmit(): void {
    // Dispara a ação de login passando login e senha do formulário
    this.store.dispatch(
      authActions.login({
        login: this.loginForm.value.login,
        password: this.loginForm.value.password,
      })
    );

    // Re-ativa a assinatura de mensagens de erro
    this.subscribeToErrorMessage();
  }

  // Observa erros de autenticação e atualiza interface
  private subscribeToErrorMessage() {
    this.store.select(authSelectors.selectAuthError).subscribe((error: any) => {
      if (error?.error) {
        this.isLoading = true; // Ativa carregamento
        this.errorMessage = `${error.error.status} - ${error.error.message}`; // Define mensagem de erro
        setTimeout(() => {
          this.isLoading = false; // Desativa carregamento após 1 segundo
        }, 1000);
      } else {
        this.errorMessage = null; // Limpa a mensagem de erro caso não haja
      }
    });
  }
}
