export interface DashboardSummary {
  total_users: number;
  total_teams: number;
  total_submissions: number;
  total_scores: number;
  teams_by_status: {
    pending: number;
    lolos_seleksi: number;
    follow_the_bootcamp: number;
    first_half_hackathon: number;
    semi_final: number;
    final: number;
    rejected: number;
  };
  latest_announcements: Array<{
    id: number;
    title: string;
    content: string;
    published_at: string;
    type: string;
  }>;
  latest_audit_logs: Array<{
    id: number;
    user_id: number | null;
    action: string;
    entity_type: string;
    entity_id: number;
    created_at: string;
    user: {
      id: number;
      name: string;
    } | null;
  }>;
  submissions_per_stage: Array<{
    stage_name: string;
    total: number;
  }>;
  average_score_overall: number;
}