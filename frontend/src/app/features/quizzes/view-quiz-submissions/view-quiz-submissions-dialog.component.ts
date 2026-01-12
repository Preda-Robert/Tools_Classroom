import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Quiz } from '../../../core/models/quiz.model';
import { QuizService, QuizSubmission } from '../../../core/services/quiz.service';

interface DialogData {
  quiz: Quiz;
  classId: number;
  classStudentCount: number;
}

@Component({
  selector: 'app-view-quiz-submissions-dialog',
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
        <mat-icon>quiz</mat-icon>
        Quiz Results: {{ data.quiz.title }}
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
          <mat-icon>insights</mat-icon>
          <div>
            <h3>{{ averageScore }}%</h3>
            <p>Average Score</p>
          </div>
        </div>
        <div class="stat-card">
          <mat-icon>emoji_events</mat-icon>
          <div>
            <h3>{{ highestScore }}</h3>
            <p>Highest Score</p>
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
        <p>Students haven't taken this quiz.</p>
      </div>

      <table mat-table [dataSource]="submissions" *ngIf="!isLoading && submissions.length > 0" class="submissions-table">
        <!-- Rank Column -->
        <ng-container matColumnDef="rank">
          <th mat-header-cell *matHeaderCellDef>Rank</th>
          <td mat-cell *matCellDef="let submission; let i = index">
            <div class="rank-cell">
              <mat-icon *ngIf="i === 0" class="gold">emoji_events</mat-icon>
              <mat-icon *ngIf="i === 1" class="silver">emoji_events</mat-icon>
              <mat-icon *ngIf="i === 2" class="bronze">emoji_events</mat-icon>
              <span *ngIf="i > 2">#{{ i + 1 }}</span>
              <span *ngIf="i <= 2">#{{ i + 1 }}</span>
            </div>
          </td>
        </ng-container>

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

        <!-- Score Column -->
        <ng-container matColumnDef="score">
          <th mat-header-cell *matHeaderCellDef>Score</th>
          <td mat-cell *matCellDef="let submission">
            <div class="score-cell">
              <span class="score-value">{{ submission.score }} / {{ data.quiz.maxPoints }}</span>
              <mat-chip [class.excellent]="getPercentage(submission.score) >= 90" [class.good]="getPercentage(submission.score) >= 70 && getPercentage(submission.score) < 90" [class.average]="getPercentage(submission.score) >= 50 && getPercentage(submission.score) < 70" [class.poor]="getPercentage(submission.score) < 50">
                {{ getPercentage(submission.score) }}%
              </mat-chip>
            </div>
          </td>
        </ng-container>

        <!-- Time Column -->
        <ng-container matColumnDef="time">
          <th mat-header-cell *matHeaderCellDef>Time Taken</th>
          <td mat-cell *matCellDef="let submission">
            <div class="time-cell">
              <mat-icon>schedule</mat-icon>
              {{ formatTime(submission.timeSpent) }}
            </div>
          </td>
        </ng-container>

        <!-- Submitted Column -->
        <ng-container matColumnDef="submitted">
          <th mat-header-cell *matHeaderCellDef>Submitted</th>
          <td mat-cell *matCellDef="let submission">
            {{ submission.submittedAt | date : 'MMM d, h:mm a' }}
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
        min-width: 900px;
        max-width: 1100px;
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

      .submissions-table {
        width: 100%;
      }

      .rank-cell {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;
      }

      .rank-cell mat-icon.gold {
        color: #ffd700;
      }

      .rank-cell mat-icon.silver {
        color: #c0c0c0;
      }

      .rank-cell mat-icon.bronze {
        color: #cd7f32;
      }

      .student-cell {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .student-cell mat-icon {
        color: #667eea;
      }

      .score-cell {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .score-value {
        font-weight: 500;
      }

      mat-chip.excellent {
        background: #4caf50 !important;
        color: white !important;
      }

      mat-chip.good {
        background: #8bc34a !important;
        color: white !important;
      }

      mat-chip.average {
        background: #ff9800 !important;
        color: white !important;
      }

      mat-chip.poor {
        background: #f44336 !important;
        color: white !important;
      }

      .time-cell {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #666;
      }

      .time-cell mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      mat-dialog-actions {
        padding: 16px 24px;
        border-top: 1px solid #e0e0e0;
      }

      @media (max-width: 1000px) {
        mat-dialog-content {
          min-width: auto;
        }
      }
    `,
  ],
})
export class ViewQuizSubmissionsDialogComponent implements OnInit {
  data: DialogData = inject(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<ViewQuizSubmissionsDialogComponent>);
  private quizService = inject(QuizService);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  submissions: QuizSubmission[] = [];
  isLoading = true;
  displayedColumns = ['rank', 'student', 'score', 'time', 'submitted'];

  get averageScore(): number {
    if (this.submissions.length === 0) return 0;
    const total = this.submissions.reduce((sum, s) => sum + s.score, 0);
    return Math.round((total / this.submissions.length / this.data.quiz.maxPoints) * 100);
  }

  get highestScore(): number {
    if (this.submissions.length === 0) return 0;
    return Math.max(...this.submissions.map(s => s.score));
  }

  ngOnInit(): void {
    this.loadSubmissions();
  }

  loadSubmissions(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.quizService.getQuizSubmissions(this.data.classId, this.data.quiz.id).subscribe({
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

  getPercentage(score: number): number {
    return Math.round((score / this.data.quiz.maxPoints) * 100);
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }
}