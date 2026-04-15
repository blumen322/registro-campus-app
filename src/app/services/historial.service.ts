import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, query, orderBy, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Entrada } from '../models/entrada.model';

@Injectable({ providedIn: 'root' })
export class HistorialService {
  private fs = inject(Firestore);
  private col = collection(this.fs, 'historial_entradas');

  registrar(e: Entrada) {
    return addDoc(this.col, e);
  }

  getHoy(): Observable<Entrada[]> {
    const q = query(this.col, orderBy('hora', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<Entrada[]>;
  }
}