import { Event } from './event';

export interface Stage {
  id: number;
  event_id: number;
  name: string;
  stage_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  event?: Event;
}

export interface CreateStagePayload {
  event_id: number;
  name: string;
  stage_order: number;
  is_active?: boolean;
}

export interface UpdateStagePayload extends Partial<CreateStagePayload> {}