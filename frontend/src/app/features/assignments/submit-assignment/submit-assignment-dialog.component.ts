import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Assignment } from '../../../core/models/assignment.model';
import { Submission } from '../../../core/models/submission.model';

interface DialogData {
  assignment: Assignment;
  existingSubmission?: Submission;
}

@Component({
  selector: 'app-submit-assignment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>
        <mat-icon>upload</mat-icon>
        {{ data.existingSubmission ? 'Update' : 'Submit' }} Assignment
      </h2>
      <button mat-icon-button mat-dialog-close>
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content>
      <div class="assignment-info">
        <h3>{{ data.assignment.title }}</h3>
        <p class="due-date">
          <mat-icon>event</mat-icon>
          Due: {{ data.assignment.dueDate | date : 'MMM d, y h:mm a' }}
        </p>
      </div>

      <form [formGroup]="submissionForm">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Your Work</mat-label>
          <textarea
            matInput
            formControlName="content"
            rows="8"
            placeholder="Enter your answer or solution here..."
          ></textarea>
          <mat-hint>Describe your work or paste your text solution</mat-hint>
          <mat-error *ngIf="submissionForm.get('content')?.hasError('required')">
            Content is required
          </mat-error>
        </mat-form-field>

        <div class="file-upload-section">
          <label>Attach File (Optional)</label>
          <div class="file-input-wrapper">
            <input
              type="file"
              #fileInput
              (change)="onFileSelected($event)"
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              hidden
            />
            <button mat-stroked-button type="button" (click)="fileInput.click()">
              <mat-icon>attach_file</mat-icon>
              {{ selectedFileName || 'Choose File' }}
            </button>
            <button
              mat-icon-button
              type="button"
              *ngIf="selectedFileName"
              (click)="clearFile()"
              color="warn"
            >
              <mat-icon>close</mat-icon>
            </button>
          </div>
          <p class="file-hint">Accepted: PDF, DOC, DOCX, TXT, JPG, PNG (Max 10MB)</p>
        </div>

        <div *ngIf="data.existingSubmission" class="existing-submission-notice">
          <mat-icon color="warn">info</mat-icon>
          <span
            >You submitted this assignment on
            {{ data.existingSubmission.submittedAt | date : 'MMM d, y h:mm a' }}. Submitting
            again will replace your previous submission.</span
          >
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close [disabled]="isSubmitting">Cancel</button>
      <button
        mat-raised-button
        color="primary"
        (click)="onSubmit()"
        [disabled]="!submissionForm.valid || isSubmitting"
      >
        <mat-spinner *ngIf="isSubmitting" diameter="20" class="spinner"></mat-spinner>
        <mat-icon *ngIf="!isSubmitting">send</mat-icon>
        {{ isSubmitting ? 'Submitting...' : (data.existingSubmission ? 'Update' : 'Submit') }}
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
        min-width: 550px;
        padding: 24px;
      }

      .assignment-info {
        margin-bottom: 24px;
        padding: 16px;
        background: #f8f9fa;
        border-radius: 8px;
        border-left: 4px solid #667eea;
      }

      .assignment-info h3 {
        margin: 0 0 8px 0;
        color: #333;
      }

      .due-date {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0;
        color: #666;
      }

      .due-date mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      .full-width {
        width: 100%;
        margin-bottom: 20px;
      }

      .file-upload-section {
        margin-bottom: 20px;
      }

      .file-upload-section label {
        display: block;
        font-weight: 500;
        margin-bottom: 8px;
        color: #666;
      }

      .file-input-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .file-hint {
        margin: 8px 0 0 0;
        font-size: 0.85em;
        color: #999;
      }

      .existing-submission-notice {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 12px;
        background: #fff3e0;
        border-radius: 8px;
        color: #e65100;
      }

      .existing-submission-notice mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      .existing-submission-notice span {
        flex: 1;
        line-height: 1.5;
      }

      mat-dialog-actions {
        padding: 16px 24px;
        border-top: 1px solid #e0e0e0;
      }

      .spinner {
        display: inline-block;
        margin-right: 8px;
      }

      @media (max-width: 600px) {
        mat-dialog-content {
          min-width: auto;
        }
      }
    `,
  ],
})
export class SubmitAssignmentDialogComponent {
  private fb = inject(FormBuilder);
  data: DialogData = inject(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<SubmitAssignmentDialogComponent>);

  submissionForm: FormGroup;
  selectedFileName: string | null = null;
  selectedFile: File | null = null;
  isSubmitting = false;

  constructor() {
    this.submissionForm = this.fb.group({
      content: [this.data.existingSubmission?.content || '', Validators.required],
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }

      this.selectedFile = file;
      this.selectedFileName = file.name;
    }
  }

  clearFile(): void {
    this.selectedFile = null;
    this.selectedFileName = null;
  }

  async onSubmit(): Promise<void> {
    if (this.submissionForm.valid) {
      this.isSubmitting = true;

      let fileContent: string | undefined;
      if (this.selectedFile) {
        fileContent = await this.fileToBase64(this.selectedFile);
      }

      const result = {
        content: this.submissionForm.value.content,
        fileName: this.selectedFileName || undefined,
        fileContent: fileContent,
      };

      this.dialogRef.close(result);
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:image/png;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  }
}