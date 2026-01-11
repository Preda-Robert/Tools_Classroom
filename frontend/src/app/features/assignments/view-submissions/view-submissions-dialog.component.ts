import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Assignment } from '../../../core/models/assignment.model';
import { Submission } from '../../../core/models/submission.model';
import { SubmissionService } from '../../../core/services/submission.service';
import { GradeSubmissionDialogComponent } from '../grade-submission/grade-submission-dialog.component';

interface DialogData {
  assignment: Assignment;
  classStudentCount: number;
}

@Component({
  selector: 'app-view-submissions-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>
        <mat-icon>assignment_turned_in</mat-icon>
        Submissions: {{ data.assignment.title }}
      </h2>
      <button mat-icon-button mat-dialog-close>
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content>
      <div class="submissions-stats">
        <div class="stat-card">
          <mat-icon>send</mat-icon>
          <div>
            <h3>{{ submissions.length }}</h3>
            <p>Submitted</p>
          </div>
        </div>
        <div class="stat-card">
          <mat-icon>pending</mat-icon>
          <div>
            <h3>{{ data.classStudentCount - submissions.length }}</h3>
            <p>Not Submitted</p>
          </div>
        </div>
        <div class="stat-card">
          <mat-icon>grade</mat-icon>
          <div>
            <h3>{{ gradedCount }}</h3>
            <p>Graded</p>
          </div>
        </div>
      </div>

      <div *ngIf="isLoading" class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Loading submissions...</p>
      </div>

      <div *ngIf="!isLoading && submissions.length === 0" class="empty-state">
        <mat-icon>inbox</mat-icon>
        <h3>No submissions yet</h3>
        <p>Students haven't submitted their work for this assignment.</p>
      </div>

      <table mat-table [dataSource]="submissions" *ngIf="!isLoading && submissions.length > 0">
        <!-- Student Column -->
        <ng-container matColumnDef="student">
          <th mat-header-cell *matHeaderCellDef>Student</th>
          <td mat-cell *matCellDef="let submission">
            <div class="student-cell">
              <mat-icon>person</mat-icon>
              {{ submission.studentName }}
            </div>
          </td>
        </ng-container>

        <!-- Submitted Column -->
        <ng-container matColumnDef="submitted">
          <th mat-header-cell *matHeaderCellDef>Submitted</th>
          <td mat-cell *matCellDef="let submission">
            <div class="date-cell">
              {{ submission.submittedAt | date : 'MMM d, h:mm a' }}
              <mat-chip *ngIf="submission.isLate" class="late-chip">Late</mat-chip>
            </div>
          </td>
        </ng-container>

        <!-- Grade Column -->
        <ng-container matColumnDef="grade">
          <th mat-header-cell *matHeaderCellDef>Grade</th>
          <td mat-cell *matCellDef="let submission">
            <div class="grade-cell">
              <span *ngIf="submission.grade !== null && submission.grade !== undefined" class="graded">
                {{ submission.grade }} / {{ data.assignment.maxPoints }}
              </span>
              <span *ngIf="submission.grade === null || submission.grade === undefined" class="not-graded">
                Not graded
              </span>
            </div>
          </td>
        </ng-container>

        <!-- Actions Column -->
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let submission">
            <button mat-button color="primary" (click)="gradeSubmission(submission)">
              <mat-icon>grade</mat-icon>
              {{ submission.grade !== null && submission.grade !== undefined ? 'Edit Grade' : 'Grade' }}
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
      </table>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
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
        min-width: 800px;
        max-width: 1000px;
        padding: 24px;
        max-height: 70vh;
      }

      .submissions-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        margin-bottom: 24px;
      }

      .stat-card {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      .stat-card mat-icon {
        font-size: 36px;
        width: 36px;
        height: 36px;
      }

      .stat-card h3 {
        margin: 0;
        font-size: 2em;
        font-weight: 600;
      }

      .stat-card p {
        margin: 0;
        opacity: 0.9;
      }

      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
        gap: 20px;
      }

      .empty-state {
        text-align: center;
        padding: 60px 20px;
        color: #999;
      }

      .empty-state mat-icon {
        font-size: 72px;
        width: 72px;
        height: 72px;
        color: #ddd;
      }

      table {
        width: 100%;
      }

      .student-cell {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .student-cell mat-icon {
        color: #667eea;
      }

      .date-cell {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .late-chip {
        background: #f44336 !important;
        color: white !important;
        font-size: 0.75em;
      }

      .grade-cell .graded {
        color: #4caf50;
        font-weight: 500;
      }

      .grade-cell .not-graded {
        color: #ff9800;
        font-style: italic;
      }

      mat-dialog-actions {
        padding: 16px 24px;
        border-top: 1px solid #e0e0e0;
      }

      @media (max-width: 900px) {
        mat-dialog-content {
          min-width: auto;
        }
      }
    `,
  ],
})
export class ViewSubmissionsDialogComponent implements OnInit {
  data: DialogData = inject(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<ViewSubmissionsDialogComponent>);
  private submissionService = inject(SubmissionService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  submissions: Submission[] = [];
  isLoading = true;
  displayedColumns = ['student', 'submitted', 'grade', 'actions'];

  get gradedCount(): number {
    return this.submissions.filter(s => s.grade !== null && s.grade !== undefined).length;
  }

  ngOnInit(): void {
    this.loadSubmissions();
  }

  loadSubmissions(): void {
    this.isLoading = true;
    this.cdr.markForCheck();
    
    this.submissionService.getAssignmentSubmissions(this.data.assignment.id).subscribe({
      next: (submissions) => {
        this.submissions = submissions;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading submissions:', error);
        this.snackBar.open('Failed to load submissions', 'Close', { duration: 3000 });
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  gradeSubmission(submission: Submission): void {
    const gradeDialog = this.dialog.open(GradeSubmissionDialogComponent, {
      width: '700px',
      data: {
        submission: submission,
        assignment: this.data.assignment,
      },
    });

    gradeDialog.afterClosed().subscribe((result) => {
      if (result) {
        this.submissionService
          .gradeSubmission(this.data.assignment.id, submission.id, result)
          .subscribe({
            next: () => {
              this.snackBar.open('Grade saved successfully!', 'Close', { duration: 3000 });
              this.loadSubmissions();
            },
            error: (error) => {
              console.error('Error grading submission:', error);
              this.snackBar.open('Failed to save grade', 'Close', { duration: 3000 });
            },
          });
      }
    });
  }
}