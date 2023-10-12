import {
  DocumentData,
  Firestore,
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { AppointmentIds } from '../interfaces/appointment-ids.interface';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  constructor(private dataBase: Firestore) {}

  addAppointment(appointment: AppointmentIds): Observable<DocumentData> {
    const appointmentCollection = collection(this.dataBase, 'appointments');
    return from(addDoc(appointmentCollection, appointment));
  }

  getAppointments(): Observable<DocumentData[]> {
    const appointmentsCollection = collection(this.dataBase, 'appointments');
    return collectionData(appointmentsCollection, { idField: 'id' });
  }

  queryAppointments(doctorID: string, localDate: string | undefined) {
    const appointmentsRef = collection(this.dataBase, 'appointments');

    const q = query(appointmentsRef, where('doctorId', '==', `${doctorID}`), where('localDate', '==', `${localDate}`));

    return collectionData(q);
  }

  queryAppointmentsByPatient(patientId: string) {
    const appointmentsRef = collection(this.dataBase, 'appointments');

    const q = query(appointmentsRef, where('patient.uid', '==', `${patientId}`));
    return collectionData(q);
  }

  queryAppointmentsByDoctor(doctorId: string) {
    const appointmentsRef = collection(this.dataBase, 'appointments');

    const q = query(appointmentsRef, where('doctorId', '==', `${doctorId}`));
    return collectionData(q);
  }

  async deleteAllAppointments(patientId: string | undefined) {
    if (!patientId) {
      throw new Error('Patient ID is required.');
    }

    const appointmentsRef = collection(this.dataBase, 'appointments');

    const q = query(appointmentsRef, where('patient.uid', '==', patientId));
    const querySnapshot = await getDocs(q);

    const deletePromises: Promise<void>[] = [];
    querySnapshot.forEach(data => {
      const appointmentId = data.id;
      const appointmentDocRef = doc(appointmentsRef, appointmentId);
      const deletePromise = deleteDoc(appointmentDocRef);
      deletePromises.push(deletePromise);
    });

    await Promise.all(deletePromises);
  }
}
