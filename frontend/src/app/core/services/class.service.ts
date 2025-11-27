import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Class, CreateClassRequest } from '../models/class.model';

@Injectable({
  providedIn: 'root',
})
export class ClassService {
  constructor(private http: HttpClient) {}

  getMyClasses(): Observable<Class[]> {
    return this.http.get<Class[]>(`${environment.apiUrl}/classes`);
  }

  getClassById(id: number): Observable<Class> {
    return this.http.get<Class>(`${environment.apiUrl}/classes/${id}`);
  }

  createClass(data: CreateClassRequest): Observable<Class> {
    return this.http.post<Class>(`${environment.apiUrl}/classes`, data);
  }

  joinClass(joinCode: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/classes/join`, { joinCode });
  }

  deleteClass(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/classes/${id}`);
  }
}
