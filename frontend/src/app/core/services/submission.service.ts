import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Submission, CreateSubmissionRequest, GradeSubmissionRequest } from '../models/submission.model';

@Injectable({
  providedIn: 'root',
})
export class SubmissionService {
  constructor(private http: HttpClient) {}

  getMySubmission(assignmentId: number): Observable<Submission> {
    return this.http.get<Submission>(
      `${environment.apiUrl}/assignments/${assignmentId}/submissions/my-submission`
    );
  }

  getAssignmentSubmissions(assignmentId: number): Observable<Submission[]> {
    return this.http.get<Submission[]>(
      `${environment.apiUrl}/assignments/${assignmentId}/submissions`
    );
  }

  submitAssignment(assignmentId: number, data: CreateSubmissionRequest): Observable<Submission> {
    return this.http.post<Submission>(
      `${environment.apiUrl}/assignments/${assignmentId}/submissions`,
      data
    );
  }

  gradeSubmission(
    assignmentId: number,
    submissionId: number,
    data: GradeSubmissionRequest
  ): Observable<Submission> {
    return this.http.put<Submission>(
      `${environment.apiUrl}/assignments/${assignmentId}/submissions/${submissionId}/grade`,
      data
    );
  }
}