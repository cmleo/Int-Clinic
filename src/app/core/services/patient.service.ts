import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { DocumentData } from '@angular/fire/compat/firestore';
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  constructor(private firestore: Firestore) {}

  getPatient(id: string): Observable<DocumentData> {
    const selectedClinic = doc(this.firestore, 'patients', id);
    return from(getDoc(selectedClinic));
  }

  updatePatient(id: string | undefined, patientData: object) {
    if (id) {
      const patientInstance = doc(this.firestore, 'patients', id);

      updateDoc(patientInstance, patientData).catch(err => {
        console.error(err);
      });
    }
  }
}
