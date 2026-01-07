import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Assignment, CreateAssignmentRequest } from '../models/assignment.model';

@Injectable({
  providedIn: 'root',
})
export class AssignmentService {
  constructor(private http: HttpClient) {}

  getClassAssignments(classId: number): Observable<Assignment[]> {
    return this.http.get<Assignment[]>(`${environment.apiUrl}/classes/${classId}/assignments`);
  }

  getAssignment(classId: number, assignmentId: number): Observable<Assignment> {
    return this.http.get<Assignment>(
      `${environment.apiUrl}/classes/${classId}/assignments/${assignmentId}`
    );
  }

  createAssignment(classId: number, data: CreateAssignmentRequest): Observable<Assignment> {
    return this.http.post<Assignment>(
      `${environment.apiUrl}/classes/${classId}/assignments`,
      data
    );
  }

  deleteAssignment(classId: number, assignmentId: number): Observable<void> {
    return this.http.delete<void>(
      `${environment.apiUrl}/classes/${classId}/assignments/${assignmentId}`
    );
  }
}