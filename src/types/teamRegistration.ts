export interface MemberFormData {
  name: string;
  email: string;
  phone?: string;
  nim: string;
  faculty: string;
  study_program: string;
  position: 'ketua' | 'anggota1' | 'anggota2';
}

export interface TeamRegistrationFormData {
  // Step 1
  team_name: string;
  institution: string;
  city: string;
  // Step 2
  members: MemberFormData[];
  // Step 3 (file & link)
  hak_cipta: File | null;
  komitmen: File | null;
  rekomendasi: File | null;
  video_link: string;
  summary_brief: File | null;
  ktm_ketua: File | null;
  ktm_anggota1: File | null;
  ktm_anggota2: File | null;
  // Step 4
  agree_privacy: boolean;
  agree_truth: boolean;
}