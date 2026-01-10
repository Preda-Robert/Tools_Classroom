export interface QuizQuestion {
  id?: number;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  points: number;
}

export interface Quiz {
  id: number;
  classId: number;
  title: string;
  description: string;
  dueDate: Date;
  timeLimit: number;
  maxPoints: number;
  questions: QuizQuestion[];
  createdAt: Date;
}

export interface CreateQuizRequest {
  title: string;
  description: string;
  dueDate: Date;
  timeLimit: number;
  questions: QuizQuestion[];
}