import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ClassService } from '../../../core/services/class.service';

@Component({
  selector: 'app-create-class-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  template: `
    <h2 mat-dialog-title>Create New Class</h2>
    <mat-dialog-content>
      <form [formGroup]="classForm">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Class Name</mat-label>
          <input matInput formControlName="name" placeholder="e.g., Mathematics 101" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea
            matInput
            formControlName="description"
            rows="3"
            placeholder="Brief description of the class"
          ></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onCreate()" [disabled]="!classForm.valid">
        Create
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .full-width {
        width: 100%;
        margin-bottom: 16px;
      }
    `,
  ],
})
export class CreateClassDialogComponent {
  classForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private classService: ClassService,
    private dialogRef: MatDialogRef<CreateClassDialogComponent>,
    private snackBar: MatSnackBar
  ) {
    this.classForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  onCreate(): void {
    if (this.classForm.valid) {
      this.classService.createClass(this.classForm.value).subscribe({
        next: (result) => {
          this.snackBar.open(`Class created! Join code: ${result.joinCode}`, 'Close', {
            duration: 5000,
          });
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.snackBar.open('Failed to create class', 'Close', { duration: 3000 });
        },
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
