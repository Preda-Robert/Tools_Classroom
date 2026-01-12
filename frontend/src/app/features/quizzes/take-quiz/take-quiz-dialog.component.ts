import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { Quiz } from '../../../core/models/quiz.model';

interface DialogData {
  quiz: Quiz;
  classId: number;
}

@Component({
  selector: 'app-take-quiz-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatCardModule,
    MatProgressBarModule,
    MatChipsModule,
  ],
  template: `
    <div class="dialog-header">
      <div>
        <h2 mat-dialog-title>{{ data.quiz.title }}</h2>
        <p class="quiz-description">{{ data.quiz.description }}</p>
      </div>
      <button mat-icon-button (click)="onCancel()" *ngIf="!quizStarted">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content>
      <!-- Quiz Info (Before Start) -->
      <div *ngIf="!quizStarted" class="quiz-info">
        <mat-card class="info-card">
          <mat-card-content>
            <div class="info-grid">
              <div class="info-item">
                <mat-icon>quiz</mat-icon>
                <div>
                  <strong>{{ data.quiz.questions.length }}</strong>
                  <p>Questions</p>
                </div>
              </div>
              <div class="info-item">
                <mat-icon>star</mat-icon>
                <div>
                  <strong>{{ data.quiz.maxPoints }}</strong>
                  <p>Total Points</p>
                </div>
              </div>
              <div class="info-item" *ngIf="data.quiz.timeLimit > 0">
                <mat-icon>schedule</mat-icon>
                <div>
                  <strong>{{ data.quiz.timeLimit }}</strong>
                  <p>Minutes</p>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <div class="instructions">
          <h3><mat-icon>info</mat-icon> Instructions</h3>
          <ul>
            <li>Read each question carefully</li>
            <li>Select one answer for each question</li>
            <li *ngIf="data.quiz.timeLimit > 0">You have {{ data.quiz.timeLimit }} minutes to complete the quiz</li>
            <li *ngIf="data.quiz.timeLimit === 0">There is no time limit for this quiz</li>
            <li>You can only submit once - make sure all answers are correct</li>
          </ul>
        </div>
      </div>

      <!-- Quiz Questions (After Start) -->
      <div *ngIf="quizStarted" class="quiz-content">
        <!-- Timer and Progress -->
        <div class="quiz-header">
          <div class="progress-info">
            <span>Question {{ currentQuestionIndex + 1 }} of {{ data.quiz.questions.length }}</span>
            <mat-progress-bar
              mode="determinate"
              [value]="progressPercentage"
            ></mat-progress-bar>
          </div>
          <div class="timer" *ngIf="data.quiz.timeLimit > 0" [class.warning]="timeWarning">
            <mat-icon>schedule</mat-icon>
            <span>{{ formatTime(timeRemaining) }}</span>
          </div>
          <div class="timer" *ngIf="data.quiz.timeLimit === 0">
            <mat-icon>schedule</mat-icon>
            <span>{{ formatTime(timeElapsed) }}</span>
          </div>
        </div>

        <!-- Current Question -->
        <mat-card class="question-card">
          <mat-card-content>
            <div class="question-header">
              <h3>{{ currentQuestion.questionText }}</h3>
              <mat-chip class="points-chip">{{ currentQuestion.points }} pts</mat-chip>
            </div>

            <div class="options">
              <div
                *ngFor="let option of currentQuestion.options; let i = index"
                class="option"
                [class.selected]="selectedAnswers[currentQuestionIndex] === i"
                (click)="selectAnswer(i)"
              >
                <mat-icon *ngIf="selectedAnswers[currentQuestionIndex] === i">radio_button_checked</mat-icon>
                <mat-icon *ngIf="selectedAnswers[currentQuestionIndex] !== i">radio_button_unchecked</mat-icon>
                <span>{{ option }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Navigation -->
        <div class="navigation">
          <button
            mat-stroked-button
            (click)="previousQuestion()"
            [disabled]="currentQuestionIndex === 0"
          >
            <mat-icon>arrow_back</mat-icon>
            Previous
          </button>

          <div class="question-dots">
            <span
              *ngFor="let q of data.quiz.questions; let i = index"
              class="dot"
              [class.active]="i === currentQuestionIndex"
              [class.answered]="selectedAnswers[i] !== -1"
              (click)="goToQuestion(i)"
            ></span>
          </div>

          <button
            mat-stroked-button
            *ngIf="currentQuestionIndex < data.quiz.questions.length - 1"
            (click)="nextQuestion()"
          >
            Next
            <mat-icon>arrow_forward</mat-icon>
          </button>

          <button
            mat-raised-button
            color="primary"
            *ngIf="currentQuestionIndex === data.quiz.questions.length - 1"
            (click)="submitQuiz()"
            [disabled]="!allQuestionsAnswered()"
          >
            <mat-icon>check</mat-icon>
            Submit Quiz
          </button>
        </div>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions *ngIf="!quizStarted" align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="startQuiz()">
        <mat-icon>play_arrow</mat-icon>
        Start Quiz
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .dialog-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 20px 24px 0;
      }

      .dialog-header h2 {
        margin: 0;
      }

      .quiz-description {
        color: #666;
        margin: 8px 0 0 0;
      }

      mat-dialog-content {
        min-width: 600px;
        max-width: 800px;
        padding: 24px;
        max-height: 70vh;
      }

      .quiz-info {
        padding: 20px 0;
      }

      .info-card {
        margin-bottom: 24px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 24px;
      }

      .info-item {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .info-item mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
      }

      .info-item strong {
        display: block;
        font-size: 1.5em;
        margin-bottom: 4px;
      }

      .info-item p {
        margin: 0;
        opacity: 0.9;
      }

      .instructions {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
        border-left: 4px solid #667eea;
      }

      .instructions h3 {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0 0 16px 0;
        color: #667eea;
      }

      .instructions ul {
        margin: 0;
        padding-left: 20px;
      }

      .instructions li {
        margin-bottom: 8px;
        line-height: 1.6;
      }

      .quiz-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        gap: 20px;
      }

      .progress-info {
        flex: 1;
      }

      .progress-info span {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: #667eea;
      }

      .timer {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background: #e8f5e9;
        color: #2e7d32;
        border-radius: 20px;
        font-weight: 500;
      }

      .timer.warning {
        background: #ffebee;
        color: #c62828;
        animation: pulse 1s infinite;
      }

      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }

      .question-card {
        margin-bottom: 24px;
      }

      .question-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 20px;
      }

      .question-header h3 {
        margin: 0;
        flex: 1;
        line-height: 1.5;
      }

      .points-chip {
        background: #667eea !important;
        color: white !important;
        margin-left: 16px;
      }

      .options {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .option {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .option:hover {
        border-color: #667eea;
        background: #f8f9fa;
      }

      .option.selected {
        border-color: #667eea;
        background: #e8eaf6;
      }

      .option mat-icon {
        color: #999;
      }

      .option.selected mat-icon {
        color: #667eea;
      }

      .option span {
        flex: 1;
      }

      .navigation {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
      }

      .question-dots {
        display: flex;
        gap: 8px;
        flex: 1;
        justify-content: center;
      }

      .dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #e0e0e0;
        cursor: pointer;
        transition: all 0.2s;
      }

      .dot:hover {
        background: #bdbdbd;
        transform: scale(1.2);
      }

      .dot.active {
        background: #667eea;
        transform: scale(1.3);
      }

      .dot.answered {
        background: #4caf50;
      }

      .dot.answered.active {
        background: #667eea;
      }

      mat-dialog-actions {
        padding: 16px 24px;
        border-top: 1px solid #e0e0e0;
      }

      @media (max-width: 700px) {
        mat-dialog-content {
          min-width: auto;
        }

        .quiz-header {
          flex-direction: column;
          align-items: stretch;
        }

        .navigation {
          flex-wrap: wrap;
        }

        .question-dots {
          order: -1;
          width: 100%;
          margin-bottom: 12px;
        }
      }
    `,
  ],
})
export class TakeQuizDialogComponent implements OnInit, OnDestroy {
  data: DialogData = inject(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<TakeQuizDialogComponent>);

  quizStarted = false;
  currentQuestionIndex = 0;
  selectedAnswers: number[] = [];
  
  startTime = 0;
  timeElapsed = 0;
  timeRemaining = 0;
  timerInterval: any;

  get currentQuestion() {
    return this.data.quiz.questions[this.currentQuestionIndex];
  }

  get progressPercentage() {
    return ((this.currentQuestionIndex + 1) / this.data.quiz.questions.length) * 100;
  }

  get timeWarning() {
    return this.timeRemaining <= 60; // Warning in last minute
  }

  ngOnInit(): void {
    // Initialize answers array with -1 (no selection)
    this.selectedAnswers = new Array(this.data.quiz.questions.length).fill(-1);
    
    if (this.data.quiz.timeLimit > 0) {
      this.timeRemaining = this.data.quiz.timeLimit * 60; // Convert to seconds
    }
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  startQuiz(): void {
    this.quizStarted = true;
    this.startTime = Date.now();
    
    // Start timer
    this.timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      this.timeElapsed = elapsed;
      
      if (this.data.quiz.timeLimit > 0) {
        this.timeRemaining = (this.data.quiz.timeLimit * 60) - elapsed;
        
        if (this.timeRemaining <= 0) {
          this.timeRemaining = 0;
          this.autoSubmit();
        }
      }
    }, 1000);
  }

  selectAnswer(optionIndex: number): void {
    this.selectedAnswers[this.currentQuestionIndex] = optionIndex;
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.data.quiz.questions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  goToQuestion(index: number): void {
    this.currentQuestionIndex = index;
  }

  allQuestionsAnswered(): boolean {
    return this.selectedAnswers.every(answer => answer !== -1);
  }

  submitQuiz(): void {
    if (!this.allQuestionsAnswered()) {
      return;
    }

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    const result = {
      answers: this.selectedAnswers,
      timeSpent: Math.floor((Date.now() - this.startTime) / 1000),
    };

    this.dialogRef.close(result);
  }

  autoSubmit(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    // Fill unanswered questions with -1
    const result = {
      answers: this.selectedAnswers,
      timeSpent: this.data.quiz.timeLimit * 60,
    };

    this.dialogRef.close(result);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}