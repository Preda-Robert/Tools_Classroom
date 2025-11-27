import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ClassService } from '../../../core/services/class.service';

@Component({
  selector: 'app-join-class-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  template: `
    <h2 mat-dialog-title>Join a Class</h2>
    <mat-dialog-content>
      <form [formGroup]="joinForm">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Join Code</mat-label>
          <input matInput formControlName="joinCode" placeholder="Enter 6-character code" />
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="accent" (click)="onJoin()" [disabled]="!joinForm.valid">
        Join
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .full-width {
        width: 100%;
        margin-bottom: 16px;
      }
    `,
  ],
})
export class JoinClassDialogComponent {
  joinForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private classService: ClassService,
    private dialogRef: MatDialogRef<JoinClassDialogComponent>,
    private snackBar: MatSnackBar
  ) {
    this.joinForm = this.fb.group({
      joinCode: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onJoin(): void {
    if (this.joinForm.valid) {
      this.classService.joinClass(this.joinForm.value.joinCode).subscribe({
        next: () => {
          this.snackBar.open('Successfully joined class!', 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.snackBar.open('Invalid join code or already enrolled', 'Close', { duration: 3000 });
        },
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
