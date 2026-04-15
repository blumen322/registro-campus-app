import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, query, where } from '@angular/fire/firestore';
import { Alumno } from '../models/alumno.model';

@Injectable({ providedIn: 'root' })
export class AlumnoService {
  private fs = inject(Firestore);
  private col = collection(this.fs, 'alumnos');

  async existeCod(cod: string): Promise<boolean> {
    const q = query(this.col, where('cod', '==', cod));
    const snap = await getDocs(q);
    return !snap.empty;
  }

  async guardar(a: Alumno): Promise<string> {
    const existe = await this.existeCod(a.cod);
    if (existe) throw new Error('El código ya está registrado.');
    const ref = await addDoc(this.col, a);
    return ref.id;
  }
}