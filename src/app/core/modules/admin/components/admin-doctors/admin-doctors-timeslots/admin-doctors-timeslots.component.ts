import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TimeSlotsService } from 'src/app/core/services/time-slots.service';

@Component({
  selector: 'app-admin-doctors-timeslots',
  templateUrl: './admin-doctors-timeslots.component.html',
  styleUrls: ['./admin-doctors-timeslots.component.scss'],
})
export class AdminDoctorsTimeslotsComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private timeSlotsService: TimeSlotsService
  ) {}

  currentLocalDate = this.formatDate(new Date());

  currentDate = new Date();
  doctorId!: string;
  doctorSlotsSelected: string[] = [];
  addableSlotsSelected: string[] = [];
  doctorTimeSlots: string[] = [];
  defaultTimeSlots: string[] = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
  addableTimeSlots: string[] = [];
  updatedTimeSlots: string[] = [];

  selected: Date | null = new Date();
  dateSelected: Date | null = null;
  localDateSelected: string | undefined;

  myFilter = (d: Date | null): boolean => {
    const day = (d || new Date()).getDay();
    return day !== 0 && day !== 6;
  };

  private formatDate(date: Date): string {
    return date.toLocaleDateString('ro-Ro', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  ngOnInit(): void {
    this.doctorId = this.route.snapshot.params['id'];

    this.timeSlotsService.getTimeSlots(this.doctorId, this.currentLocalDate).subscribe(data => {
      this.doctorTimeSlots = data.data()?.['availableSlots'].sort() || [];

      if (!this.doctorTimeSlots) {
        return;
      }

      this.addableTimeSlots = this.defaultTimeSlots.filter(slot => !this.doctorTimeSlots.includes(slot)).sort();
    });

    this.addableTimeSlots = [];
    this.doctorSlotsSelected = [];
    this.addableSlotsSelected = [];
  }

  onClickDate() {
    this.dateSelected = this.selected;

    if (this.dateSelected) {
      this.localDateSelected = this.formatDate(this.dateSelected);

      this.timeSlotsService.getTimeSlots(this.doctorId, this.localDateSelected).subscribe(timeSlots => {
        this.doctorTimeSlots = timeSlots.data()?.['availableSlots'].sort() || [];

        if (!this.doctorTimeSlots) {
          return;
        }

        this.addableTimeSlots = this.defaultTimeSlots.filter(slot => !this.doctorTimeSlots.includes(slot)).sort();
      });
      this.addableTimeSlots = [];
      this.doctorSlotsSelected = [];
      this.addableSlotsSelected = [];
    }
  }

  onSelectAddableTimeSlot(slot: string) {
    const index = this.addableSlotsSelected.indexOf(slot);
    if (index !== -1) {
      this.addableSlotsSelected.splice(index, 1);
    } else {
      this.addableSlotsSelected.push(slot);
    }
  }

  onSelectDoctorTimeSlot(slot: string) {
    const index = this.doctorSlotsSelected.indexOf(slot);
    if (index !== -1) {
      this.doctorSlotsSelected.splice(index, 1);
    } else {
      this.doctorSlotsSelected.push(slot);
    }
  }

  isActive(slot: string) {
    return this.doctorSlotsSelected.includes(slot);
  }

  isSelected(slot: string) {
    return this.addableSlotsSelected.includes(slot);
  }

  onAddTimeSlots() {
    if (this.addableSlotsSelected.length > 0) {
      this.updatedTimeSlots = [...this.doctorTimeSlots, ...this.addableSlotsSelected].sort();

      if (this.doctorTimeSlots.length > 0) {
        this.timeSlotsService.updateTimeSlots(
          this.doctorId,
          this.localDateSelected || this.currentLocalDate,
          this.updatedTimeSlots
        );
      } else {
        this.timeSlotsService.postTimeSlots(
          this.doctorId,
          this.localDateSelected || this.currentLocalDate,
          this.addableSlotsSelected.sort()
        );
      }

      this.doctorTimeSlots = this.updatedTimeSlots.sort();
      this.addableTimeSlots = this.defaultTimeSlots.filter(slot => !this.updatedTimeSlots.includes(slot)).sort();

      this.addableSlotsSelected = [];
      this.doctorSlotsSelected = [];
    }
  }

  onDeleteTimeSlots() {
    if (this.doctorSlotsSelected.length > 0) {
      this.updatedTimeSlots = this.doctorTimeSlots.filter(slot => !this.doctorSlotsSelected.includes(slot));

      this.timeSlotsService.updateTimeSlots(
        this.doctorId,
        this.localDateSelected || this.currentLocalDate,
        this.updatedTimeSlots
      );

      this.doctorTimeSlots = this.updatedTimeSlots.sort();
      this.addableTimeSlots = this.defaultTimeSlots.filter(slot => !this.updatedTimeSlots.includes(slot)).sort();
    }

    if (this.doctorTimeSlots.length === 0) {
      this.timeSlotsService.deleteTimeSlots(this.doctorId, this.localDateSelected || this.currentLocalDate);
    }
  }
}
