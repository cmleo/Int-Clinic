import {
  DocumentData,
  Firestore,
  addDoc,
  collection,
  collectionData,
  doc,
  query,
  updateDoc,
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

  queryAppointmentsByDate(doctorID: string, localDate: string | undefined) {
    const appointmentsRef = collection(this.dataBase, 'appointments');

    const q = query(appointmentsRef, where('doctorId', '==', `${doctorID}`), where('localDate', '==', `${localDate}`));

    return collectionData(q, { idField: 'id' });
  }

  queryAppointmentsByPatient(patientId: string) {
    const appointmentsRef = collection(this.dataBase, 'appointments');

    const q = query(appointmentsRef, where('patient.uid', '==', `${patientId}`));
    return collectionData(q, { idField: 'id' });
  }

  queryAppointmentsByDoctor(doctorId: string) {
    const appointmentsRef = collection(this.dataBase, 'appointments');

    const q = query(appointmentsRef, where('doctorId', '==', `${doctorId}`));
    return collectionData(q);
  }

  getAppointmentsArchivedByDoctor(doctorId: string, archivedByDoctor: boolean) {
    const appointmentsRef = collection(this.dataBase, 'appointments');

    const q = query(
      appointmentsRef,
      where('doctorId', '==', `${doctorId}`),
      where('archivedByDoctor', '==', archivedByDoctor)
    );
    return collectionData(q, { idField: 'id' });
  }

  getAppointmentsArchivedByPatient(patientId: string, archivedByPatient: boolean) {
    const appointmentsRef = collection(this.dataBase, 'appointments');

    const q = query(
      appointmentsRef,
      where('patient.uid', '==', `${patientId}`),
      where('archivedByPatient', '==', archivedByPatient)
    );
    return collectionData(q, { idField: 'id' });
  }

  archiveDoctorAppointment(id: string) {
    const docInstance = doc(this.dataBase, 'appointments', id);

    return updateDoc(docInstance, { archivedByDoctor: true });
  }

  archivePatientAppointment(id: string) {
    const docInstance = doc(this.dataBase, 'appointments', id);

    return updateDoc(docInstance, { archivedByPatient: true });
  }
}
