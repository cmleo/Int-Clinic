import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root',
})
export class TimeSlotsService {
  constructor(private firestore: AngularFirestore) {}

  addTimeSlots(doctorId: string | undefined, date: string | undefined, availableSlots: string[]) {
    const doctorRef = this.firestore.collection('doctors').doc(doctorId);
    const timeSlotsRef = doctorRef.collection('timeSlots').doc(date);

    return timeSlotsRef.set({ availableSlots });
  }

  getTimeSlots(doctorId: string | undefined, date: string | undefined) {
    const doctorRef = this.firestore.collection('doctors').doc(doctorId);
    const timeSlotsRef = doctorRef.collection('timeSlots').doc(date);

    return timeSlotsRef.get();
  }

  updateTimeSlots(doctorId: string, date: string | undefined, availableSlots: string[]) {
    const doctorRef = this.firestore.collection('doctors').doc(doctorId);
    const timeSlotsRef = doctorRef.collection('timeSlots').doc(date);

    return timeSlotsRef.update({ availableSlots });
  }

  deleteTimeSlots(doctorId: string, date: string | undefined) {
    const doctorRef = this.firestore.collection('doctors').doc(doctorId);
    const timeSlotsRef = doctorRef.collection('timeSlots').doc(date);

    return timeSlotsRef.delete();
  }
}
