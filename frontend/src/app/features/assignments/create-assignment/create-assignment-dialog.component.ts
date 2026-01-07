import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-create-assignment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  template: `
    <h2 mat-dialog-title>Create New Assignment</h2>
    <mat-dialog-content>
      <form [formGroup]="assignmentForm">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Assignment Title</mat-label>
          <input matInput formControlName="title" placeholder="e.g., Homework #5" />
          <mat-error *ngIf="assignmentForm.get('title')?.hasError('required')">
            Title is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea
            matInput
            formControlName="description"
            rows="4"
            placeholder="Assignment instructions..."
          ></textarea>
          <mat-error *ngIf="assignmentForm.get('description')?.hasError('required')">
            Description is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Due Date</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="dueDate" />
          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
          <mat-error *ngIf="assignmentForm.get('dueDate')?.hasError('required')">
            Due date is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Max Points</mat-label>
          <input matInput type="number" formControlName="maxPoints" />
          <mat-error *ngIf="assignmentForm.get('maxPoints')?.hasError('required')">
            Max points is required
          </mat-error>
          <mat-error *ngIf="assignmentForm.get('maxPoints')?.hasError('min')">
            Must be at least 1 point
          </mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button
        mat-raised-button
        color="primary"
        (click)="onCreate()"
        [disabled]="!assignmentForm.valid"
      >
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
export class CreateAssignmentDialogComponent {
  assignmentForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateAssignmentDialogComponent>
  ) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 7);

    this.assignmentForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      dueDate: [tomorrow, Validators.required],
      maxPoints: [100, [Validators.required, Validators.min(1)]],
    });
  }

  onCreate(): void {
    if (this.assignmentForm.valid) {
      this.dialogRef.close(this.assignmentForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}