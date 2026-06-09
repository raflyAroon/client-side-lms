// types/team.ts
export interface TeamMember {
  id?: number;
  team_id?: number;
  name: string;
  email: string;
  phone?: string | null;
  nim: string;
  faculty: string;
  study_program: string;
  position: 'ketua' | 'anggota1' | 'anggota2';
}

export interface Team {
  id: number;
  team_name: string;
  institution: string | null;
  city: string | null;
  ketua_id: number;
  selection_status: 'pending' | 'approved' | 'rejected';
  selection_note?: string | null;
  selection_processed_at?: string | null;
  created_at: string;
  updated_at: string;
  members: TeamMember[];
  documents?: TeamDocument[];
}

export interface CreateTeamPayload {
  team_name: string;
  institution?: string | null;
  members: Omit<TeamMember, 'id' | 'team_id'>[];
}

export interface UpdateTeamPayload {
  team_name?: string;
  institution?: string | null;
  members?: (Partial<TeamMember> & { id?: number })[];
}

export interface TeamDocument {
  id: number;
  team_id: number;
  type: string;
  file_name: string;
  file_url?: string;
  external_link?: string;
  is_verified: boolean;
}