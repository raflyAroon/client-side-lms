import { User } from './user';

export interface AuditLog {
  id: number;
  user_id: number | null;
  action: string;
  entity_type: string;
  entity_id: number;
  old_value_json: Record<string, any> | null;
  new_value_json: Record<string, any> | null;
  ip_address: string | null;
  created_at: string;
  updated_at: string;
  user?: Pick<User, 'id' | 'name' | 'email'>;
}