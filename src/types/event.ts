import { Stage } from './stage';
export interface Event {
  id: number;
  name: string;
  description: string | null;
  start_date: string; // YYYY-MM-DD
  end_date: string;
  created_at: string;
  updated_at: string;
  stages?: Stage[]; // dari relasi
}

export interface CreateEventPayload {
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
}

export interface UpdateEventPayload extends Partial<CreateEventPayload> {}