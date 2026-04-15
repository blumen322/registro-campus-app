import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.component.html'
})
export class SignupComponent {
  private auth = inject(Auth);
  private router = inject(Router);

  email = '';
  pass = '';
  pass2 = '';
  err = '';
  cargando = false;

  async registrar() {
    this.err = '';
    if (this.pass !== this.pass2) { this.err = 'Las contraseñas no coinciden.'; return; }
    if (this.pass.length < 6) { this.err = 'La contraseña debe tener al menos 6 caracteres.'; return; }
    this.cargando = true;
    try {
      await createUserWithEmailAndPassword(this.auth, this.email, this.pass);
      this.router.navigate(['/registro']);
    } catch (e: any) {
      this.err = e.code === 'auth/email-already-in-use'
        ? 'Este correo ya tiene una cuenta.'
        : 'Error al crear la cuenta. Intenta de nuevo.';
    } finally {
      this.cargando = false;
    }
  }
}