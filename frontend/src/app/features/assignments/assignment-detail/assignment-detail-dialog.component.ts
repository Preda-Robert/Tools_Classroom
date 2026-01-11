import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Assignment } from '../../../core/models/assignment.model';
import { Submission } from '../../../core/models/submission.model';
import { SubmissionService } from '../../../core/services/submission.service';
import { SubmitAssignmentDialogComponent } from '../submit-assignment/submit-assignment-dialog.component';
import { ViewSubmissionsDialogComponent } from '../view-submissions/view-submissions-dialog.component';

interface DialogData {
  assignment: Assignment;
  isTeacher: boolean;
  classStudentCount: number;
}

@Component({
  selector: 'app-assignment-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>{{ data.assignment.title }}</h2>
      <button mat-icon-button mat-dialog-close>
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content>
      <div class="assignment-meta">
        <mat-chip-set>
          <mat-chip>
            <mat-icon>event</mat-icon>
            Due: {{ data.assignment.dueDate | date : 'MMM d, y h:mm a' }}
          </mat-chip>
          <mat-chip>
            <mat-icon>star</mat-icon>
            {{ data.assignment.maxPoints }} points
          </mat-chip>
          <mat-chip>
            <mat-icon>calendar_today</mat-icon>
            Posted: {{ data.assignment.createdAt | date : 'MMM d, y' }}
          </mat-chip>
        </mat-chip-set>
      </div>

      <mat-divider></mat-divider>

      <div class="assignment-content">
        <h3>Description</h3>
        <p class="description">{{ data.assignment.description }}</p>
      </div>

      <mat-divider></mat-divider>

      <!-- Student View -->
      <div *ngIf="!data.isTeacher" class="submission-section">
        <h3>Your Submission</h3>
        
        <div *ngIf="isLoadingSubmission" class="loading-box">
          <mat-spinner diameter="30"></mat-spinner>
          <span>Loading submission...</span>
        </div>

        <mat-card class="info-card" *ngIf="!isLoadingSubmission && !mySubmission">
          <mat-card-content>
            <div class="status-info">
              <mat-icon class="warning-icon">info</mat-icon>
              <div>
                <p><strong>Status:</strong> Not Submitted</p>
                <p class="hint">Click "Submit Work" below to submit your assignment.</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="submission-card" *ngIf="!isLoadingSubmission && mySubmission">
          <mat-card-content>
            <div class="submission-header">
              <mat-icon class="success-icon">check_circle</mat-icon>
              <div>
                <p><strong>Status:</strong> Submitted</p>
                <p class="submission-date">
                  {{ mySubmission.submittedAt | date : 'MMM d, y h:mm a' }}
                  <mat-chip *ngIf="mySubmission.isLate" class="late-chip">Late</mat-chip>
                </p>
              </div>
            </div>

            <mat-divider></mat-divider>

            <div class="submission-content">
              <p><strong>Your Work:</strong></p>
              <p class="work-content">{{ mySubmission.content }}</p>
              <div *ngIf="mySubmission.filePath" class="file-info">
                <mat-icon>attach_file</mat-icon>
                <span>{{ mySubmission.filePath }}</span>
              </div>
            </div>

            <mat-divider *ngIf="mySubmission.grade !== null && mySubmission.grade !== undefined"></mat-divider>

            <div class="grade-section" *ngIf="mySubmission.grade !== null && mySubmission.grade !== undefined">
              <div class="grade-display">
                <mat-icon class="grade-icon">grade</mat-icon>
                <div>
                  <p class="grade-text">{{ mySubmission.grade }} / {{ data.assignment.maxPoints }}</p>
                  <p class="grade-percentage">{{ getGradePercentage() }}%</p>
                </div>
              </div>
              <div *ngIf="mySubmission.feedback" class="feedback-box">
                <p><strong>Teacher's Feedback:</strong></p>
                <p>{{ mySubmission.feedback }}</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Teacher View -->
      <div *ngIf="data.isTeacher" class="submissions-section">
        <h3>Student Submissions</h3>
        
        <div *ngIf="isLoadingSubmission" class="loading-box">
          <mat-spinner diameter="30"></mat-spinner>
          <span>Loading submissions...</span>
        </div>
        
        <mat-card class="info-card" *ngIf="!isLoadingSubmission">
          <mat-card-content>
            <div class="status-info">
              <mat-icon class="info-icon">assignment</mat-icon>
              <div>
                <p><strong>Submissions:</strong> {{ submissionsCount }} / {{ data.classStudentCount }}</p>
                <p class="hint">Click "View Submissions" to see all student work and grade them.</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-divider></mat-divider>

      <div class="time-info">
        <div class="time-item">
          <mat-icon>schedule</mat-icon>
          <div>
            <strong>Time Remaining</strong>
            <p>{{ getTimeRemaining() }}</p>
          </div>
        </div>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
      <button
        mat-raised-button
        color="primary"
        *ngIf="!data.isTeacher"
        (click)="submitWork()"
      >
        <mat-icon>upload</mat-icon>
        {{ mySubmission ? 'Update Submission' : 'Submit Work' }}
      </button>
      <button
        mat-raised-button
        color="primary"
        *ngIf="data.isTeacher"
        (click)="viewSubmissions()"
      >
        <mat-icon>grade</mat-icon>
        View Submissions
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
        margin: 0;
        flex: 1;
      }

      mat-dialog-content {
        padding: 24px;
        min-width: 500px;
        max-width: 700px;
      }

      .assignment-meta {
        margin-bottom: 20px;
      }

      mat-chip {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      mat-chip mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      mat-divider {
        margin: 20px 0;
      }

      .assignment-content {
        margin-bottom: 20px;
      }

      .assignment-content h3 {
        color: #667eea;
        margin-bottom: 12px;
        font-size: 1.2em;
      }

      .description {
        white-space: pre-wrap;
        line-height: 1.6;
        color: #333;
        background: #f8f9fa;
        padding: 16px;
        border-radius: 8px;
        border-left: 4px solid #667eea;
      }

      .submission-section h3,
      .submissions-section h3 {
        color: #667eea;
        margin-bottom: 12px;
        font-size: 1.2em;
      }

      .info-card {
        background: #f8f9fa;
        box-shadow: none;
        border: 1px solid #e0e0e0;
      }

      .status-info {
        display: flex;
        align-items: flex-start;
        gap: 16px;
      }

      .status-info mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
      }

      .warning-icon {
        color: #ff9800;
      }

      .info-icon {
        color: #667eea;
      }

      .status-info div {
        flex: 1;
      }

      .status-info p {
        margin: 4px 0;
      }

      .hint {
        color: #666;
        font-size: 0.9em;
        font-style: italic;
      }

      .time-info {
        margin-top: 20px;
      }

      .time-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: #f8f9fa;
        border-radius: 8px;
      }

      .time-item mat-icon {
        color: #667eea;
        font-size: 28px;
        width: 28px;
        height: 28px;
      }

      .time-item strong {
        display: block;
        color: #667eea;
        margin-bottom: 4px;
      }

      .time-item p {
        margin: 0;
        color: #333;
      }

      .loading-box {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 20px;
        justify-content: center;
      }

      .submission-card {
        background: #f8f9fa;
        border: 1px solid #e0e0e0;
      }

      .submission-header {
        display: flex;
        align-items: flex-start;
        gap: 16px;
        margin-bottom: 16px;
      }

      .success-icon {
        color: #4caf50;
        font-size: 32px;
        width: 32px;
        height: 32px;
      }

      .submission-date {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 4px;
        color: #666;
      }

      .late-chip {
        background: #f44336 !important;
        color: white !important;
        font-size: 0.75em;
      }

      .submission-content {
        margin: 16px 0;
      }

      .work-content {
        white-space: pre-wrap;
        background: white;
        padding: 12px;
        border-radius: 4px;
        border-left: 3px solid #667eea;
        margin: 8px 0;
      }

      .file-info {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background: #e3f2fd;
        border-radius: 4px;
        color: #1976d2;
        margin-top: 8px;
      }

      .file-info mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      .grade-section {
        margin-top: 16px;
      }

      .grade-display {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 8px;
        margin-bottom: 16px;
      }

      .grade-icon {
        font-size: 36px;
        width: 36px;
        height: 36px;
      }

      .grade-text {
        font-size: 1.5em;
        font-weight: 600;
        margin: 0;
      }

      .grade-percentage {
        margin: 4px 0 0 0;
        font-size: 1.1em;
        opacity: 0.9;
      }

      .feedback-box {
        padding: 12px;
        background: #fff3e0;
        border-radius: 4px;
        border-left: 3px solid #ff9800;
      }

      .feedback-box p {
        margin: 0 0 8px 0;
      }

      .feedback-box p:last-child {
        margin: 0;
        white-space: pre-wrap;
      }

      mat-dialog-actions {
        padding: 16px 24px;
        border-top: 1px solid #e0e0e0;
      }

      mat-dialog-actions button {
        margin-left: 8px;
      }

      @media (max-width: 600px) {
        mat-dialog-content {
          min-width: auto;
          max-width: 100%;
        }
      }
    `,
  ],
})
export class AssignmentDetailDialogComponent implements OnInit {
  data: DialogData = inject(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<AssignmentDetailDialogComponent>);
  private submissionService = inject(SubmissionService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  mySubmission: Submission | null = null;
  submissionsCount = 0;
  isLoadingSubmission = false;

  ngOnInit(): void {
    if (!this.data.isTeacher) {
      this.loadMySubmission();
    } else {
      this.loadSubmissionsCount();
    }
  }

  loadMySubmission(): void {
    this.isLoadingSubmission = true;
    this.submissionService.getMySubmission(this.data.assignment.id).subscribe({
      next: (submission) => {
        this.mySubmission = submission;
        this.isLoadingSubmission = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        // 404 is expected if no submission exists
        this.mySubmission = null;
        this.isLoadingSubmission = false;
        if (error.status !== 404) {
          console.error('Error loading submission:', error);
          this.snackBar.open('Failed to load submission', 'Close', { duration: 3000 });
        }
        this.cdr.markForCheck();
      },
    });
  }

  loadSubmissionsCount(): void {
    this.isLoadingSubmission = true;
    this.submissionService.getAssignmentSubmissions(this.data.assignment.id).subscribe({
      next: (submissions) => {
        this.submissionsCount = submissions.length;
        this.isLoadingSubmission = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading submissions count:', error);
        this.snackBar.open('Failed to load submissions', 'Close', { duration: 3000 });
        this.isLoadingSubmission = false;
        this.cdr.markForCheck();
      },
    });
  }

  submitWork(): void {
    const submitDialog = this.dialog.open(SubmitAssignmentDialogComponent, {
      width: '600px',
      data: {
        assignment: this.data.assignment,
        existingSubmission: this.mySubmission,
      },
    });

    submitDialog.afterClosed().subscribe((result) => {
      if (result) {
        this.submissionService.submitAssignment(this.data.assignment.id, result).subscribe({
          next: () => {
            this.snackBar.open('Assignment submitted successfully!', 'Close', { duration: 3000 });
            this.loadMySubmission();
          },
          error: (error) => {
            console.error('Error submitting assignment:', error);
            this.snackBar.open('Failed to submit assignment', 'Close', { duration: 3000 });
          },
        });
      }
    });
  }

  viewSubmissions(): void {
    const viewDialog = this.dialog.open(ViewSubmissionsDialogComponent, {
      width: '900px',
      maxWidth: '95vw',
      data: {
        assignment: this.data.assignment,
        classStudentCount: this.data.classStudentCount,
      },
    });

    viewDialog.afterClosed().subscribe(() => {
      // Reload count in case grades were updated
      this.loadSubmissionsCount();
    });
  }

  getGradePercentage(): number {
    if (!this.mySubmission || this.mySubmission.grade === null || this.mySubmission.grade === undefined) {
      return 0;
    }
    return Math.round((this.mySubmission.grade / this.data.assignment.maxPoints) * 100);
  }

  getTimeRemaining(): string {
    const now = new Date();
    const dueDate = new Date(this.data.assignment.dueDate);
    const diff = dueDate.getTime() - now.getTime();

    if (diff < 0) {
      return 'Past due';
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days} day${days !== 1 ? 's' : ''}, ${hours} hour${hours !== 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}, ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
  }
}