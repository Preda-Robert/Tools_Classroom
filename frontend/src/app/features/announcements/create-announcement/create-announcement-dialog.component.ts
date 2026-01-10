import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-create-announcement-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>
        <mat-icon>campaign</mat-icon>
        Create Announcement
      </h2>
      <button mat-icon-button mat-dialog-close>
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content>
      <form [formGroup]="announcementForm">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Title</mat-label>
          <input matInput formControlName="title" placeholder="e.g., Important Update" />
          <mat-error *ngIf="announcementForm.get('title')?.hasError('required')">
            Title is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Message</mat-label>
          <textarea
            matInput
            formControlName="content"
            rows="6"
            placeholder="Write your announcement here..."
          ></textarea>
          <mat-hint>This will be visible to all students in the class</mat-hint>
          <mat-error *ngIf="announcementForm.get('content')?.hasError('required')">
            Message is required
          </mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button
        mat-raised-button
        color="primary"
        (click)="onPost()"
        [disabled]="!announcementForm.valid"
      >
        <mat-icon>send</mat-icon>
        Post Announcement
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
        min-width: 500px;
        padding: 24px;
      }

      .full-width {
        width: 100%;
        margin-bottom: 16px;
      }

      @media (max-width: 600px) {
        mat-dialog-content {
          min-width: auto;
        }
      }
    `,
  ],
})
export class CreateAnnouncementDialogComponent {
  announcementForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateAnnouncementDialogComponent>
  ) {
    this.announcementForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
    });
  }

  onPost(): void {
    if (this.announcementForm.valid) {
      this.dialogRef.close(this.announcementForm.value);
    }
  }
}