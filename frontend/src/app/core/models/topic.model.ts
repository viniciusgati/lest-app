export interface Topic {
  id: number;
  subject_id: number;
  name: string;
  notes: string | null;
  ease_factor: number;
  interval: number;
  next_review: string;
  created_at: string;
}

export interface TopicWithStats extends Topic {
  accuracy_percentage: number | null;
}
