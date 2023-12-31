import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Patient } from 'src/app/core/interfaces/patient.interface';
import { AuthService } from 'src/app/core/services/auth.service';
import { ConfirmationDialogService } from 'src/app/core/services/confirmation-dialog.service';
import { ImageUploadService } from 'src/app/core/services/image-upload.service';
import { PatientService } from 'src/app/core/services/patient.service';

@Component({
  selector: 'app-patient-details-form',
  templateUrl: './patient-details-form.component.html',
  styleUrls: ['./patient-details-form.component.scss'],
})
export class PatientDetailsFormComponent implements OnInit {
  userId!: string;
  defaultFormValues!: object;
  imageUrl = '';
  patientData!: Patient;

  constructor(
    private authService: AuthService,
    private router: Router,
    private dialogService: ConfirmationDialogService,
    private imageUploadService: ImageUploadService,
    private patientService: PatientService
  ) {}

  patientForm = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    phone: new FormControl(' ', [
      Validators.required,
      Validators.pattern('^((\\+91-?)|0)?[0-9]{3}( ?)[0-9]{3}( ?)[0-9]{4}$'),
    ]),
    imageUrl: new FormControl(''),
  });

  ngOnInit() {
    this.autocompleteForm();
  }

  onSubmit() {
    const patient = this.patientForm.getRawValue();
    const name = `${patient.lastName} ${patient.firstName}`;
    let id = '';
    if (this.patientData.uid != undefined) {
      id = this.patientData.uid;
    }

    this.patientData.displayName = name;
    this.patientData.phone = patient.phone as string;
    this.patientData.imageUrl = this.imageUrl;

    this.patientService.updatePatient(id, this.patientData);
    this.router.navigate(['/patient/dashboard/details']);
  }

  autocompleteForm() {
    this.authService.user$.subscribe(data => {
      if (data === null) {
        return;
      }
      this.patientData = data as Patient;
      if (this.patientData.imageUrl) {
        this.imageUrl = this.patientData?.imageUrl;
      }

      this.patientForm.patchValue({
        firstName: this.patientData?.displayName?.split(' ')[1],
        lastName: this.patientData?.displayName?.split(' ')[0],
        phone: this.patientData?.phone,
        imageUrl: '',
      });
    });
  }

  confirmCancelDialog() {
    const options = {
      title: 'Inchidere Formular',
      message: `Ești sigur că vrei să închizi formularul?`,
      cancelText: 'Nu',
      confirmText: 'Da',
    };

    this.dialogService.open(options);

    this.dialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        this.router.navigate(['/patient/dashboard/details']);
        this.patientForm.reset();
      }
    });
  }

  confirmResetDialog() {
    const options = {
      title: 'Resetare Formular',
      message: `Ești sigur că vrei să resetezi formularul?`,
      cancelText: 'Nu',
      confirmText: 'Da',
    };

    this.dialogService.open(options);

    this.dialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        this.autocompleteForm();
        this.patientForm.reset();
      }
    });
  }

  uploadImage(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
      return;
    }

    this.imageUploadService.uploadImage(file, 'patients').subscribe(downloadURL => {
      this.imageUrl = downloadURL;
    });
  }
}
