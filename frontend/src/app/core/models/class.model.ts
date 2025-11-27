export interface Class {
  id: number;
  name: string;
  description: string;
  joinCode: string;
  teacherName: string;
  studentCount: number;
  createdAt: Date;
}

export interface CreateClassRequest {
  name: string;
  description: string;
}
