'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { ScoreDetail, ScoreDetailModalProps} from '@/types/team';

export default function ScoreDetailModal({
  submissionId,
  isOpen,
  onClose,
}: ScoreDetailModalProps) {
  const [scores, setScores] = useState<ScoreDetail[]>([]);
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && submissionId) {
      loadData();
    }
  }, [isOpen, submissionId]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Ambil detail submission
      const subRes = await api.get(`/submissions/${submissionId}`);
      setSubmission(subRes.data);

      // Ambil skor untuk submission ini
      const scoreRes = await api.get(`/scores/submission/${submissionId}`);
      setScores(scoreRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memuat data penilaian');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Hitung rata-rata per kriteria
  const calculateCriteriaAverages = () => {
    const criteriaMap: Record<number, { name: string; max: number; weight: number; values: number[] }> = {};
    
    scores.forEach((score) => {
      score.score_details.forEach((detail) => {
        const { rubric_criteria_id, rubric_criteria } = detail;
        if (!criteriaMap[rubric_criteria_id]) {
          criteriaMap[rubric_criteria_id] = {
            name: rubric_criteria.criterion_name,
            max: rubric_criteria.max_score,
            weight: rubric_criteria.weight,
            values: [],
          };
        }
        criteriaMap[rubric_criteria_id].values.push(detail.score_value);
      });
    });

    return Object.values(criteriaMap).map((c) => ({
      name: c.name,
      max: c.max,
      weight: c.weight,
      average: c.values.length > 0
        ? (c.values.reduce((a, b) => a + b, 0) / c.values.length)
        : 0,
      count: c.values.length,
    }));
  };

  const criteriaAverages = calculateCriteriaAverages();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                {loading ? 'Memuat...' : `Detail Penilaian`}
              </h3>
              {submission && (
                <p className="text-sm text-gray-500">
                  Submission #{submission.id} · {submission.stage?.name || 'Stage tidak diketahui'}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto p-6 max-h-[calc(90vh-140px)]">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-600">{error}</div>
            ) : scores.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-4xl block mb-3">📝</span>
                <p className="text-gray-600">Belum ada penilaian untuk submission ini</p>
                <p className="text-sm text-gray-400 mt-1">Tunggu juri memberikan penilaian</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Informasi Submission */}
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Project Type</p>
                    <p className="font-medium">{submission?.project_type || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Status</p>
                    <p className="font-medium">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          submission?.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : submission?.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {submission?.status || 'draft'}
                      </span>
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 uppercase">Deskripsi</p>
                    <p className="text-sm">{submission?.description || '-'}</p>
                  </div>
                </div>

                {/* Rata-rata per Kriteria */}
                {criteriaAverages.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <span>📊</span> Rata-rata Nilai per Kriteria
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Kriteria</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Max Score</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Weight</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rata-rata</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Jumlah Penilai</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {criteriaAverages.map((c, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-4 py-2 text-sm font-medium text-gray-800">{c.name}</td>
                              <td className="px-4 py-2 text-sm text-gray-600">{c.max}</td>
                              <td className="px-4 py-2 text-sm text-gray-600">{c.weight}</td>
                              <td className="px-4 py-2 text-sm font-semibold">
                                <span className={c.average >= c.max * 0.7 ? 'text-green-600' : 'text-orange-600'}>
                                  {c.average.toFixed(2)}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-600">{c.count}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Detail Penilaian per Juri */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <span>👨‍⚖️</span> Penilaian per Juri
                  </h4>
                  <div className="space-y-4">
                    {scores.map((score) => (
                      <div key={score.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium text-gray-800">{score.juri?.name || 'Juri'}</p>
                            <p className="text-sm text-gray-500">{score.juri?.email || '-'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600">{score.total_score}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(score.created_at).toLocaleString('id-ID')}
                            </p>
                          </div>
                        </div>
                        {score.feedback && (
                          <div className="bg-gray-50 p-3 rounded-md mt-2">
                            <p className="text-xs text-gray-500 uppercase">Feedback</p>
                            <p className="text-sm text-gray-700">{score.feedback}</p>
                          </div>
                        )}
                        {score.score_details.length > 0 && (
                          <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
                            {score.score_details.map((detail) => (
                              <div key={detail.id} className="bg-gray-50 p-2 rounded-md">
                                <p className="text-xs text-gray-500 truncate">
                                  {detail.rubric_criteria.criterion_name}
                                </p>
                                <p className="font-medium text-gray-800">
                                  {detail.score_value} / {detail.rubric_criteria.max_score}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}