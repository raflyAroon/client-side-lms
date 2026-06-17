'use client';

import { useEffect, useState } from 'react';
import { adminService } from '@/services/adminService';
import Link from 'next/link';

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadTeams();
  }, [statusFilter]);

  const loadTeams = async () => {
    const res = await adminService.listTeams(statusFilter);
    setTeams(res.data.data);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Daftar Tim</h1>
      <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border p-1 my-2">
        <option value="">Semua</option>
        <option value="pending">Pending</option>
        <option value="lolos_seleksi">Lolos Seleksi</option>
        <option value="follow_the_bootcamp">Bootcamp</option>
        <option value="first_half_hackathon">First Half</option>
        <option value="semi_final">Semi Final</option>
        <option value="final">Final</option>
        <option value="rejected">Rejected</option>
      </select>
      <table className="w-full border">
        <thead><tr><th>ID</th><th>Nama Tim</th><th>Ketua</th><th>Status</th><th>Aksi</th></tr></thead>
        <tbody>
          {teams.map((team: any) => (
            <tr key={team.id}>
              <td>{team.id}</td>
              <td>{team.team_name}</td>
              <td>{team.ketua?.name}</td>
              <td>{team.selection_status}</td>
              <td><Link href={`/admin/teams/${team.id}`} className="text-blue-600">Detail</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}