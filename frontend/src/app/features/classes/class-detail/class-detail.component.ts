import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { ClassService } from '../../../core/services/class.service';
import { AuthService } from '../../../core/services/auth.service';
import { AssignmentService } from '../../../core/services/assignment.service';
import { Class } from '../../../core/models/class.model';
import { Assignment } from '../../../core/models/assignment.model';
import { CreateAssignmentDialogComponent } from '../../assignments/create-assignment/create-assignment-dialog.component';

@Component({
  selector: 'app-delete-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Delete {{ type }}?</h2>
    <mat-dialog-content>
      <p>Are you sure you want to delete this {{ type }}? This action cannot be undone.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="warn" [mat-dialog-close]="true">Delete</button>
    </mat-dialog-actions>
  `,
})
export class DeleteConfirmDialogComponent {
  type = 'item';
}

@Component({
  selector: 'app-class-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatChipsModule,
    MatSnackBarModule,
    MatMenuModule,
    MatDialogModule,
    MatTableModule,
  ],
  template: `
    <mat-toolbar color="primary">
      <button mat-icon-button (click)="goBack()">
        <mat-icon>arrow_back</mat-icon>
      </button>
      <span>{{ classInfo?.name || 'Loading...' }}</span>
      <span class="spacer"></span>

      <button mat-icon-button [matMenuTriggerFor]="menu" *ngIf="isTeacher">
        <mat-icon>more_vert</mat-icon>
      </button>
      <mat-menu #menu="matMenu">
        <button mat-menu-item (click)="shareClass()">
          <mat-icon>share</mat-icon>
          <span>Share Join Code</span>
        </button>
        <button mat-menu-item (click)="deleteClass()" class="delete-item">
          <mat-icon>delete</mat-icon>
          <span>Delete Class</span>
        </button>
      </mat-menu>
    </mat-toolbar>

    <div class="loading-container" *ngIf="!classInfo">
      <mat-icon class="loading-icon">hourglass_empty</mat-icon>
      <h2>Loading class information...</h2>
    </div>

    <div class="class-detail-container" *ngIf="classInfo">
      <!-- Class Header -->
      <mat-card class="header-card">
        <mat-card-header>
          <mat-card-title>
            <h1>{{ classInfo.name }}</h1>
          </mat-card-title>
          <mat-card-subtitle>{{ classInfo.description }}</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="class-meta">
            <mat-chip-set>
              <mat-chip>
                <mat-icon>person</mat-icon>
                {{ classInfo.teacherName }}
              </mat-chip>
              <mat-chip>
                <mat-icon>people</mat-icon>
                {{ classInfo.studentCount }} Students
              </mat-chip>
              <mat-chip *ngIf="isTeacher" (click)="copyJoinCode()" class="clickable">
                <mat-icon>lock</mat-icon>
                {{ classInfo.joinCode }}
              </mat-chip>
            </mat-chip-set>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Quick Stats -->
      <div class="stats-grid">
        <mat-card>
          <mat-card-content>
            <mat-icon class="stat-icon">assignment</mat-icon>
            <h2>{{ assignments.length }}</h2>
            <p>Assignments</p>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-content>
            <mat-icon class="stat-icon">people</mat-icon>
            <h2>{{ classInfo.studentCount }}</h2>
            <p>Students</p>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-content>
            <mat-icon class="stat-icon">campaign</mat-icon>
            <h2>0</h2>
            <p>Announcements</p>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-content>
            <mat-icon class="stat-icon">calendar_today</mat-icon>
            <h2>{{ classInfo.createdAt | date : 'MMM d' }}</h2>
            <p>Created</p>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Assignments Section -->
      <mat-card class="assignments-card">
        <mat-card-header>
          <mat-card-title>
            <div class="section-header">
              <span>Assignments</span>
              <button
                mat-raised-button
                color="primary"
                (click)="createAssignment()"
                *ngIf="isTeacher"
              >
                <mat-icon>add</mat-icon>
                Create Assignment
              </button>
            </div>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div *ngIf="assignments.length === 0" class="empty-state">
            <mat-icon>assignment</mat-icon>
            <h3>No assignments yet</h3>
            <p *ngIf="isTeacher">Create your first assignment to get started!</p>
          </div>

          <div class="assignments-list" *ngIf="assignments.length > 0">
            <mat-card *ngFor="let assignment of assignments" class="assignment-card">
              <mat-card-header>
                <mat-card-title>{{ assignment.title }}</mat-card-title>
                <mat-card-subtitle>
                  Due: {{ assignment.dueDate | date : 'MMM d, y' }} • {{ assignment.maxPoints }}
                  points
                </mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <p>{{ assignment.description }}</p>
              </mat-card-content>
              <mat-card-actions *ngIf="isTeacher">
                <button mat-button color="warn" (click)="deleteAssignment(assignment)">
                  <mat-icon>delete</mat-icon>
                  Delete
                </button>
              </mat-card-actions>
            </mat-card>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .spacer {
        flex: 1 1 auto;
      }
      .delete-item {
        color: #f44336;
      }
      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 400px;
        color: #999;
      }
      .loading-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        margin-bottom: 16px;
        animation: spin 2s linear infinite;
      }
      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
      .class-detail-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 24px;
      }
      .header-card {
        margin-bottom: 24px;
      }
      .header-card h1 {
        margin: 0;
        font-size: 2em;
      }
      .class-meta {
        margin-top: 16px;
      }
      .clickable {
        cursor: pointer;
      }
      .clickable:hover {
        background-color: rgba(0, 0, 0, 0.08);
      }
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        margin-bottom: 24px;
      }
      .stats-grid mat-card {
        text-align: center;
      }
      .stat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #667eea;
        margin-bottom: 8px;
      }
      .stats-grid h2 {
        margin: 8px 0;
        font-size: 2em;
        color: #667eea;
      }
      .stats-grid p {
        margin: 0;
        color: #666;
      }
      .assignments-card {
        margin-bottom: 24px;
      }
      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
      }
      .assignments-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .assignment-card {
        background: #f5f5f5;
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
    `,
  ],
})
export class ClassDetailComponent implements OnInit {
  classId!: number;
  classInfo: Class | null = null;
  isTeacher = false;
  assignments: Assignment[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private classService: ClassService,
    private assignmentService: AssignmentService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.isTeacher = this.authService.getCurrentUser()?.role === 'Teacher';
    this.classId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadClassInfo();
    this.loadAssignments();
  }

  loadClassInfo(): void {
    this.classService.getClassById(this.classId).subscribe({
      next: (classInfo) => {
        this.classInfo = classInfo;
      },
      error: (error) => {
        console.error('Error loading class:', error);
        this.snackBar.open('Failed to load class', 'Close', { duration: 3000 });
        this.goBack();
      },
    });
  }

  loadAssignments(): void {
    this.assignmentService.getClassAssignments(this.classId).subscribe({
      next: (assignments) => {
        this.assignments = assignments;
      },
      error: (error) => {
        console.error('Error loading assignments:', error);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  copyJoinCode(): void {
    if (this.classInfo?.joinCode) {
      navigator.clipboard.writeText(this.classInfo.joinCode);
      this.snackBar.open('Join code copied!', 'Close', { duration: 2000 });
    }
  }

  shareClass(): void {
    if (this.classInfo) {
      const message = `Join "${this.classInfo.name}" with code: ${this.classInfo.joinCode}`;
      navigator.clipboard.writeText(message);
      this.snackBar.open('Share message copied!', 'Close', { duration: 3000 });
    }
  }

  createAssignment(): void {
    const dialogRef = this.dialog.open(CreateAssignmentDialogComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.assignmentService.createAssignment(this.classId, result).subscribe({
          next: () => {
            this.snackBar.open('Assignment created!', 'Close', { duration: 3000 });
            this.loadAssignments();
          },
          error: (error) => {
            console.error('Error creating assignment:', error);
            this.snackBar.open('Failed to create assignment', 'Close', { duration: 3000 });
          },
        });
      }
    });
  }

  deleteAssignment(assignment: Assignment): void {
    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
      width: '400px',
    });
    dialogRef.componentInstance.type = 'assignment';

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.assignmentService.deleteAssignment(this.classId, assignment.id).subscribe({
          next: () => {
            this.snackBar.open('Assignment deleted', 'Close', { duration: 3000 });
            this.loadAssignments();
          },
          error: () => {
            this.snackBar.open('Failed to delete assignment', 'Close', { duration: 3000 });
          },
        });
      }
    });
  }

  deleteClass(): void {
    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
      width: '400px',
    });
    dialogRef.componentInstance.type = 'class';

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed && this.classInfo) {
        this.classService.deleteClass(this.classInfo.id).subscribe({
          next: () => {
            this.snackBar.open('Class deleted', 'Close', { duration: 3000 });
            this.router.navigate(['/dashboard']);
          },
          error: () => {
            this.snackBar.open('Failed to delete', 'Close', { duration: 3000 });
          },
        });
      }
    });
  }
}