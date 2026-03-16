export interface WeeklyGoal {
  id?: number;
  week_start: string;
  target_hours: number;
  target_questions: number;
  target_percentage: number;
}

export interface WeeklyGoalWithProgress extends WeeklyGoal {
  actual_hours: number;
  actual_questions: number;
  actual_percentage: number;
}
