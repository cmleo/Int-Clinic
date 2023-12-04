import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Appointment } from 'src/app/core/interfaces/appointment.interface';
import { AppointmentService } from 'src/app/core/services/appointment.service';
import { DataStoreService } from 'src/app/core/services/data-store.service';
import { DateAdapter } from '@angular/material/core';
import { Doctor } from 'src/app/core/interfaces/doctor.interface';
import { TimeSlotsService } from 'src/app/core/services/time-slots.service';

@Component({
  selector: 'app-choose-date',
  templateUrl: './choose-date.component.html',
  styleUrls: ['./choose-date.component.scss'],
})
export class ChooseDateComponent implements OnInit {
  currentDate = new Date();
  currentLocaleDate = this.formatDate(this.currentDate);
  dateSelected: Date | null = new Date();
  localeDateSelected: string | undefined = this.dateSelected?.toLocaleDateString('ro-Ro', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  doctor!: Doctor;
  doctorTimeSlots: string[] = [];
  timeSelected!: string;
  @Output() hasSelection = new EventEmitter<boolean>();

  appointment!: Appointment;
  noTimeSlotsAvailableOrWeekend = false;

  ngOnInit(): void {
    this.dateAdapter.setLocale('en-US');
    this.dateAdapter.getFirstDayOfWeek = () => {
      return 1;
    };
  }

  constructor(
    private dataStoreService: DataStoreService,
    private appointmentService: AppointmentService,
    private dateAdapter: DateAdapter<Date>,
    private timeSlotsService: TimeSlotsService
  ) {}

  initializeDateComponent() {
    this.dataStoreService.appointmentDetails.subscribe(data => {
      this.appointment = data;
      this.doctor = data.doctor;
    });
    this.onSelectDate();
  }

  myFilter = (d: Date | null): boolean => {
    const day = (d || new Date()).getDay();
    return day !== 0 && day !== 6;
  };

  isActive(time: string) {
    return this.timeSelected === time;
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('ro-Ro', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  onSelectDate() {
    this.timeSelected = '';

    if (this.localeDateSelected === this.currentLocaleDate) {
      this.timeSlotsService.getTimeSlots(this.doctor.id, this.currentLocaleDate).subscribe(slots => {
        this.handleTimeSlots(slots);
      });
    } else {
      this.timeSlotsService.getTimeSlots(this.doctor.id, this.localeDateSelected).subscribe(slots => {
        return this.handleTimeSlots(slots);
      });
    }
  }

  private handleTimeSlots(timeSlots: any) {
    this.doctorTimeSlots = timeSlots.data()?.['availableSlots'].sort() || [];

    if (this.doctorTimeSlots.length === 0 || !this.myFilter(this.dateSelected)) {
      this.noTimeSlotsAvailableOrWeekend = true;
    } else {
      this.noTimeSlotsAvailableOrWeekend = false;
    }
  }

  onSelectTimeSlot(time: string) {
    this.hasSelection.emit(false);
    this.timeSelected = time;

    const data = { ...this.appointment, timeSlot: this.timeSelected, date: this.dateSelected };
    this.dataStoreService.addData(data);
  }

  addSelectedTimeSlot() {
    const updatedTimeSlots = this.doctorTimeSlots.filter(slot => slot !== this.timeSelected);

    this.timeSlotsService.updateTimeSlots(
      this.doctor.id,
      this.localeDateSelected || this.currentLocaleDate,
      updatedTimeSlots
    );
  }
}
