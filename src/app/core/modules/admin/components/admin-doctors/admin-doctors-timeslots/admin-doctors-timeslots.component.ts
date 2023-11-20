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

  ngOnInit(): void {
    this.doctorId = this.route.snapshot.params['id'];

    this.timeSlotsService.getTimeSlots(this.doctorId, this.currentLocalDate).subscribe(data => {
      this.doctorTimeSlots = data.data()?.['availableSlots'];
      console.log(this.doctorTimeSlots);
    });
  }

  currentLocalDate = this.formatDate(new Date());

  slotSelected!: string;
  doctorId!: string;
  currentDate = new Date();
  doctorTimeSlots: string[] = [];

  selected: Date | null = new Date();
  dateSelected: Date | null = null;
  localDateSelected: string | undefined;

  myFilter = (d: Date | null): boolean => {
    const day = (d || new Date()).getDay();
    return day !== 0 && day !== 6;
  };

  isActive(slot: string) {
    return this.slotSelected === slot;
  }

  onSelectTimeSlot(slot: string) {
    this.slotSelected = slot;
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('ro-Ro', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  onClickDate() {
    this.dateSelected = this.selected;

    if (this.dateSelected) {
      this.localDateSelected = this.formatDate(this.dateSelected);

      this.timeSlotsService.getTimeSlots(this.doctorId, this.localDateSelected).subscribe(timeSlots => {
        this.doctorTimeSlots = timeSlots.data()?.['availableSlots'];
      });
    }
  }
}
