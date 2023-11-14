import { Component } from '@angular/core';
import { AppointmentService } from 'src/app/core/services/appointment.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { ClinicService } from 'src/app/core/services/clinic.service';
import { ConfirmationDialogService } from 'src/app/core/services/confirmation-dialog.service';
import { ServicesService } from 'src/app/core/services/services.service';
import { SpecialtiesService } from 'src/app/core/services/specialties.service';

@Component({
  selector: 'app-doctor-history',
  templateUrl: './doctor-history.component.html',
  styleUrls: ['./doctor-history.component.scss'],
})
export class DoctorHistoryComponent {
  doctorAppointments!: any;
  appointmentsText: any = [];
  todayDate: Date = new Date();

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private clinicService: ClinicService,
    private specialtyService: SpecialtiesService,
    private serviceService: ServicesService,
    private dialogService: ConfirmationDialogService,
    private appointmentsService: AppointmentService
  ) {
    this.authService.user$.subscribe(userData => {
      if (userData !== null && userData.uid !== undefined) {
        this.appointmentService.getAppointmentsArchivedByDoctor(userData.uid, false).subscribe(appointmentData => {
          this.doctorAppointments = appointmentData as [];
          this.appointmentsText = [];
          this.doctorAppointments.sort((a: any, b: any) => {
            const timeA = a.timeSlot.split(':')[0];
            const timeB = b.timeSlot.split(':')[0];
            return b.date - a.date || timeA - timeB;
          });
          this.todayDate.setHours(0, 0, 0, 0);
          this.doctorAppointments.forEach(
            (appointment: {
              id: string;
              date: any;
              localDate: string;
              clinicId: string;
              specialtyId: string;
              patient: object;
              serviceId: string;
              timeSlot: string;
              extraDetails: object;
              archivedByDoctor: boolean;
              status: string;
            }) => {
              const appointmentDate = appointment.date.toDate();
              if (appointmentDate < this.todayDate) {
                const data = {
                  id: '',
                  clinic: {},
                  date: new Date(),
                  localDate: '',
                  service: {},
                  specialty: {},
                  patient: appointment.patient,
                  timeSlot: '',
                  extraDetails: {},
                  archivedByDoctor: false,
                  status: '',
                };

                this.clinicService.getClinic(appointment.clinicId).subscribe(res => (data.clinic = res['data']()));
                this.specialtyService
                  .getSpecialty(appointment.specialtyId)
                  .subscribe(res => (data.specialty = res['data']()));
                this.serviceService.getService(appointment.serviceId).subscribe(res => (data.service = res['data']()));

                data.id = appointment.id;
                data.date = appointment.date.toDate().toString().split(' ').slice(0, 4).join(' ') as Date;
                data.timeSlot = appointment.timeSlot;
                data.extraDetails = appointment.extraDetails;
                data.localDate = appointment.localDate;
                data.archivedByDoctor = appointment.archivedByDoctor;
                data.status = appointment.status;

                this.appointmentsText.push(data);
              }
            }
          );
        });
      }
    });
  }

  confirmArchiveHistory() {
    const options = {
      title: 'Arhivare Istoric',
      message: `Ești sigur că vrei să arhivezi istoricul programărilor ?`,
      cancelText: 'Nu',
      confirmText: 'Da',
    };

    this.dialogService.open(options);

    this.dialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        Promise.allSettled(
          this.appointmentsText.map((appointment: any) =>
            this.appointmentsService.archiveDoctorAppointment(appointment.id)
          )
        ).then(() => {
          this.appointmentsText = this.appointmentsText.filter(
            (appointment: { archivedByDoctor: boolean }) => appointment.archivedByDoctor == false
          );
        });
      }
    });
  }
}
