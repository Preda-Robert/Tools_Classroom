import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { ClassService } from '../../../core/services/class.service';
import { AuthService } from '../../../core/services/auth.service';
import { Class } from '../../../core/models/class.model';

interface StudyStreak {
  currentStreak: number;
  longestStreak: number;
  lastActivity: Date;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: Date;
  isAI?: boolean;
}

@Component({
  selector: 'app-class-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatChipsModule,
    MatProgressBarModule,
    MatBadgeModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
  ],
  template: `
    <mat-toolbar color="primary">
      <button mat-icon-button (click)="goBack()">
        <mat-icon>arrow_back</mat-icon>
      </button>
      <span>{{ classInfo?.name }}</span>
      <span class="spacer"></span>
      <button mat-icon-button [matBadge]="achievements.filter(a => a.unlocked).length" matBadgeColor="accent">
        <mat-icon>emoji_events</mat-icon>
      </button>
    </mat-toolbar>

    <div class="class-detail-container" *ngIf="classInfo">
      <!-- Class Header -->
      <div class="class-header">
        <div class="class-info">
          <h1>{{ classInfo.name }}</h1>
          <p class="description">{{ classInfo.description }}</p>
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
              <mat-chip *ngIf="isTeacher">
                <mat-icon>lock</mat-icon>
                {{ classInfo.joinCode }}
              </mat-chip>
            </mat-chip-set>
          </div>
        </div>

        <!-- Study Streak Card (Students Only) -->
        <mat-card class="streak-card" *ngIf="!isTeacher">
          <mat-card-content>
            <div class="streak-content">
              <mat-icon class="streak-icon">local_fire_department</mat-icon>
              <div class="streak-info">
                <h2>{{ studyStreak.currentStreak }} Day Streak</h2>
                <p>Longest: {{ studyStreak.longestStreak }} days</p>
                <mat-progress-bar
                  mode="determinate"
                  [value]="(studyStreak.currentStreak / studyStreak.longestStreak) * 100"
                  color="accent"
                ></mat-progress-bar>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Tabs -->
      <mat-tab-group [(selectedIndex)]="selectedTab" animationDuration="300ms">
        <!-- Overview Tab -->
        <mat-tab label="Overview">
          <div class="tab-content">
            <div class="overview-grid">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon>assignment</mat-icon>
                    Assignments
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <h1>3</h1>
                  <p>2 pending</p>
                </mat-card-content>
                <mat-card-actions>
                  <button mat-button color="primary">View All</button>
                </mat-card-actions>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon>emoji_events</mat-icon>
                    Your Points
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <h1>{{ studentPoints }}</h1>
                  <p>Class rank: #{{ classRank }}</p>
                </mat-card-content>
                <mat-card-actions>
                  <button mat-button color="primary" (click)="selectedTab = 3">Leaderboard</button>
                </mat-card-actions>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon>auto_stories</mat-icon>
                    Resources
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <h1>12</h1>
                  <p>Files & links</p>
                </mat-card-content>
                <mat-card-actions>
                  <button mat-button color="primary">Browse</button>
                </mat-card-actions>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon>trending_up</mat-icon>
                    Progress
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <h1>{{ overallProgress }}%</h1>
                  <mat-progress-bar
                    mode="determinate"
                    [value]="overallProgress"
                    color="primary"
                  ></mat-progress-bar>
                </mat-card-content>
                <mat-card-actions>
                  <button mat-button color="primary" (click)="selectedTab = 2">Analytics</button>
                </mat-card-actions>
              </mat-card>
            </div>

            <!-- Recent Announcements -->
            <mat-card class="announcements-card">
              <mat-card-header>
                <mat-card-title>Recent Announcements</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="announcement-item">
                  <mat-icon>campaign</mat-icon>
                  <div>
                    <h4>Welcome to the class!</h4>
                    <p>Looking forward to a great semester together.</p>
                    <small>2 days ago</small>
                  </div>
                </div>
                <div class="empty-state" *ngIf="false">
                  <p>No announcements yet</p>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- AI Study Assistant Tab -->
        <mat-tab label="AI Study Assistant">
          <div class="tab-content">
            <mat-card class="ai-assistant-card">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>psychology</mat-icon>
                  AI Study Assistant
                </mat-card-title>
                <mat-card-subtitle>
                  Ask me anything about this class! I can help explain concepts, review material, and
                  answer questions.
                </mat-card-subtitle>
              </mat-card-header>

              <mat-card-content>
                <div class="chat-messages" #chatMessages>
                  <div
                    *ngFor="let msg of chatMessages"
                    [class]="msg.isAI ? 'message ai-message' : 'message user-message'"
                  >
                    <div class="message-header">
                      <mat-icon>{{ msg.isAI ? 'smart_toy' : 'person' }}</mat-icon>
                      <strong>{{ msg.sender }}</strong>
                      <small>{{ msg.timestamp | date : 'short' }}</small>
                    </div>
                    <p>{{ msg.content }}</p>
                  </div>

                  <div *ngIf="isAITyping" class="message ai-message typing">
                    <mat-icon>smart_toy</mat-icon>
                    <span class="typing-indicator">
                      <span></span><span></span><span></span>
                    </span>
                  </div>

                  <div *ngIf="chatMessages.length === 0" class="empty-chat">
                    <mat-icon>chat</mat-icon>
                    <h3>Start a conversation</h3>
                    <p>Try asking: "Can you explain this week's topic?"</p>
                  </div>
                </div>

                <div class="chat-input">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Type your question...</mat-label>
                    <input
                      matInput
                      [(ngModel)]="currentMessage"
                      (keyup.enter)="sendMessage()"
                      [disabled]="isAITyping"
                    />
                    <button
                      mat-icon-button
                      matSuffix
                      (click)="sendMessage()"
                      [disabled]="!currentMessage.trim() || isAITyping"
                    >
                      <mat-icon>send</mat-icon>
                    </button>
                  </mat-form-field>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Analytics Tab -->
        <mat-tab label="Analytics">
          <div class="tab-content">
            <div class="analytics-grid">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Study Time This Week</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="chart-placeholder">
                    <mat-icon>bar_chart</mat-icon>
                    <p>5.5 hours total</p>
                    <div class="time-breakdown">
                      <div class="time-item">Mon: 1.2h</div>
                      <div class="time-item">Tue: 0.8h</div>
                      <div class="time-item">Wed: 1.5h</div>
                      <div class="time-item">Thu: 1.0h</div>
                      <div class="time-item">Fri: 1.0h</div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>Performance Trends</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="performance-stats">
                    <div class="stat-item">
                      <mat-icon class="trend-up">trending_up</mat-icon>
                      <div>
                        <h3>Assignment Average</h3>
                        <p>87% (+5% from last month)</p>
                      </div>
                    </div>
                    <div class="stat-item">
                      <mat-icon class="trend-neutral">trending_flat</mat-icon>
                      <div>
                        <h3>Participation</h3>
                        <p>92% (stable)</p>
                      </div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>Best Study Times</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="study-times">
                    <p>
                      <mat-icon>wb_sunny</mat-icon>
                      Morning (9-11 AM): 85% focus
                    </p>
                    <p>
                      <mat-icon>wb_twilight</mat-icon>
                      Afternoon (2-4 PM): 92% focus
                    </p>
                    <p>
                      <mat-icon>nights_stay</mat-icon>
                      Evening (7-9 PM): 78% focus
                    </p>
                    <div class="recommendation">
                      <mat-icon>lightbulb</mat-icon>
                      <small>You're most productive in the afternoon!</small>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </mat-tab>

        <!-- Leaderboard Tab -->
        <mat-tab label="Leaderboard">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>leaderboard</mat-icon>
                  Class Rankings
                </mat-card-title>
                <mat-card-subtitle>
                  Earn points through assignments, participation, and maintaining study streaks
                </mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="leaderboard">
                  <div class="leaderboard-item top-3" *ngFor="let student of leaderboard; let i = index">
                    <div class="rank">
                      <mat-icon *ngIf="i === 0" class="gold">emoji_events</mat-icon>
                      <mat-icon *ngIf="i === 1" class="silver">emoji_events</mat-icon>
                      <mat-icon *ngIf="i === 2" class="bronze">emoji_events</mat-icon>
                      <span *ngIf="i > 2">#{{ i + 1 }}</span>
                    </div>
                    <div class="student-info">
                      <strong>{{ student.name }}</strong>
                      <div class="badges">
                        <mat-chip *ngFor="let badge of student.badges">{{ badge }}</mat-chip>
                      </div>
                    </div>
                    <div class="points">{{ student.points }} pts</div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Achievements Tab -->
        <mat-tab label="Achievements">
          <div class="tab-content">
            <div class="achievements-grid">
              <mat-card *ngFor="let achievement of achievements" [class.unlocked]="achievement.unlocked">
                <mat-card-content>
                  <div class="achievement-icon">
                    <mat-icon [class.unlocked]="achievement.unlocked">{{ achievement.icon }}</mat-icon>
                  </div>
                  <h3>{{ achievement.name }}</h3>
                  <p>{{ achievement.description }}</p>
                  <mat-progress-bar
                    *ngIf="!achievement.unlocked"
                    mode="determinate"
                    [value]="(achievement.progress / achievement.maxProgress) * 100"
                  ></mat-progress-bar>
                  <small *ngIf="!achievement.unlocked">
                    {{ achievement.progress }}/{{ achievement.maxProgress }}
                  </small>
                  <mat-chip *ngIf="achievement.unlocked" class="unlocked-badge">Unlocked!</mat-chip>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [
    `
      .spacer {
        flex: 1 1 auto;
      }

      .class-detail-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 24px;
      }

      .class-header {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 24px;
        margin-bottom: 24px;
      }

      .class-info h1 {
        margin: 0 0 8px 0;
        font-size: 2em;
      }

      .description {
        color: #666;
        margin-bottom: 16px;
      }

      .class-meta {
        margin-top: 16px;
      }

      .streak-card {
        min-width: 300px;
      }

      .streak-content {
        display: flex;
        gap: 16px;
        align-items: center;
      }

      .streak-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #ff6b35;
      }

      .streak-info h2 {
        margin: 0;
        font-size: 1.5em;
      }

      .streak-info p {
        margin: 4px 0;
        color: #666;
      }

      .tab-content {
        padding: 24px 0;
      }

      .overview-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin-bottom: 24px;
      }

      .overview-grid mat-card h1 {
        font-size: 2.5em;
        margin: 8px 0;
        color: #667eea;
      }

      .overview-grid mat-card p {
        color: #666;
        margin: 0;
      }

      .overview-grid mat-card-title {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .announcements-card {
        margin-top: 24px;
      }

      .announcement-item {
        display: flex;
        gap: 16px;
        padding: 16px 0;
        border-bottom: 1px solid #eee;
      }

      .announcement-item:last-child {
        border-bottom: none;
      }

      .announcement-item mat-icon {
        color: #667eea;
      }

      .announcement-item h4 {
        margin: 0 0 4px 0;
      }

      .announcement-item p {
        margin: 0 0 4px 0;
        color: #666;
      }

      .announcement-item small {
        color: #999;
      }

      .ai-assistant-card {
        height: 600px;
        display: flex;
        flex-direction: column;
      }

      .ai-assistant-card mat-card-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        background: #f5f5f5;
        border-radius: 8px;
        margin-bottom: 16px;
      }

      .message {
        margin-bottom: 16px;
        padding: 12px;
        border-radius: 8px;
        max-width: 80%;
      }

      .user-message {
        background: #667eea;
        color: white;
        margin-left: auto;
      }

      .ai-message {
        background: white;
        margin-right: auto;
      }

      .message-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
      }

      .message-header mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      .message p {
        margin: 0;
      }

      .typing-indicator {
        display: flex;
        gap: 4px;
        padding: 8px;
      }

      .typing-indicator span {
        width: 8px;
        height: 8px;
        background: #999;
        border-radius: 50%;
        animation: typing 1.4s infinite;
      }

      .typing-indicator span:nth-child(2) {
        animation-delay: 0.2s;
      }

      .typing-indicator span:nth-child(3) {
        animation-delay: 0.4s;
      }

      @keyframes typing {
        0%,
        60%,
        100% {
          transform: translateY(0);
        }
        30% {
          transform: translateY(-10px);
        }
      }

      .empty-chat {
        text-align: center;
        padding: 60px 20px;
        color: #999;
      }

      .empty-chat mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
      }

      .chat-input {
        margin-top: 8px;
      }

      .full-width {
        width: 100%;
      }

      .analytics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 20px;
      }

      .chart-placeholder {
        text-align: center;
        padding: 20px;
      }

      .chart-placeholder mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: #667eea;
      }

      .time-breakdown {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 16px;
      }

      .time-item {
        padding: 8px;
        background: #f5f5f5;
        border-radius: 4px;
      }

      .performance-stats,
      .study-times {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .stat-item {
        display: flex;
        gap: 12px;
        align-items: center;
      }

      .trend-up {
        color: #4caf50;
      }

      .trend-neutral {
        color: #ff9800;
      }

      .study-times p {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 8px 0;
      }

      .recommendation {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #e3f2fd;
        padding: 12px;
        border-radius: 8px;
        margin-top: 16px;
      }

      .recommendation mat-icon {
        color: #2196f3;
      }

      .leaderboard {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .leaderboard-item {
        display: grid;
        grid-template-columns: 60px 1fr auto;
        gap: 16px;
        padding: 16px;
        background: #f5f5f5;
        border-radius: 8px;
        align-items: center;
      }

      .leaderboard-item.top-3 {
        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      }

      .rank {
        text-align: center;
        font-size: 1.5em;
        font-weight: bold;
      }

      .gold {
        color: #ffd700;
      }

      .silver {
        color: #c0c0c0;
      }

      .bronze {
        color: #cd7f32;
      }

      .student-info strong {
        display: block;
        margin-bottom: 4px;
      }

      .badges {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
      }

      .badges mat-chip {
        font-size: 0.8em;
      }

      .points {
        font-size: 1.2em;
        font-weight: bold;
        color: #667eea;
      }

      .achievements-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 16px;
      }

      .achievements-grid mat-card {
        text-align: center;
        opacity: 0.6;
        transition: all 0.3s;
      }

      .achievements-grid mat-card.unlocked {
        opacity: 1;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      .achievement-icon mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: #999;
      }

      .achievement-icon mat-icon.unlocked {
        color: #ffd700;
      }

      .achievements-grid mat-card h3 {
        margin: 12px 0 8px 0;
      }

      .achievements-grid mat-card p {
        font-size: 0.9em;
        margin-bottom: 12px;
      }

      .unlocked-badge {
        background: #4caf50;
        color: white;
      }

      .empty-state {
        text-align: center;
        padding: 40px 20px;
        color: #999;
      }
    `,
  ],
})
export class ClassDetailComponent implements OnInit {
  classId!: number;
  classInfo: Class | null = null;
  isTeacher = false;
  selectedTab = 0;

  // Study Streak
  studyStreak: StudyStreak = {
    currentStreak: 7,
    longestStreak: 12,
    lastActivity: new Date(),
  };

  // Gamification
  studentPoints = 1250;
  classRank = 3;
  overallProgress = 78;

  // AI Chat
  chatMessages: Message[] = [];
  currentMessage = '';
  isAITyping = false;

  // Leaderboard
  leaderboard = [
    { name: 'Alice Johnson', points: 1580, badges: ['🔥 7-day streak', '⭐ Top scorer'] },
    { name: 'Bob Smith', points: 1420, badges: ['📚 Bookworm'] },
    { name: 'You (Charlie Brown)', points: 1250, badges: ['🎯 Consistent'] },
    { name: 'Diana Prince', points: 1100, badges: ['💡 Helper'] },
    { name: 'Ethan Hunt', points: 980, badges: [] },
  ];

  // Achievements
  achievements: Achievement[] = [
    {
      id: '1',
      name: 'First Steps',
      description: 'Complete your first assignment',
      icon: 'flag',
      unlocked: true,
      progress: 1,
      maxProgress: 1,
    },
    {
      id: '2',
      name: 'Week Warrior',
      description: 'Maintain a 7-day study streak',
      icon: 'local_fire_department',
      unlocked: true,
      progress: 7,
      maxProgress: 7,
    },
    {
      id: '3',
      name: 'Perfect Score',
      description: 'Get 100% on an assignment',
      icon: 'star',
      unlocked: false,
      progress: 0,
      maxProgress: 1,
    },
    {
      id: '4',
      name: 'Helpful Hand',
      description: 'Help 5 classmates',
      icon: 'volunteer_activism',
      unlocked: false,
      progress: 2,
      maxProgress: 5,
    },
    {
      id: '5',
      name: 'Speed Demon',
      description: 'Submit 3 assignments early',
      icon: 'bolt',
      unlocked: false,
      progress: 1,
      maxProgress: 3,
    },
    {
      id: '6',
      name: 'Marathon Runner',
      description: 'Maintain a 30-day streak',
      icon: 'emoji_events',
      unlocked: false,
      progress: 7,
      maxProgress: 30,
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private classService: ClassService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.isTeacher = currentUser?.role === 'Teacher';

    this.classId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadClassInfo();
  }

  loadClassInfo(): void {
    this.classService.getClassById(this.classId).subscribe({
      next: (classInfo) => {
        this.classInfo = classInfo;
      },
      error: (error) => {
        console.error('Error loading class:', error);
        this.snackBar.open('Failed to load class information', 'Close', { duration: 3000 });
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  sendMessage(): void {
    if (!this.currentMessage.trim()) return;

    // Add user message
    this.chatMessages.push({
      id: this.chatMessages.length + 1,
      sender: 'You',
      content: this.currentMessage,
      timestamp: new Date(),
      isAI: false,
    });

    const userQuestion = this.currentMessage;
    this.currentMessage = '';
    this.isAITyping = true;

    // Simulate AI response (you can integrate with Claude API here)
    setTimeout(() => {
      this.chatMessages.push({
        id: this.chatMessages.length + 1,
        sender: 'AI Assistant',
        content: this.generateAIResponse(userQuestion),
        timestamp: new Date(),
        isAI: true,
      });
      this.isAITyping = false;
    }, 2000);
  }

  private generateAIResponse(question: string): string {
    // Simple response generation - can be replaced with actual AI API call
    const responses = [
      "That's a great question! Based on the course material, here's what I can explain...",
      'Let me help you understand this concept better. The key point is...',
      "I can see why that might be confusing. Let's break it down step by step...",
      "Good thinking! Here's how I would approach this problem...",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
}