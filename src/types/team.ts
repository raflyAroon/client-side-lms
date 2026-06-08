// types/team.ts
export interface TeamMember {
  id?: number;
  team_id?: number;
  name: string;
  email: string;
  phone?: string | null;
  position: 'ketua' | 'anggota1' | 'anggota2';
}

export interface Team {
  id: number;
  team_name: string;
  institution: string | null;
  ketua_id: number;
  created_at: string;
  updated_at: string;
  members: TeamMember[];
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