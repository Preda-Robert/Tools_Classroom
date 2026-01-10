export interface Submission {
  id: number;
  assignmentId: number;
  studentId: number;
  studentName: string;
  content: string;
  filePath?: string;
  submittedAt: Date;
  grade?: number;
  feedback?: string;
  isLate: boolean;
}

export interface CreateSubmissionRequest {
  content: string;
  fileName?: string;
  fileContent?: string; // Base64
}

export interface GradeSubmissionRequest {
  grade: number;
  feedback?: string;
}