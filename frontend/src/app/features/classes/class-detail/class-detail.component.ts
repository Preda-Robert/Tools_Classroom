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
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { ClassService } from '../../../core/services/class.service';
import { AuthService } from '../../../core/services/auth.service';
import { AssignmentService } from '../../../core/services/assignment.service';
import { AnnouncementService } from '../../../core/services/announcement.service';
import { QuizService } from '../../../core/services/quiz.service';
import { Class } from '../../../core/models/class.model';
import { Assignment } from '../../../core/models/assignment.model';
import { Announcement } from '../../../core/models/announcement.model';
import { Quiz } from '../../../core/models/quiz.model';
import { CreateAssignmentDialogComponent } from '../../assignments/create-assignment/create-assignment-dialog.component';
import { AssignmentDetailDialogComponent } from '../../assignments/assignment-detail/assignment-detail-dialog.component';
import { CreateAnnouncementDialogComponent } from '../../announcements/create-announcement/create-announcement-dialog.component';
import { CreateQuizDialogComponent } from '../../quizzes/create-quiz/create-quiz-dialog.component';
import { ChangeDetectorRef } from '@angular/core';

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
    MatTabsModule,
    MatBadgeModule,
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
            <mat-icon class="stat-icon">quiz</mat-icon>
            <h2>{{ quizzes.length }}</h2>
            <p>Quizzes</p>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-content>
            <mat-icon class="stat-icon">campaign</mat-icon>
            <h2>{{ announcements.length }}</h2>
            <p>Announcements</p>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-content>
            <mat-icon class="stat-icon">people</mat-icon>
            <h2>{{ classInfo.studentCount }}</h2>
            <p>Students</p>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Content Tabs -->
      <mat-card class="content-card">
        <mat-tab-group>
          <!-- Feed Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>feed</mat-icon>
              Feed
            </ng-template>
            <div class="tab-content">
              <div class="feed-actions" *ngIf="isTeacher">
                <button mat-raised-button color="primary" [matMenuTriggerFor]="createMenu">
                  <mat-icon>add</mat-icon>
                  Create
                </button>
                <mat-menu #createMenu="matMenu">
                  <button mat-menu-item (click)="createAnnouncement()">
                    <mat-icon>campaign</mat-icon>
                    Announcement
                  </button>
                  <button mat-menu-item (click)="createAssignment()">
                    <mat-icon>assignment</mat-icon>
                    Assignment
                  </button>
                  <button mat-menu-item (click)="createQuiz()">
                    <mat-icon>quiz</mat-icon>
                    Quiz
                  </button>
                </mat-menu>
              </div>

              <div class="feed-items">
                <div *ngFor="let item of feedItems" class="feed-item">
                  <!-- Announcement Item -->
                  <mat-card *ngIf="item.type === 'announcement'" class="announcement-card">
                    <mat-card-header>
                      <div class="item-icon announcement-icon">
                        <mat-icon>campaign</mat-icon>
                      </div>
                      <mat-card-title>{{ item.data.title }}</mat-card-title>
                      <mat-card-subtitle>
                        {{ item.data.creatorName }} • {{ item.data.createdAt | date : 'MMM d, y' }}
                      </mat-card-subtitle>
                    </mat-card-header>
                    <mat-card-content>
                      <p class="announcement-content">{{ item.data.content }}</p>
                    </mat-card-content>
                    <mat-card-actions *ngIf="isTeacher">
                      <button mat-button color="warn" (click)="deleteAnnouncement(item.data)">
                        <mat-icon>delete</mat-icon>
                        Delete
                      </button>
                    </mat-card-actions>
                  </mat-card>

                  <!-- Assignment Item -->
                  <mat-card
                    *ngIf="item.type === 'assignment'"
                    class="assignment-card-feed clickable"
                    (click)="viewAssignment(item.data)"
                  >
                    <mat-card-header>
                      <div class="item-icon assignment-icon">
                        <mat-icon>assignment</mat-icon>
                      </div>
                      <mat-card-title>{{ item.data.title }}</mat-card-title>
                      <mat-card-subtitle>
                        Due: {{ item.data.dueDate | date : 'MMM d, y' }} •
                        {{ item.data.maxPoints }} points
                      </mat-card-subtitle>
                    </mat-card-header>
                    <mat-card-content>
                      <p class="item-description">{{ item.data.description }}</p>
                    </mat-card-content>
                  </mat-card>

                  <!-- Quiz Item -->
                  <mat-card *ngIf="item.type === 'quiz'" class="quiz-card-feed clickable">
                    <mat-card-header>
                      <div class="item-icon quiz-icon">
                        <mat-icon>quiz</mat-icon>
                      </div>
                      <mat-card-title>{{ item.data.title }}</mat-card-title>
                      <mat-card-subtitle>
                        Due: {{ item.data.dueDate | date : 'MMM d, y' }} •
                        {{ item.data.questions.length }} questions • {{ item.data.maxPoints }}
                        points
                      </mat-card-subtitle>
                    </mat-card-header>
                    <mat-card-content>
                      <p class="item-description">{{ item.data.description }}</p>
                      <div class="quiz-meta">
                        <span *ngIf="item.data.timeLimit > 0">
                          <mat-icon>schedule</mat-icon>
                          {{ item.data.timeLimit }} min
                        </span>
                      </div>
                    </mat-card-content>
                    <mat-card-actions *ngIf="isTeacher">
                      <button mat-button color="warn" (click)="deleteQuiz(item.data); $event.stopPropagation()">
                        <mat-icon>delete</mat-icon>
                        Delete
                      </button>
                    </mat-card-actions>
                  </mat-card>
                </div>

                <div *ngIf="feedItems.length === 0" class="empty-state">
                  <mat-icon>inbox</mat-icon>
                  <h3>No content yet</h3>
                  <p *ngIf="isTeacher">Start by creating an announcement, assignment, or quiz!</p>
                  <p *ngIf="!isTeacher">Check back later for updates from your teacher.</p>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Assignments Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon [matBadge]="assignments.length" matBadgeColor="accent">assignment</mat-icon>
              Assignments
            </ng-template>
            <div class="tab-content">
              <div class="section-actions" *ngIf="isTeacher">
                <button mat-raised-button color="primary" (click)="createAssignment()">
                  <mat-icon>add</mat-icon>
                  Create Assignment
                </button>
              </div>

              <div class="assignments-list" *ngIf="assignments.length > 0">
                <mat-card
                  *ngFor="let assignment of assignments"
                  class="assignment-card clickable"
                  (click)="viewAssignment(assignment)"
                >
                  <mat-card-header>
                    <mat-card-title>{{ assignment.title }}</mat-card-title>
                    <mat-card-subtitle>
                      Due: {{ assignment.dueDate | date : 'MMM d, y' }} •
                      {{ assignment.maxPoints }} points
                    </mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <p class="assignment-description">{{ assignment.description }}</p>
                  </mat-card-content>
                </mat-card>
              </div>

              <div *ngIf="assignments.length === 0" class="empty-state">
                <mat-icon>assignment</mat-icon>
                <h3>No assignments yet</h3>
              </div>
            </div>
          </mat-tab>

          <!-- Quizzes Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon [matBadge]="quizzes.length" matBadgeColor="accent">quiz</mat-icon>
              Quizzes
            </ng-template>
            <div class="tab-content">
              <div class="section-actions" *ngIf="isTeacher">
                <button mat-raised-button color="primary" (click)="createQuiz()">
                  <mat-icon>add</mat-icon>
                  Create Quiz
                </button>
              </div>

              <div class="quizzes-list" *ngIf="quizzes.length > 0">
                <mat-card *ngFor="let quiz of quizzes" class="quiz-card">
                  <mat-card-header>
                    <mat-card-title>{{ quiz.title }}</mat-card-title>
                    <mat-card-subtitle>
                      Due: {{ quiz.dueDate | date : 'MMM d, y' }} • {{ quiz.questions.length }}
                      questions
                    </mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <p>{{ quiz.description }}</p>
                    <div class="quiz-stats">
                      <span><mat-icon>star</mat-icon>{{ quiz.maxPoints }} points</span>
                      <span *ngIf="quiz.timeLimit > 0">
                        <mat-icon>schedule</mat-icon>{{ quiz.timeLimit }} min
                      </span>
                    </div>
                  </mat-card-content>
                  <mat-card-actions>
                    <button mat-button color="primary" disabled>
                      <mat-icon>play_arrow</mat-icon>
                      Start Quiz (Coming Soon)
                    </button>
                  </mat-card-actions>
                </mat-card>
              </div>

              <div *ngIf="quizzes.length === 0" class="empty-state">
                <mat-icon>quiz</mat-icon>
                <h3>No quizzes yet</h3>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
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
      .content-card {
        margin-bottom: 24px;
      }
      .tab-content {
        padding: 24px;
        min-height: 400px;
      }
      .feed-actions,
      .section-actions {
        margin-bottom: 24px;
      }
      .feed-items {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .feed-item {
        animation: slideIn 0.3s ease-out;
      }
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .item-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 16px;
      }
      .announcement-icon {
        background: #fff3e0;
        color: #f57c00;
      }
      .assignment-icon {
        background: #e8eaf6;
        color: #667eea;
      }
      .quiz-icon {
        background: #fce4ec;
        color: #e91e63;
      }
      .announcement-card,
      .assignment-card-feed,
      .quiz-card-feed {
        background: #ffffff;
        transition: all 0.2s ease;
      }
      .announcement-card:hover,
      .assignment-card-feed:hover,
      .quiz-card-feed:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
      .assignment-card-feed:hover,
      .quiz-card-feed:hover {
        transform: translateX(4px);
      }
      .announcement-content {
        white-space: pre-wrap;
        line-height: 1.6;
      }
      .item-description {
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        margin: 0;
      }
      .quiz-meta,
      .quiz-stats {
        display: flex;
        gap: 16px;
        margin-top: 12px;
        color: #666;
      }
      .quiz-meta span,
      .quiz-stats span {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .quiz-meta mat-icon,
      .quiz-stats mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
      .assignments-list,
      .quizzes-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .assignment-card,
      .quiz-card {
        transition: all 0.2s ease;
      }
      .assignment-card:hover {
        transform: translateX(4px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
      .assignment-description {
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        margin: 0;
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
  announcements: Announcement[] = [];
  quizzes: Quiz[] = [];
  feedItems: Array<{ type: string; data: any; date: Date }> = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private classService: ClassService,
    private assignmentService: AssignmentService,
    private announcementService: AnnouncementService,
    private quizService: QuizService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.isTeacher = this.authService.getCurrentUser()?.role === 'Teacher';
    this.classId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadClassInfo();
    this.loadAllContent();
  }

  loadClassInfo(): void {
    this.classService.getClassById(this.classId).subscribe({
      next: (classInfo) => {
        this.classInfo = classInfo;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading class:', error);
        this.snackBar.open('Failed to load class', 'Close', { duration: 3000 });
        this.goBack();
      },
    });
  }

  loadAllContent(): void {
    this.loadAssignments();
    this.loadAnnouncements();
    this.loadQuizzes();
  }

  loadAssignments(): void {
    this.assignmentService.getClassAssignments(this.classId).subscribe({
      next: (assignments) => {
        this.assignments = assignments;
        this.updateFeed();
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading assignments:', error);
      },
    });
  }

  loadAnnouncements(): void {
    this.announcementService.getClassAnnouncements(this.classId).subscribe({
      next: (announcements) => {
        this.announcements = announcements;
        this.updateFeed();
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading announcements:', error);
      },
    });
  }

  loadQuizzes(): void {
    this.quizService.getClassQuizzes(this.classId).subscribe({
      next: (quizzes) => {
        this.quizzes = quizzes;
        this.updateFeed();
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading quizzes:', error);
      },
    });
  }

  updateFeed(): void {
    this.feedItems = [
      ...this.announcements.map((a) => ({ type: 'announcement', data: a, date: new Date(a.createdAt) })),
      ...this.assignments.map((a) => ({ type: 'assignment', data: a, date: new Date(a.createdAt) })),
      ...this.quizzes.map((q) => ({ type: 'quiz', data: q, date: new Date(q.createdAt) })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime());
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

  createAnnouncement(): void {
    const dialogRef = this.dialog.open(CreateAnnouncementDialogComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.announcementService.createAnnouncement(this.classId, result).subscribe({
          next: () => {
            this.snackBar.open('Announcement posted!', 'Close', { duration: 3000 });
            this.loadAnnouncements();
          },
          error: (error) => {
            console.error('Error creating announcement:', error);
            this.snackBar.open('Failed to post announcement', 'Close', { duration: 3000 });
          },
        });
      }
    });
  }

  viewAssignment(assignment: Assignment): void {
    this.dialog.open(AssignmentDetailDialogComponent, {
      width: '700px',
      maxWidth: '90vw',
      data: {
        assignment: assignment,
        isTeacher: this.isTeacher,
        classStudentCount: this.classInfo?.studentCount || 0,
      },
    });
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

  createQuiz(): void {
    const dialogRef = this.dialog.open(CreateQuizDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.quizService.createQuiz(this.classId, result).subscribe({
          next: () => {
            this.snackBar.open('Quiz created!', 'Close', { duration: 3000 });
            this.loadQuizzes();
          },
          error: (error) => {
            console.error('Error creating quiz:', error);
            this.snackBar.open('Failed to create quiz', 'Close', { duration: 3000 });
          },
        });
      }
    });
  }

  deleteAnnouncement(announcement: Announcement): void {
    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
      width: '400px',
    });
    dialogRef.componentInstance.type = 'announcement';

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.announcementService.deleteAnnouncement(this.classId, announcement.id).subscribe({
          next: () => {
            this.snackBar.open('Announcement deleted', 'Close', { duration: 3000 });
            this.loadAnnouncements();
          },
          error: () => {
            this.snackBar.open('Failed to delete announcement', 'Close', { duration: 3000 });
          },
        });
      }
    });
  }

  deleteQuiz(quiz: Quiz): void {
    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
      width: '400px',
    });
    dialogRef.componentInstance.type = 'quiz';

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.quizService.deleteQuiz(this.classId, quiz.id).subscribe({
          next: () => {
            this.snackBar.open('Quiz deleted', 'Close', { duration: 3000 });
            this.loadQuizzes();
          },
          error: () => {
            this.snackBar.open('Failed to delete quiz', 'Close', { duration: 3000 });
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