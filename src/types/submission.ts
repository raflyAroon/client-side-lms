// types/submission.ts
export type ProjectType = 'website_application' | 'game_development' | 'video_design';
export type SubmissionStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';

export interface SubmissionFile {
  id: number;
  submission_id: number;
  file_url: string;
  file_name: string;
  file_size: number | null;
  file_type: 'file' | 'link';
  external_url?: string | null;
  mime_type?: string | null;
  file_path?: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: number;
  team_id: number;
  stage_id: number;
  project_type: ProjectType;
  description: string | null;
  status: SubmissionStatus;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
  files?: SubmissionFile[];
  stage?: {
    id: number;
    name: string;
    stage_order: number;
  };
}

export interface CreateSubmissionPayload {
  stage_id: number;
  project_type: ProjectType;
  description?: string;
}

export interface UpdateSubmissionPayload {
  description?: string;
  project_type?: ProjectType;
}