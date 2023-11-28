import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root',
})
export class TimeSlotsService {
  constructor(private firestore: AngularFirestore) {}

  postTimeSlots(doctorId: string | undefined, date: string | undefined, availableSlots: string[]) {
    const doctorRef = this.firestore.collection('doctors').doc(doctorId);
    const timeSlotsRef = doctorRef.collection('timeSlots').doc(date);

    return timeSlotsRef.set({ availableSlots });
  }

  updateTimeSlots(doctorId: string | undefined, date: string | undefined, slots: string[]) {
    const doctorRef = this.firestore.collection('doctors').doc(doctorId);
    const timeSlotsRef = doctorRef.collection('timeSlots').doc(date);

    return timeSlotsRef.update({ availableSlots: slots });
  }

  getTimeSlots(doctorId: string | undefined, date: string | undefined) {
    const doctorRef = this.firestore.collection('doctors').doc(doctorId);
    const timeSlotsRef = doctorRef.collection('timeSlots').doc(date);

    return timeSlotsRef.get();
  }

  deleteTimeSlots(doctorId: string, date: string | undefined) {
    const doctorRef = this.firestore.collection('doctors').doc(doctorId);
    const timeSlotsRef = doctorRef.collection('timeSlots').doc(date);

    return timeSlotsRef.delete();
  }

  cleanupPastTimeSlots(doctorId: string, currentDate: string): void {
    this.firestore
      .collection('doctors')
      .doc(doctorId)
      .collection('timeSlots')
      .get()
      .subscribe(querySnapshot => {
        querySnapshot.forEach(doc => {
          const timeSlotDate = doc.id;

          if (new Date(timeSlotDate) < new Date(currentDate)) {
            this.deleteTimeSlots(doctorId, timeSlotDate);
          }
        });
      });
  }
}
