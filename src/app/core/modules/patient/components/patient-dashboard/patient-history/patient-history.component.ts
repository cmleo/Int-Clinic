import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AppointmentService } from 'src/app/core/services/appointment.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { ClinicService } from 'src/app/core/services/clinic.service';
import { ConfirmationDialogService } from 'src/app/core/services/confirmation-dialog.service';
import { DoctorService } from 'src/app/core/services/doctor.service';
import { ServicesService } from 'src/app/core/services/services.service';
import { SpecialtiesService } from 'src/app/core/services/specialties.service';

@Component({
  selector: 'app-patient-history',
  templateUrl: './patient-history.component.html',
  styleUrls: ['./patient-history.component.scss'],
})
export class PatientHistoryComponent {
  patientAppointments!: any;
  appointmentsText: any = [];
  todayDate: Date = new Date();
  patientId!: string | undefined;

  constructor(
    private appointmentQuery: AppointmentService,
    private authService: AuthService,
    private clinicService: ClinicService,
    private specialtyService: SpecialtiesService,
    private serviceService: ServicesService,
    private doctorService: DoctorService,
    private dialogService: ConfirmationDialogService,
    private appointmentsService: AppointmentService,
    private router: Router
  ) {
    this.authService.user$.subscribe(userData => {
      this.patientId = userData?.uid;
      if (userData !== null && userData.uid !== undefined) {
        this.appointmentQuery.queryAppointmentsByPatient(userData.uid).subscribe(appointmentData => {
          this.patientAppointments = appointmentData as [];
          this.patientAppointments.sort((a: any, b: any) => {
            const timeA = a.timeSlot.split(':')[0];
            const timeB = b.timeSlot.split(':')[0];
            return b.date - a.date || timeA - timeB;
          });
          this.todayDate.setHours(0, 0, 0, 0);
          this.patientAppointments.forEach(
            (appointment: {
              id: string;
              date: any;
              localDate: string;
              clinicId: string;
              specialtyId: string;
              serviceId: string;
              doctorId: string;
              timeSlot: string;
              extraDetails: object;
            }) => {
              const appointmentDate = appointment.date.toDate();
              if (appointmentDate < this.todayDate) {
                const data = {
                  id: '',
                  clinic: {},
                  date: new Date(),
                  localDate: '',
                  doctor: {},
                  service: {},
                  specialty: {},
                  timeSlot: '',
                  extraDetails: {},
                };
                data.id = appointment.id;
                this.clinicService.getClinic(appointment.clinicId).subscribe(res => (data.clinic = res['data']()));
                this.specialtyService
                  .getSpecialty(appointment.specialtyId)
                  .subscribe(res => (data.specialty = res['data']()));
                this.serviceService.getService(appointment.serviceId).subscribe(res => (data.service = res['data']()));
                this.doctorService.getDoctor(appointment.doctorId).subscribe(res => (data.doctor = res['data']()));
                data.date = appointment.date.toDate().toString().split(' ').slice(0, 4).join(' ') as Date;
                data.timeSlot = appointment.timeSlot;
                data.extraDetails = appointment.extraDetails;
                data.localDate = appointment.localDate;

                this.appointmentsText.push(data);
              }
            }
          );
        });
      }
    });
  }

  confirmDeleteHistoryDialog() {
    const options = {
      title: 'Ștergere Istoric',
      message: `Ești sigur că vrei să ștergi istoricul programărilor ?`,
      cancelText: 'Nu',
      confirmText: 'Da',
    };

    this.dialogService.open(options);

    this.dialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        this.appointmentsService.deleteAllAppointments(this.patientId);
        location.reload();
      }
    });
  }

  confirmDeleteAppointmentDialog(appointmentId: string) {
    if (!appointmentId) {
      console.log('Appointment id not found');
      return;
    }

    const options = {
      title: 'Ștergere Programare',
      message: `Ești sigur că vrei să ștergi această programare ?`,
      cancelText: 'Nu',
      confirmText: 'Da',
    };

    this.dialogService.open(options);

    this.dialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        this.appointmentsService.deleteAppointment(appointmentId);
        location.reload();
      }
    });
  }
}
