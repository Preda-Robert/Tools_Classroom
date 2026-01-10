import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Announcement, CreateAnnouncementRequest } from '../models/announcement.model';

@Injectable({
  providedIn: 'root',
})
export class AnnouncementService {
  constructor(private http: HttpClient) {}

  getClassAnnouncements(classId: number): Observable<Announcement[]> {
    return this.http.get<Announcement[]>(`${environment.apiUrl}/classes/${classId}/announcements`);
  }

  createAnnouncement(classId: number, data: CreateAnnouncementRequest): Observable<Announcement> {
    return this.http.post<Announcement>(`${environment.apiUrl}/classes/${classId}/announcements`, data);
  }

  deleteAnnouncement(classId: number, announcementId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/classes/${classId}/announcements/${announcementId}`);
  }
}