export interface SubjectMetric {
  id: number;
  name: string;
  accuracy_percentage: number | null;
  sessions_count: number;
}

export interface WeeklyProgress {
  week_start: string;
  actual_hours: number;
  actual_questions: number;
  actual_percentage: number | null;
  target_hours: number;
  target_questions: number;
  target_percentage: number;
}

export interface WeekData {
  week_start: string;
  accuracy: number;
  sessions_count: number;
}

export interface SubjectHistory {
  id: number;
  name: string;
  weeks: WeekData[];
}

export interface MetricsHistory {
  subjects: SubjectHistory[];
}

export interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_study_date: string | null;
  studied_today: boolean;
}
