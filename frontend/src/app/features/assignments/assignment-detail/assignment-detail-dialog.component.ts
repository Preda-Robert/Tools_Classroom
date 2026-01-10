// frontend/src/app/features/assignments/assignment-detail/assignment-detail-dialog.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { Assignment } from '../../../core/models/assignment.model';

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
        <mat-card class="info-card">
          <mat-card-content>
            <div class="status-info">
              <mat-icon class="warning-icon">info</mat-icon>
              <div>
                <p><strong>Status:</strong> Not Submitted</p>
                <p class="hint">Submission functionality coming soon!</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Teacher View -->
      <div *ngIf="data.isTeacher" class="submissions-section">
        <h3>Student Submissions</h3>
        <mat-card class="info-card">
          <mat-card-content>
            <div class="status-info">
              <mat-icon class="info-icon">assignment</mat-icon>
              <div>
                <p><strong>Submissions:</strong> 0 / {{ data.classStudentCount }}</p>
                <p class="hint">Grading functionality coming soon!</p>
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
      <button mat-raised-button color="primary" *ngIf="!data.isTeacher" disabled>
        <mat-icon>upload</mat-icon>
        Submit Work (Coming Soon)
      </button>
      <button mat-raised-button color="primary" *ngIf="data.isTeacher" disabled>
        <mat-icon>grade</mat-icon>
        View Submissions (Coming Soon)
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
export class AssignmentDetailDialogComponent {
  data: DialogData = inject(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<AssignmentDetailDialogComponent>);

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