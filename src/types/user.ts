export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'juri' | 'peserta';
  created_at: string;
  updated_at: string;
}