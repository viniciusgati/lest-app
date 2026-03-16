export interface StudySession {
  id: number;
  topic_id: number;
  scheduled_date: string;
  start_time?: string | null;
  expected_minutes: number;
  actual_minutes: number | null;
  questions_done: number;
  questions_correct: number;
  status: 'scheduled' | 'completed' | 'late';
  auto_generated: boolean;
  created_at: string;
}

export interface StudySessionResult {
  actual_minutes: number;
  questions_done: number;
  questions_correct: number;
}
