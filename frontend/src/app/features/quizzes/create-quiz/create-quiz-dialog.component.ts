// frontend/src/app/features/quizzes/create-quiz/create-quiz-dialog.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-create-quiz-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatExpansionModule,
    MatRadioModule,
    MatDividerModule,
  ],
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>
        <mat-icon>quiz</mat-icon>
        Create Quiz
      </h2>
      <button mat-icon-button mat-dialog-close>
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content>
      <form [formGroup]="quizForm">
        <div class="quiz-info">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Quiz Title</mat-label>
            <input matInput formControlName="title" placeholder="e.g., Chapter 5 Quiz" />
            <mat-error *ngIf="quizForm.get('title')?.hasError('required')">
              Title is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description</mat-label>
            <textarea
              matInput
              formControlName="description"
              rows="2"
              placeholder="Brief description of the quiz"
            ></textarea>
          </mat-form-field>

          <div class="form-row">
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Due Date</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="dueDate" />
              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Time Limit (minutes)</mat-label>
              <input matInput type="number" formControlName="timeLimit" />
              <mat-hint>0 for unlimited</mat-hint>
            </mat-form-field>
          </div>
        </div>

        <mat-divider></mat-divider>

        <div class="questions-section">
          <div class="section-header">
            <h3>Questions</h3>
            <button mat-raised-button color="accent" type="button" (click)="addQuestion()">
              <mat-icon>add</mat-icon>
              Add Question
            </button>
          </div>

          <mat-accordion formArrayName="questions">
            <mat-expansion-panel
              *ngFor="let question of questions.controls; let i = index"
              [formGroupName]="i"
            >
              <mat-expansion-panel-header>
                <mat-panel-title>
                  <mat-icon>help_outline</mat-icon>
                  Question {{ i + 1 }}
                  <span class="points-badge">{{ question.get('points')?.value || 0 }} pts</span>
                </mat-panel-title>
              </mat-expansion-panel-header>

              <div class="question-content">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Question Text</mat-label>
                  <textarea
                    matInput
                    formControlName="questionText"
                    rows="2"
                    placeholder="Enter your question"
                  ></textarea>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Points</mat-label>
                  <input matInput type="number" formControlName="points" />
                </mat-form-field>

                <div class="options-section" formArrayName="options">
                  <label>Answer Options:</label>
                  <div
                    *ngFor="let option of getOptions(i).controls; let j = index"
                    class="option-item"
                  >
                    <mat-radio-button
                      [value]="j"
                      [checked]="question.get('correctAnswerIndex')?.value === j"
                      (change)="setCorrectAnswer(i, j)"
                    ></mat-radio-button>
                    <mat-form-field appearance="outline" class="option-field">
                      <mat-label>Option {{ j + 1 }}</mat-label>
                      <input matInput [formControlName]="j" />
                    </mat-form-field>
                    <button
                      mat-icon-button
                      color="warn"
                      type="button"
                      (click)="removeOption(i, j)"
                      *ngIf="getOptions(i).length > 2"
                    >
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                  <button
                    mat-stroked-button
                    type="button"
                    (click)="addOption(i)"
                    *ngIf="getOptions(i).length < 6"
                  >
                    <mat-icon>add</mat-icon>
                    Add Option
                  </button>
                </div>

                <button
                  mat-button
                  color="warn"
                  type="button"
                  (click)="removeQuestion(i)"
                  class="remove-question"
                >
                  <mat-icon>delete</mat-icon>
                  Remove Question
                </button>
              </div>
            </mat-expansion-panel>
          </mat-accordion>

          <div *ngIf="questions.length === 0" class="empty-questions">
            <mat-icon>quiz</mat-icon>
            <p>No questions yet. Click "Add Question" to start building your quiz.</p>
          </div>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <div class="total-points">Total Points: {{ getTotalPoints() }}</div>
      <button mat-button mat-dialog-close>Cancel</button>
      <button
        mat-raised-button
        color="primary"
        (click)="onCreate()"
        [disabled]="!quizForm.valid || questions.length === 0"
      >
        <mat-icon>check</mat-icon>
        Create Quiz
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
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 0;
      }

      mat-dialog-content {
        min-width: 700px;
        max-width: 800px;
        padding: 24px;
        max-height: 70vh;
      }

      .full-width {
        width: 100%;
        margin-bottom: 16px;
      }

      .form-row {
        display: flex;
        gap: 16px;
      }

      .half-width {
        flex: 1;
        margin-bottom: 16px;
      }

      mat-divider {
        margin: 24px 0;
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }

      .section-header h3 {
        margin: 0;
        color: #667eea;
      }

      .questions-section {
        margin-top: 24px;
      }

      mat-expansion-panel {
        margin-bottom: 12px;
      }

      mat-panel-title {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .points-badge {
        margin-left: auto;
        background: #667eea;
        color: white;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 0.85em;
      }

      .question-content {
        padding: 16px 0;
      }

      .options-section {
        margin: 16px 0;
      }

      .options-section label {
        display: block;
        font-weight: 500;
        margin-bottom: 12px;
        color: #666;
      }

      .option-item {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
      }

      .option-field {
        flex: 1;
        margin-bottom: 0;
      }

      .remove-question {
        margin-top: 16px;
      }

      .empty-questions {
        text-align: center;
        padding: 40px;
        color: #999;
      }

      .empty-questions mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #ddd;
      }

      mat-dialog-actions {
        padding: 16px 24px;
        border-top: 1px solid #e0e0e0;
      }

      .total-points {
        margin-right: auto;
        font-weight: 500;
        color: #667eea;
      }

      @media (max-width: 800px) {
        mat-dialog-content {
          min-width: auto;
        }

        .form-row {
          flex-direction: column;
        }
      }
    `,
  ],
})
export class CreateQuizDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CreateQuizDialogComponent>);
  
  quizForm: FormGroup;

  constructor() {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    this.quizForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      dueDate: [nextWeek, Validators.required],
      timeLimit: [30, [Validators.required, Validators.min(0)]],
      questions: this.fb.array([]),
    });
  }

  get questions(): FormArray {
    return this.quizForm.get('questions') as FormArray;
  }

  getOptions(questionIndex: number): FormArray {
    return this.questions.at(questionIndex).get('options') as FormArray;
  }

  addQuestion(): void {
    const question = this.fb.group({
      questionText: ['', Validators.required],
      options: this.fb.array([
        this.fb.control('', Validators.required),
        this.fb.control('', Validators.required),
      ]),
      correctAnswerIndex: [0, Validators.required],
      points: [10, [Validators.required, Validators.min(1)]],
    });

    this.questions.push(question);
  }

  removeQuestion(index: number): void {
    this.questions.removeAt(index);
  }

  addOption(questionIndex: number): void {
    const options = this.getOptions(questionIndex);
    if (options.length < 6) {
      options.push(this.fb.control('', Validators.required));
    }
  }

  removeOption(questionIndex: number, optionIndex: number): void {
    const options = this.getOptions(questionIndex);
    if (options.length > 2) {
      options.removeAt(optionIndex);
      
      // Adjust correct answer index if needed
      const question = this.questions.at(questionIndex);
      const correctIndex = question.get('correctAnswerIndex')?.value;
      if (correctIndex >= optionIndex) {
        question.patchValue({ correctAnswerIndex: Math.max(0, correctIndex - 1) });
      }
    }
  }

  setCorrectAnswer(questionIndex: number, optionIndex: number): void {
    this.questions.at(questionIndex).patchValue({ correctAnswerIndex: optionIndex });
  }

  getTotalPoints(): number {
    return this.questions.controls.reduce(
      (sum, question) => sum + (question.get('points')?.value || 0),
      0
    );
  }

  onCreate(): void {
    if (this.quizForm.valid && this.questions.length > 0) {
      const formValue = this.quizForm.value;
      this.dialogRef.close(formValue);
    }
  }
}