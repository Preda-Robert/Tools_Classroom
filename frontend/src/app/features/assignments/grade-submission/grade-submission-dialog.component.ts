import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { Submission } from '../../../core/models/submission.model';
import { Assignment } from '../../../core/models/assignment.model';

interface DialogData {
  submission: Submission;
  assignment: Assignment;
}

@Component({
  selector: 'app-grade-submission-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
  ],
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>
        <mat-icon>grade</mat-icon>
        Grade Submission
      </h2>
      <button mat-icon-button mat-dialog-close>
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content>
      <div class="submission-info">
        <div class="student-header">
          <mat-icon class="large-icon">person</mat-icon>
          <div>
            <h3>{{ data.submission.studentName }}</h3>
            <p class="submitted-date">
              <mat-icon>schedule</mat-icon>
              Submitted: {{ data.submission.submittedAt | date : 'MMM d, y h:mm a' }}
              <mat-chip *ngIf="data.submission.isLate" class="late-chip">Late</mat-chip>
            </p>
          </div>
        </div>
      </div>

      <mat-divider></mat-divider>

      <div class="submission-content">
        <h4>Student's Work</h4>
        <div class="content-box">
          <p>{{ data.submission.content }}</p>
        </div>

        <div *ngIf="data.submission.filePath" class="file-attachment">
          <mat-icon>attach_file</mat-icon>
          <span>{{ data.submission.filePath }}</span>
        </div>
      </div>

      <mat-divider></mat-divider>

      <form [formGroup]="gradeForm">
        <div class="grade-section">
          <mat-form-field appearance="outline" class="grade-field">
            <mat-label>Grade</mat-label>
            <input matInput type="number" formControlName="grade" [max]="data.assignment.maxPoints" min="0" />
            <mat-hint>Out of {{ data.assignment.maxPoints }} points</mat-hint>
            <mat-error *ngIf="gradeForm.get('grade')?.hasError('required')">
              Grade is required
            </mat-error>
            <mat-error *ngIf="gradeForm.get('grade')?.hasError('max')">
              Grade cannot exceed {{ data.assignment.maxPoints }}
            </mat-error>
            <mat-error *ngIf="gradeForm.get('grade')?.hasError('min')">
              Grade cannot be negative
            </mat-error>
          </mat-form-field>

          <div class="grade-percentage" *ngIf="gradeForm.get('grade')?.value !== null">
            {{ getPercentage() }}%
          </div>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Feedback (Optional)</mat-label>
          <textarea
            matInput
            formControlName="feedback"
            rows="4"
            placeholder="Provide feedback to the student..."
          ></textarea>
        </mat-form-field>
      </form>

      <div *ngIf="data.submission.grade !== undefined && data.submission.grade !== null" class="current-grade-notice">
        <mat-icon>info</mat-icon>
        <span>Current grade: {{ data.submission.grade }} / {{ data.assignment.maxPoints }}</span>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button
        mat-raised-button
        color="primary"
        (click)="onSave()"
        [disabled]="!gradeForm.valid"
      >
        <mat-icon>check</mat-icon>
        Save Grade
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .dialog-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px 0;
      }

      .dialog-header h2 {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 0;
      }

      mat-dialog-content {
        min-width: 600px;
        padding: 24px;
      }

      .submission-info {
        margin-bottom: 20px;
      }

      .student-header {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .large-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #667eea;
      }

      .student-header h3 {
        margin: 0;
        color: #333;
      }

      .submitted-date {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 4px 0 0 0;
        color: #666;
      }

      .submitted-date mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      .late-chip {
        margin-left: 8px;
        background: #f44336 !important;
        color: white !important;
        font-size: 0.75em;
      }

      mat-divider {
        margin: 20px 0;
      }

      .submission-content h4 {
        color: #667eea;
        margin: 0 0 12px 0;
      }

      .content-box {
        padding: 16px;
        background: #f8f9fa;
        border-radius: 8px;
        border-left: 4px solid #667eea;
        margin-bottom: 16px;
      }

      .content-box p {
        margin: 0;
        white-space: pre-wrap;
        line-height: 1.6;
      }

      .file-attachment {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
        background: #e8f5e9;
        border-radius: 8px;
        color: #2e7d32;
      }

      .file-attachment mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      .grade-section {
        display: flex;
        align-items: flex-start;
        gap: 16px;
        margin-bottom: 20px;
      }

      .grade-field {
        width: 200px;
      }

      .grade-percentage {
        padding: 20px 16px;
        background: #667eea;
        color: white;
        border-radius: 8px;
        font-size: 1.5em;
        font-weight: 500;
        text-align: center;
        min-width: 100px;
      }

      .full-width {
        width: 100%;
      }

      .current-grade-notice {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: #e3f2fd;
        border-radius: 8px;
        color: #1976d2;
        margin-top: 16px;
      }

      mat-dialog-actions {
        padding: 16px 24px;
        border-top: 1px solid #e0e0e0;
      }

      @media (max-width: 700px) {
        mat-dialog-content {
          min-width: auto;
        }

        .grade-section {
          flex-direction: column;
        }

        .grade-field {
          width: 100%;
        }
      }
    `,
  ],
})
export class GradeSubmissionDialogComponent {
  private fb = inject(FormBuilder);
  data: DialogData = inject(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<GradeSubmissionDialogComponent>);

  gradeForm: FormGroup;

  constructor() {
    this.gradeForm = this.fb.group({
      grade: [
        this.data.submission.grade ?? null,
        [
          Validators.required,
          Validators.min(0),
          Validators.max(this.data.assignment.maxPoints),
        ],
      ],
      feedback: [this.data.submission.feedback || ''],
    });
  }

  getPercentage(): number {
    const grade = this.gradeForm.get('grade')?.value;
    if (grade === null || grade === undefined) return 0;
    return Math.round((grade / this.data.assignment.maxPoints) * 100);
  }

  onSave(): void {
    if (this.gradeForm.valid) {
      this.dialogRef.close(this.gradeForm.value);
    }
  }
}