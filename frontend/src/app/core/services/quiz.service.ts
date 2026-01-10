import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Quiz, CreateQuizRequest } from '../models/quiz.model';

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
}