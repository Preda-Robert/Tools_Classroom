export interface Announcement {
  id: number;
  classId: number;
  title: string;
  content: string;
  createdBy: number;
  createdAt: Date;
  creatorName?: string;
}

export interface CreateAnnouncementRequest {
  title: string;
  content: string;
}