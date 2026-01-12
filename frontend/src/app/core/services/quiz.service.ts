import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Quiz, CreateQuizRequest } from '../models/quiz.model';

export interface QuizSubmission {
  id: number;
  quizId: number;
  studentId: number;
  answersJson: string;
  score: number;
  submittedAt: Date;
  timeSpent: number;
  studentName?: string;
}

export interface SubmitQuizRequest {
  answers: number[]; // Array of selected answer indices
  timeSpent: number; // Time in seconds
}

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  constructor(private http: HttpClient) {}

  getClassQuizzes(classId: number): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(`${environment.apiUrl}/classes/${classId}/quizzes`);
  }

  getQuiz(classId: number, quizId: number): Observable<Quiz> {
    return this.http.get<Quiz>(`${environment.apiUrl}/classes/${classId}/quizzes/${quizId}`);
  }

  createQuiz(classId: number, data: CreateQuizRequest): Observable<Quiz> {
    return this.http.post<Quiz>(`${environment.apiUrl}/classes/${classId}/quizzes`, data);
  }

  deleteQuiz(classId: number, quizId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/classes/${classId}/quizzes/${quizId}`);
  }

  // Quiz Submission Methods
  submitQuiz(classId: number, quizId: number, data: SubmitQuizRequest): Observable<QuizSubmission> {
    return this.http.post<QuizSubmission>(
      `${environment.apiUrl}/classes/${classId}/quizzes/${quizId}/submit`,
      data
    );
  }

  getMyQuizSubmission(classId: number, quizId: number): Observable<QuizSubmission> {
    return this.http.get<QuizSubmission>(
      `${environment.apiUrl}/classes/${classId}/quizzes/${quizId}/my-submission`
    );
  }

  getQuizSubmissions(classId: number, quizId: number): Observable<QuizSubmission[]> {
    return this.http.get<QuizSubmission[]>(
      `${environment.apiUrl}/classes/${classId}/quizzes/${quizId}/submissions`
    );
  }
}