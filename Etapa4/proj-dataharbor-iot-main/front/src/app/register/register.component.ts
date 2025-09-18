import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { phoneValidator } from './phoneValidator';
import { Store } from '@ngrx/store';
import { UserData } from './models/user-data';
import { userActions } from './actions/action-types';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent implements OnInit {
  public roles: string[] = ['ADMIN', 'USER', 'TEC'];

  public countries: string[] = [
    'Brasil',
    'Chile',
    'Bolívia',
    'USA',
    'Paraguai',
  ];

  hide = true;

  public registrationForm!: FormGroup;
  public userIdToUpdate!: number;
  public isUpdateActive: boolean = false;

  constructor(
    private fb: FormBuilder,
    private activateRoute: ActivatedRoute,
    private router: Router,
    private store: Store
  ) {}

  ngOnInit(): void {
    this.formBuilderInit();
  }

  formBuilderInit(): void {
    this.registrationForm = this.fb.group(
      {
        login:[''],
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        role: ['', [Validators.required]],
        mobile: [
          '',
          [
            Validators.required,
            Validators.required,
            phoneValidator(),
          ],
        ],
        street: ['', [Validators.required]],
        city: ['', [Validators.required]],
        state: ['', [Validators.required]],
        country: ['Brasil', [Validators.required]],
        password: [
          '',
          [
            Validators.required,
            Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])(?=.{6,})/),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(registerForm: FormGroup) {
    const password = registerForm.get('password')?.value;
    const confirmPassword = registerForm.get('confirmPassword')?.value;

    if (password === confirmPassword) {
      registerForm.get('confirmPassword')?.setErrors(null);
    } else {
      registerForm
        .get('confirmPassword')
        ?.setErrors({ passwordMismatch: true });
    }
  }

  togglePasswordVisibility(): void {
    this.hide = !this.hide;
  }

  onSubmit() {
    const registerActionPayload = { ...this.registrationForm.value };
    delete registerActionPayload.confirmPassword;
    this.store.dispatch(userActions.registration({ user: registerActionPayload }));
  }


  onUpdate() {}
}
