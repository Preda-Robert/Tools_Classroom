import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/services/auth.service';
import { ClassService } from '../../core/services/class.service';
import { Class } from '../../core/models/class.model';
import { CreateClassDialogComponent } from '../classes/create-class/create-class-dialog.component';
import { JoinClassDialogComponent } from '../classes/join-class/join-class-dialog.component';
import { User } from '../../core/models/user.model';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
  ],
  template: `
    <mat-toolbar color="primary">
      <span>SmartClass - Dashboard</span>
      <span class="spacer"></span>
      <span class="user-info">
        {{ currentUser?.firstName }} {{ currentUser?.lastName }} ({{ currentUser?.role }})
      </span>
      <button mat-button (click)="logout()"><mat-icon>logout</mat-icon> Logout</button>
    </mat-toolbar>

    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>My Classes</h1>
        <div class="actions">
          <button mat-raised-button color="primary" (click)="openCreateClass()" *ngIf="isTeacher">
            <mat-icon>add</mat-icon> Create Class
          </button>
          <button mat-raised-button color="accent" (click)="openJoinClass()" *ngIf="!isTeacher">
            <mat-icon>login</mat-icon> Join Class
          </button>
          <button mat-icon-button (click)="loadClasses()" matTooltip="Refresh">
            <mat-icon>refresh</mat-icon>
          </button>
        </div>
      </div>

      <div *ngIf="isLoading" class="loading-container">
        <mat-spinner></mat-spinner>
        <p>Loading classes...</p>
      </div>

      <div *ngIf="!isLoading" class="classes-grid">
        <mat-card *ngFor="let class of classes" class="class-card" (click)="openClass(class.id)">
          <mat-card-header>
            <mat-card-title>{{ class.name }}</mat-card-title>
            <mat-card-subtitle>{{ class.teacherName }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>{{ class.description }}</p>
            <div class="class-info">
              <span><mat-icon>people</mat-icon> {{ class.studentCount }} students</span>
              <span *ngIf="isTeacher"><mat-icon>lock</mat-icon> {{ class.joinCode }}</span>
            </div>
          </mat-card-content>
        </mat-card>

        <div *ngIf="classes.length === 0" class="empty-state">
          <mat-icon>school</mat-icon>
          <h2>No classes yet</h2>
          <p *ngIf="isTeacher">Create your first class to get started!</p>
          <p *ngIf="!isTeacher">Join a class using a join code to get started!</p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .spacer {
        flex: 1 1 auto;
      }
      .user-info {
        margin-right: 20px;
      }
      .dashboard-container {
        padding: 24px;
        max-width: 1200px;
        margin: 0 auto;
      }
      .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }
      .actions {
        display: flex;
        gap: 12px;
        align-items: center;
      }
      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
        gap: 20px;
      }
      .classes-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
      }
      .class-card {
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .class-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
      }
      .class-info {
        display: flex;
        gap: 16px;
        margin-top: 12px;
        font-size: 0.9em;
        color: #666;
      }
      .class-info span {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .class-info mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
      .empty-state {
        grid-column: 1 / -1;
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
export class DashboardComponent implements OnInit {
  classes: Class[] = [];
  currentUser: User | null = null;
  isTeacher = false;
  isLoading = false;

  constructor(
    private authService: AuthService,
    private classService: ClassService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef   
  ) {}

ngOnInit(): void {
  console.log('Dashboard initialized');
  this.currentUser = this.authService.getCurrentUser();
  this.isTeacher = this.currentUser?.role === 'Teacher';
  console.log('Current user:', this.currentUser);
  this.loadClasses();
}

  loadClasses(): void {
    this.isLoading = true;
    this.classService.getMyClasses().subscribe({
      next: (classes) => {
        this.classes = classes;
        this.isLoading = false;
        this.cdr.markForCheck();
        console.log('Loaded classes:', classes);
      },
      error: (error) => {
        console.error('Error loading classes:', error);
        this.isLoading = false;
        this.snackBar.open('Failed to load classes', 'Close', { duration: 3000 });
      },
    });
  }

  openClass(id: number): void {
    this.router.navigate(['/classes', id]);
  }

  openCreateClass(): void {
    const dialogRef = this.dialog.open(CreateClassDialogComponent, {
      width: '500px',
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('Create class dialog closed with result:', result);
      if (result === true) {
        // Reload classes immediately
        this.loadClasses();
      }
    });
  }

  openJoinClass(): void {
    const dialogRef = this.dialog.open(JoinClassDialogComponent, {
      width: '400px',
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('Join class dialog closed with result:', result);
      if (result === true) {
        // Reload classes immediately
        this.loadClasses();
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}