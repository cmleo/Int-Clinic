import { Component } from '@angular/core';
import { User } from '@angular/fire/auth';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.scss'],
})
export class UserLoginComponent {
  hide = true;

  users: User[] = [];

  email = '';
  password = '';

  error: { message: string } = { message: '' };

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]),
    password: new FormControl('', { validators: Validators.required }),
  });

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin() {
    const email = this.loginForm.controls.email.value as string;
    const password = this.loginForm.controls.password.value as string;

    this.authService
      .signIn(email, password)
      .then(() => {
        return this.authService.getCurrentUserUid().then(data => {
          this.authService.getUserRole(data).subscribe(role => {
            if (role === 'patient') {
              this.router.navigate(['patient/dashboard/current']);
            }
            if (role === 'doctor') {
              this.router.navigate(['doctor/dashboard/current']);
            }
            if (role === 'admin') {
              this.router.navigate(['admin/clinics']);
            }
          });
        });
      })
      .catch(error => {
        switch (error.code) {
          case 'auth/invalid-email': {
            this.error.message = 'Email obligatoriu';
            break;
          }
          case 'auth/missing-password': {
            this.error.message = 'Parolă obligatorie';
            break;
          }
          case 'auth/wrong-password': {
            this.error.message = 'Email sau parolă incorecte. Te rog să încerci din nou';
            break;
          }
          case 'auth/user-not-found': {
            this.error.message = 'Email sau parolă incorecte. Te rog să încerci din nou';
            break;
          }
          case 'auth/too-many-requests': {
            this.error.message = 'Cont blocat, numărul de cereri depășite. Te rog să încerci mai târziu';
            break;
          }
          default: {
            this.error.message = 'Eroare internă, te rog să încerci mai târziu';
            break;
          }
        }
      });
  }

  onLoginWithGoogle() {
    this.authService.patientGoogleSignIn().then(() => {
      this.router.navigate(['patient/dashboard/current']);
    });
  }

  onRouterSignUp() {
    this.router.navigate(['sign-up']);
  }
}
