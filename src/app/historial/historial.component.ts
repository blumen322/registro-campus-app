import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Auth, signOut } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { HistorialService } from '../services/historial.service';
import { AlumnoService } from '../services/alumno.service';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';
import { Entrada } from '../models/entrada.model';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './historial.component.html'
})
export class HistorialComponent implements OnInit {
  private auth = inject(Auth);
  private router = inject(Router);
  private hSvc = inject(HistorialService);
  private fs = inject(Firestore);

  entradas: Entrada[] = [];
  cod = '';
  err = '';
  ok = '';
  cargando = false;

  ngOnInit() {
    this.hSvc.getHoy().subscribe(e => this.entradas = e);
  }

  private getFecha(): string {
    const d = new Date();
    return `${String(d.getDate()).padStart(2,'0')}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getFullYear()).slice(2)}`;
  }

  private getHora(): string {
    const d = new Date();
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }

  async registrarEntrada() {
    this.err = ''; this.ok = '';
    if (!this.cod.trim()) { this.err = 'Ingresa un código de alumno.'; return; }
    this.cargando = true;
    try {
      const col = collection(this.fs, 'alumnos');
      const q = query(col, where('cod', '==', this.cod.trim()));
      const snap = await getDocs(q);
      if (snap.empty) { this.err = 'Código no encontrado. Verifica el dato.'; this.cargando = false; return; }
      const a = snap.docs[0].data() as any;
      await this.hSvc.registrar({
        cod: a.cod, nom: a.nom, fac: a.fac,
        fecha: this.getFecha(),
        hora: this.getHora()
      });
      this.ok = `Entrada registrada: ${a.nom}`;
      this.cod = '';
    } catch {
      this.err = 'Error al registrar la entrada.';
    } finally {
      this.cargando = false;
    }
  }

  async salir() {
    await signOut(this.auth);
    this.router.navigate(['/login']);
  }
}