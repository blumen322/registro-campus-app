import { Component, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Auth, signOut } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AlumnoService } from '../services/alumno.service';
import { Alumno } from '../models/alumno.model';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registro.component.html'
})
export class RegistroComponent {
  private auth = inject(Auth);
  private router = inject(Router);
  private svc = inject(AlumnoService);

  @ViewChild('qrCanvas') qrCanvas!: ElementRef<HTMLCanvasElement>;

  alumno: Alumno = { nom: '', cod: '', fac: '', email: '', tel: '', fechaReg: '' };
  err = '';
  ok = '';
  cargando = false;
  qrData = '';
  mostrarQr = false;
  idGuardado = '';

  facultades = [
    'Administración y Negocios Internacionales',
    'Ciencias Contables, Económicas y Financieras',
    'Ciencias de la Comunicación',
    'Derecho y Ciencia Política',
    'Educación',
    'Humanidades',
    'Ingeniería y Arquitectura',
    'Medicina Humana',
    'Obstetricia y Enfermería',
    'Odontología',
    'Psicología',
    'Turismo, Hotelería y Gastronomía'
  ];

  private getFechaHoy(): string {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const aa = String(d.getFullYear()).slice(2);
    return `${dd}${mm}${aa}`;
  }

  async guardar() {
    this.err = ''; this.ok = '';
    if (!this.alumno.nom || !this.alumno.cod || !this.alumno.fac || !this.alumno.email) {
      this.err = 'Completa todos los campos obligatorios.'; return;
    }
    this.cargando = true;
    try {
      this.alumno.fechaReg = this.getFechaHoy();
      this.idGuardado = await this.svc.guardar(this.alumno);
      this.qrData = JSON.stringify({ id: this.idGuardado, cod: this.alumno.cod, nom: this.alumno.nom });
      this.mostrarQr = true;
      this.ok = '¡Alumno registrado correctamente!';
      setTimeout(() => this.dibujarQr(), 200);
    } catch (e: any) {
      this.err = e.message || 'Error al guardar.';
    } finally {
      this.cargando = false;
    }
  }

  private async dibujarQr() {
    if (this.qrCanvas?.nativeElement) {
      await QRCode.toCanvas(this.qrCanvas.nativeElement, this.qrData, { width: 200, margin: 2 });
    }
  }

  async descargarPDF() {
    const canvas = this.qrCanvas?.nativeElement;
    if (!canvas) return;
    const qrImg = canvas.toDataURL('image/png');
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [85.6, 53.98] });

    doc.setFillColor(155, 28, 28);
    doc.rect(0, 0, 85.6, 14, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('USMP — CONTROL DE ACCESOS', 42.8, 9, { align: 'center' });

    doc.setTextColor(30, 30, 30);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(this.alumno.nom.toUpperCase(), 5, 21);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(`Código: ${this.alumno.cod}`, 5, 27);
    doc.text(`Facultad: ${this.alumno.fac}`, 5, 33, { maxWidth: 50 });
    doc.text(`Reg: ${this.alumno.fechaReg}`, 5, 41);

    doc.addImage(qrImg, 'PNG', 57, 16, 24, 24);

    doc.setFillColor(155, 28, 28);
    doc.rect(0, 50, 85.6, 4, 'F');

    doc.save(`credencial_${this.alumno.cod}.pdf`);
  }

  limpiar() {
    this.alumno = { nom: '', cod: '', fac: '', email: '', tel: '', fechaReg: '' };
    this.err = ''; this.ok = ''; this.mostrarQr = false; this.qrData = '';
  }

  async salir() {
    await signOut(this.auth);
    this.router.navigate(['/login']);
  }
}