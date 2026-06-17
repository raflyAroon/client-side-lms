'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { adminService } from '@/services/adminService';

export default function AdminTeamSubmissionsPage() {
  const { id } = useParams();
  const [team, setTeam] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewNote, setReviewNote] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const res = await adminService.teamSubmissions(Number(id));
      setTeam(res.data.team);
      setSubmissions(res.data.submissions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (submissionId: number, action: 'approved' | 'rejected') => {
    try {
      await adminService.reviewSubmission(submissionId, action, reviewNote);
      alert(`Submission ${action === 'approved' ? 'disetujui' : 'ditolak'}`);
      loadData();
      setReviewNote('');
      setSelectedSubmission(null);
    } catch (err) {
      alert('Gagal review');
    }
  };

  if (loading) return <div className="p-6">Memuat...</div>;
  if (!team) return <div className="p-6">Tim tidak ditemukan</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Submission Tim: {team.team_name}</h1>
      <p className="text-gray-600 mb-4">Status Tim: {team.selection_status}</p>
      {submissions.length === 0 ? (
        <p>Belum ada submission.</p>
      ) : (
        submissions.map((sub: any) => (
          <div key={sub.id} className="border rounded-lg p-4 mb-4">
            <h2 className="font-bold text-lg">{sub.stage.name}</h2>
            <p>Jenis Proyek: {sub.project_type}</p>
            <p>Status: {sub.status}</p>
            <p>Submitted at: {sub.submitted_at ? new Date(sub.submitted_at).toLocaleString() : '-'}</p>
            <div className="mt-2">
              <strong>File yang diupload:</strong>
              {sub.files.map((f: any) => (
                <div key={f.id} className="ml-4">
                  {f.file_type === 'file' ? (
                    <a href={f.file_url} target="_blank" className="text-blue-600">📄 {f.file_name}</a>
                  ) : (
                    <a href={f.external_url} target="_blank" className="text-blue-600">🔗 Link</a>
                  )}
                  <span className="text-sm text-gray-500 ml-2">[{f.submission_category}]</span>
                </div>
              ))}
            </div>
            {sub.status === 'submitted' && (
              <div className="mt-4">
                {selectedSubmission === sub.id ? (
                  <div>
                    <textarea
                      placeholder="Catatan review (opsional)"
                      value={reviewNote}
                      onChange={(e) => setReviewNote(e.target.value)}
                      className="border rounded p-2 w-full mb-2"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button onClick={() => handleReview(sub.id, 'approved')} className="bg-green-600 text-white px-4 py-1 rounded">Setujui</button>
                      <button onClick={() => handleReview(sub.id, 'rejected')} className="bg-red-600 text-white px-4 py-1 rounded">Tolak</button>
                      <button onClick={() => setSelectedSubmission(null)} className="bg-gray-300 px-4 py-1 rounded">Batal</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setSelectedSubmission(sub.id)} className="bg-blue-600 text-white px-4 py-1 rounded">Review</button>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}