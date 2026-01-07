// frontend/src/app/features/classes/class-detail/class-detail.component.ts
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
import { ClassService } from '../../../core/services/class.service';
import { AuthService } from '../../../core/services/auth.service';
import { Class } from '../../../core/models/class.model';

@Component({
  selector: 'app-delete-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Delete Class?</h2>
    <mat-dialog-content>
      <p>Are you sure you want to delete this class?</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="warn" [mat-dialog-close]="true">Delete</button>
    </mat-dialog-actions>
  `,
})
export class DeleteConfirmDialogComponent {}

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
            <h2>3</h2>
            <p>Assignments</p>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-content>
            <mat-icon class="stat-icon">emoji_events</mat-icon>
            <h2>{{ isTeacher ? '85%' : '1250' }}</h2>
            <p>{{ isTeacher ? 'Class Average' : 'Your Points' }}</p>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-content>
            <mat-icon class="stat-icon">campaign</mat-icon>
            <h2>2</h2>
            <p>Announcements</p>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-content>
            <mat-icon class="stat-icon">trending_up</mat-icon>
            <h2>78%</h2>
            <p>Progress</p>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Recent Activity -->
      <mat-card class="activity-card">
        <mat-card-header>
          <mat-card-title>Recent Activity</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="activity-item">
            <mat-icon>assignment</mat-icon>
            <div>
              <strong>New Assignment Posted</strong>
              <p>Mathematics Homework #5</p>
              <small>2 days ago</small>
            </div>
          </div>
          <div class="activity-item">
            <mat-icon>campaign</mat-icon>
            <div>
              <strong>Announcement</strong>
              <p>Welcome to the class!</p>
              <small>5 days ago</small>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Action Buttons -->
      <div class="actions">
        <button mat-raised-button color="primary">
          <mat-icon>assignment</mat-icon>
          View Assignments
        </button>
        <button mat-raised-button color="accent" *ngIf="!isTeacher">
          <mat-icon>psychology</mat-icon>
          AI Study Assistant
        </button>
        <button mat-raised-button *ngIf="isTeacher">
          <mat-icon>add</mat-icon>
          Create Assignment
        </button>
      </div>
    </div>
  `,
  styles: [`
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
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
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
    .activity-card {
      margin-bottom: 24px;
    }
    .activity-item {
      display: flex;
      gap: 16px;
      padding: 16px 0;
      border-bottom: 1px solid #eee;
    }
    .activity-item:last-child {
      border-bottom: none;
    }
    .activity-item mat-icon {
      color: #667eea;
    }
    .activity-item strong {
      display: block;
      margin-bottom: 4px;
    }
    .activity-item p {
      margin: 0 0 4px 0;
      color: #666;
    }
    .activity-item small {
      color: #999;
    }
    .actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
    .actions button {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `]
})
export class ClassDetailComponent implements OnInit {
  classId!: number;
  classInfo: Class | null = null;
  isTeacher = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private classService: ClassService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    console.log('ClassDetailComponent initialized');
    const currentUser = this.authService.getCurrentUser();
    this.isTeacher = currentUser?.role === 'Teacher';
    this.classId = Number(this.route.snapshot.paramMap.get('id'));
    console.log('Loading class with ID:', this.classId);
    this.loadClassInfo();
  }

  loadClassInfo(): void {
    this.classService.getClassById(this.classId).subscribe({
      next: (classInfo) => {
        console.log('Class loaded successfully:', classInfo);
        this.classInfo = classInfo;
      },
      error: (error) => {
        console.error('Error loading class:', error);
        this.snackBar.open('Failed to load class', 'Close', { duration: 3000 });
        setTimeout(() => this.goBack(), 1000);
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

  deleteClass(): void {
    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
      width: '400px',
    });

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