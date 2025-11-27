export interface Assignment {
  id: number;
  classId: number;
  title: string;
  description: string;
  dueDate: Date;
  maxPoints: number;
  createdAt: Date;
}
