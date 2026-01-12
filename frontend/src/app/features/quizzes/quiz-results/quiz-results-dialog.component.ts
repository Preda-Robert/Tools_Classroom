import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { Quiz } from '../../../core/models/quiz.model';
import { QuizSubmission } from '../../../core/services/quiz.service';

interface DialogData {
  quiz: Quiz;
  submission: QuizSubmission;
}

@Component({
  selector: 'app-quiz-results-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatChipsModule,
  ],
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>
        <mat-icon>assessment</mat-icon>
        Quiz Results
      </h2>
      <button mat-icon-button mat-dialog-close>
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content>
      <div class="quiz-title">
        <h3>{{ data.quiz.title }}</h3>
        <p>{{ data.quiz.description }}</p>
      </div>

      <mat-divider></mat-divider>

      <!-- Score Card -->
      <mat-card class="score-card">
        <mat-card-content>
          <div class="score-display">
            <div class="score-circle" [class.excellent]="scorePercentage >= 90" [class.good]="scorePercentage >= 70 && scorePercentage < 90" [class.average]="scorePercentage >= 50 && scorePercentage < 70" [class.poor]="scorePercentage < 50">
              <div class="score-value">{{ data.submission.score }}</div>
              <div class="score-total">/ {{ data.quiz.maxPoints }}</div>
            </div>
            <div class="score-info">
              <h2>{{ scorePercentage }}%</h2>
              <p class="score-label">{{ getScoreLabel() }}</p>
              <div class="stats">
                <div class="stat">
                  <mat-icon>check_circle</mat-icon>
                  <span>{{ correctAnswers }} Correct</span>
                </div>
                <div class="stat">
                  <mat-icon>cancel</mat-icon>
                  <span>{{ incorrectAnswers }} Incorrect</span>
                </div>
                <div class="stat">
                  <mat-icon>schedule</mat-icon>
                  <span>{{ formatTime(data.submission.timeSpent) }}</span>
                </div>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-divider></mat-divider>

      <!-- Question Review -->
      <div class="questions-review">
        <h3>Question Review</h3>
        <div *ngFor="let question of data.quiz.questions; let i = index" class="question-item">
          <mat-card [class.correct]="isCorrect(i)" [class.incorrect]="!isCorrect(i)">
            <mat-card-content>
              <div class="question-header">
                <div class="question-number">
                  <mat-icon *ngIf="isCorrect(i)" class="correct-icon">check_circle</mat-icon>
                  <mat-icon *ngIf="!isCorrect(i)" class="incorrect-icon">cancel</mat-icon>
                  <span>Question {{ i + 1 }}</span>
                </div>
                <mat-chip class="points-chip">{{ question.points }} pts</mat-chip>
              </div>

              <p class="question-text">{{ question.questionText }}</p>

              <div class="answers">
                <div
                  *ngFor="let option of question.options; let j = index"
                  class="answer-option"
                  [class.your-answer]="isYourAnswer(i, j)"
                  [class.correct-answer]="isCorrectAnswer(i, j)"
                  [class.wrong]="isYourAnswer(i, j) && !isCorrectAnswer(i, j)"
                >
                  <mat-icon *ngIf="isCorrectAnswer(i, j)">check_circle</mat-icon>
                  <mat-icon *ngIf="isYourAnswer(i, j) && !isCorrectAnswer(i, j)">cancel</mat-icon>
                  <mat-icon *ngIf="!isYourAnswer(i, j) && !isCorrectAnswer(i, j)">radio_button_unchecked</mat-icon>
                  <span>{{ option }}</span>
                  <span *ngIf="isYourAnswer(i, j)" class="label">Your Answer</span>
                  <span *ngIf="isCorrectAnswer(i, j)" class="label">Correct Answer</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
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
        min-width: 600px;
        max-width: 800px;
        padding: 24px;
        max-height: 70vh;
      }

      .quiz-title h3 {
        margin: 0 0 8px 0;
        color: #333;
      }

      .quiz-title p {
        margin: 0;
        color: #666;
      }

      mat-divider {
        margin: 20px 0;
      }

      .score-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        margin-bottom: 24px;
      }

      .score-display {
        display: flex;
        align-items: center;
        gap: 32px;
      }

      .score-circle {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border: 4px solid rgba(255, 255, 255, 0.3);
      }

      .score-circle.excellent {
        border-color: #4caf50;
      }

      .score-circle.good {
        border-color: #8bc34a;
      }

      .score-circle.average {
        border-color: #ff9800;
      }

      .score-circle.poor {
        border-color: #f44336;
      }

      .score-value {
        font-size: 2.5em;
        font-weight: 600;
      }

      .score-total {
        font-size: 1.2em;
        opacity: 0.9;
      }

      .score-info {
        flex: 1;
      }

      .score-info h2 {
        margin: 0 0 8px 0;
        font-size: 3em;
        font-weight: 600;
      }

      .score-label {
        font-size: 1.2em;
        margin: 0 0 16px 0;
        opacity: 0.9;
      }

      .stats {
        display: flex;
        gap: 24px;
      }

      .stat {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .stat mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      .questions-review h3 {
        color: #667eea;
        margin-bottom: 16px;
      }

      .question-item {
        margin-bottom: 16px;
      }

      .question-item mat-card {
        border-left: 4px solid #e0e0e0;
      }

      .question-item mat-card.correct {
        border-left-color: #4caf50;
      }

      .question-item mat-card.incorrect {
        border-left-color: #f44336;
      }

      .question-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }

      .question-number {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;
      }

      .correct-icon {
        color: #4caf50;
      }

      .incorrect-icon {
        color: #f44336;
      }

      .points-chip {
        background: #667eea !important;
        color: white !important;
      }

      .question-text {
        margin: 0 0 16px 0;
        font-size: 1.1em;
        line-height: 1.5;
      }

      .answers {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .answer-option {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border-radius: 8px;
        background: #f8f9fa;
      }

      .answer-option mat-icon {
        color: #999;
      }

      .answer-option.correct-answer {
        background: #e8f5e9;
        border: 2px solid #4caf50;
      }

      .answer-option.correct-answer mat-icon {
        color: #4caf50;
      }

      .answer-option.wrong {
        background: #ffebee;
        border: 2px solid #f44336;
      }

      .answer-option.wrong mat-icon {
        color: #f44336;
      }

      .answer-option span:first-of-type {
        flex: 1;
      }

      .label {
        font-size: 0.85em;
        font-weight: 500;
        padding: 2px 8px;
        border-radius: 4px;
        background: rgba(0, 0, 0, 0.1);
      }

      mat-dialog-actions {
        padding: 16px 24px;
        border-top: 1px solid #e0e0e0;
      }

      @media (max-width: 700px) {
        mat-dialog-content {
          min-width: auto;
        }

        .score-display {
          flex-direction: column;
          text-align: center;
        }

        .stats {
          flex-direction: column;
          gap: 12px;
        }
      }
    `,
  ],
})
export class QuizResultsDialogComponent {
  data: DialogData = inject(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<QuizResultsDialogComponent>);

  submittedAnswers: number[] = [];

  constructor() {
    this.submittedAnswers = JSON.parse(this.data.submission.answersJson);
  }

  get scorePercentage(): number {
    return Math.round((this.data.submission.score / this.data.quiz.maxPoints) * 100);
  }

  get correctAnswers(): number {
    return this.data.quiz.questions.filter((q, i) => 
      this.submittedAnswers[i] === q.correctAnswerIndex
    ).length;
  }

  get incorrectAnswers(): number {
    return this.data.quiz.questions.length - this.correctAnswers;
  }

  getScoreLabel(): string {
    const percentage = this.scorePercentage;
    if (percentage >= 90) return 'Excellent!';
    if (percentage >= 70) return 'Good Job!';
    if (percentage >= 50) return 'Average';
    return 'Needs Improvement';
  }

  isCorrect(questionIndex: number): boolean {
    return this.submittedAnswers[questionIndex] === this.data.quiz.questions[questionIndex].correctAnswerIndex;
  }

  isYourAnswer(questionIndex: number, optionIndex: number): boolean {
    return this.submittedAnswers[questionIndex] === optionIndex;
  }

  isCorrectAnswer(questionIndex: number, optionIndex: number): boolean {
    return this.data.quiz.questions[questionIndex].correctAnswerIndex === optionIndex;
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }
}