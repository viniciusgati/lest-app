export type WeekDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export type ScheduleStrategy = 'sm2' | 'weak_points' | 'balanced';

export interface UserConfig {
  id?: number;
  available_days: WeekDay[];
  schedule_strategy: ScheduleStrategy;
}
