import { Event } from './event';

export interface Schedule {
  id: number;
  event_id: number;
  date_time: string; // ISO datetime
  description: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
  event?: Event;
}

export interface CreateSchedulePayload {
  event_id: number;
  date_time: string;
  description?: string;
  location?: string;
}

export interface UpdateSchedulePayload extends Partial<CreateSchedulePayload> {}