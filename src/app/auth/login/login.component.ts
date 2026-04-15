import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private auth = inject(Auth);
  private router = inject(Router);

  email = '';
  pass = '';
  err = '';
  cargando = false;

  async login() {
    this.err = '';
    this.cargando = true;
    try {
      await signInWithEmailAndPassword(this.auth, this.email, this.pass);
      this.router.navigate(['/registro']);
    } catch {
      this.err = 'Correo o contraseña incorrectos.';
    } finally {
      this.cargando = false;
    }
  }
}