'use client';

import { useState, useEffect, useCallback } from 'react';
import { useEvent } from '@/hooks/useEvents';
import { useStage } from '@/hooks/useStage';
import { useSchedule } from '@/hooks/useSchedule';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/admin/navbar';

export default function ManageLandingPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  // ===== NAVBAR STATE =====
  const [scrolled, setScrolled] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (h > 0) setScrollPct(Math.min((window.scrollY / h) * 100, 100));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  // ===== STATE UMUM =====
  const [activeTab, setActiveTab] = useState<'faq' | 'events' | 'stages' | 'schedules' | 'announcements'>('faq');

  const tabs = [
    { id: 'faq', label: 'FAQ', icon: '❓' },
    { id: 'events', label: 'Events', icon: '📅' },
    { id: 'stages', label: 'Stages', icon: '📋' },
    { id: 'schedules', label: 'Schedules', icon: '🕐' },
    { id: 'announcements', label: 'Announcements', icon: '📢' },
  ];

  // ===== FAQ STATE =====
  const [faqs, setFaqs] = useState<any[]>([]);
  const [faqLoading, setFaqLoading] = useState(true);
  const [faqEditing, setFaqEditing] = useState<any | null>(null);
  const [faqForm, setFaqForm] = useState({ question: '', answer: '', display_order: 0 });
  const [faqSubmitting, setFaqSubmitting] = useState(false);
  const [faqError, setFaqError] = useState<string | null>(null);

  // ===== EVENT STATE =====
  const { events, loading: eventsLoading, create: createEvent, update: updateEvent, remove: removeEvent, fetchEvents } = useEvent();
  const [eventEditing, setEventEditing] = useState<any | null>(null);
  const [eventForm, setEventForm] = useState({ name: '', description: '', start_date: '', end_date: '' });
  const [eventSubmitting, setEventSubmitting] = useState(false);
  const [eventError, setEventError] = useState<string | null>(null);

  // ===== STAGE STATE =====
  const { stages, loading: stagesLoading, create: createStage, update: updateStage, remove: removeStage, fetchStages } = useStage();
  const [stageEditing, setStageEditing] = useState<any | null>(null);
  const [stageForm, setStageForm] = useState({ event_id: 0, name: '', stage_order: 1, is_active: false });
  const [stageSubmitting, setStageSubmitting] = useState(false);
  const [stageError, setStageError] = useState<string | null>(null);

  // ===== SCHEDULE STATE =====
  const { schedules, loading: schedulesLoading, create: createSchedule, update: updateSchedule, remove: removeSchedule, fetchSchedules } = useSchedule();
  const [scheduleEditing, setScheduleEditing] = useState<any | null>(null);
  const [scheduleForm, setScheduleForm] = useState({ event_id: 0, date_time: '', description: '', location: '' });
  const [scheduleSubmitting, setScheduleSubmitting] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  // ===== ANNOUNCEMENT STATE =====
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [annLoading, setAnnLoading] = useState(true);
  const [annEditing, setAnnEditing] = useState<any | null>(null);
  const [annForm, setAnnForm] = useState({
    title: '',
    content: '',
    type: 'global',
    target_team_id: '',
    target_stage_id: '',
    published_at: '',
  });
  const [annSubmitting, setAnnSubmitting] = useState(false);
  const [annError, setAnnError] = useState<string | null>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [stagesRef, setStagesRef] = useState<any[]>([]);

  // ===== LOAD FUNCTIONS =====
  const loadFaqs = useCallback(async () => {
    setFaqLoading(true);
    setFaqError(null);
    try {
      const res = await api.get('/faqs');
      setFaqs(res.data);
    } catch (err: any) {
      setFaqError(err.response?.data?.message || 'Gagal memuat FAQ');
    } finally {
      setFaqLoading(false);
    }
  }, []);

  const loadAnnouncements = useCallback(async () => {
    setAnnLoading(true);
    setAnnError(null);
    try {
      const res = await api.get('/announcements');
      setAnnouncements(res.data);
    } catch (err: any) {
      setAnnError(err.response?.data?.message || 'Gagal memuat pengumuman');
    } finally {
      setAnnLoading(false);
    }
  }, []);

  const loadTeamsAndStages = useCallback(async () => {
    try {
      const [teamsRes, stagesRes] = await Promise.all([
        api.get('/admin/teams?per_page=100'),
        api.get('/stages'),
      ]);
      setTeams(teamsRes.data.data || []);
      setStagesRef(stagesRes.data || []);
    } catch (err) {
      console.error('Gagal memuat data referensi', err);
    }
  }, []);

  useEffect(() => {
    loadFaqs();
    fetchEvents();
    fetchStages();
    fetchSchedules();
    loadAnnouncements();
    loadTeamsAndStages();
  }, [fetchEvents, fetchStages, fetchSchedules, loadFaqs, loadAnnouncements, loadTeamsAndStages]);

  // ===== FAQ HANDLERS =====
  const resetFaqForm = () => {
    setFaqForm({ question: '', answer: '', display_order: 0 });
    setFaqEditing(null);
    setFaqError(null);
  };

  const handleFaqSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqForm.question.trim() || !faqForm.answer.trim()) {
      setFaqError('Pertanyaan dan jawaban wajib diisi');
      return;
    }
    setFaqSubmitting(true);
    setFaqError(null);
    try {
      if (faqEditing) {
        await api.put(`/faqs/${faqEditing.id}`, faqForm);
      } else {
        await api.post('/faqs', faqForm);
      }
      await loadFaqs();
      resetFaqForm();
    } catch (err: any) {
      setFaqError(err.response?.data?.message || 'Gagal menyimpan FAQ');
    } finally {
      setFaqSubmitting(false);
    }
  };

  const handleFaqDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus FAQ ini?')) return;
    setFaqError(null);
    try {
      await api.delete(`/faqs/${id}`);
      await loadFaqs();
    } catch (err: any) {
      setFaqError(err.response?.data?.message || 'Gagal menghapus FAQ');
    }
  };

  const startFaqEdit = (faq: any) => {
    setFaqEditing(faq);
    setFaqForm({
      question: faq.question,
      answer: faq.answer,
      display_order: faq.display_order || 0,
    });
    setFaqError(null);
  };

  // ===== EVENT HANDLERS =====
  const resetEventForm = () => {
    setEventForm({ name: '', description: '', start_date: '', end_date: '' });
    setEventEditing(null);
    setEventError(null);
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.name.trim()) {
      setEventError('Nama event wajib diisi');
      return;
    }
    setEventSubmitting(true);
    setEventError(null);
    try {
      if (eventEditing) {
        await updateEvent(eventEditing.id, eventForm);
      } else {
        await createEvent(eventForm);
      }
      resetEventForm();
    } catch (err: any) {
      setEventError(err.response?.data?.message || 'Gagal menyimpan event');
    } finally {
      setEventSubmitting(false);
    }
  };

  const handleEventDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus event ini?')) return;
    setEventError(null);
    try {
      await removeEvent(id);
    } catch (err: any) {
      setEventError(err.response?.data?.message || 'Gagal menghapus event');
    }
  };

  const startEventEdit = (event: any) => {
    setEventEditing(event);
    setEventForm({
      name: event.name,
      description: event.description || '',
      start_date: event.start_date,
      end_date: event.end_date,
    });
    setEventError(null);
  };

  // ===== STAGE HANDLERS =====
  const resetStageForm = () => {
    setStageForm({ event_id: 0, name: '', stage_order: 1, is_active: false });
    setStageEditing(null);
    setStageError(null);
  };

  const handleStageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stageForm.name.trim() || !stageForm.event_id) {
      setStageError('Nama stage dan event wajib dipilih');
      return;
    }
    setStageSubmitting(true);
    setStageError(null);
    try {
      if (stageEditing) {
        await updateStage(stageEditing.id, stageForm);
      } else {
        await createStage(stageForm);
      }
      resetStageForm();
    } catch (err: any) {
      setStageError(err.response?.data?.message || 'Gagal menyimpan stage');
    } finally {
      setStageSubmitting(false);
    }
  };

  const handleStageDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus stage ini?')) return;
    setStageError(null);
    try {
      await removeStage(id);
    } catch (err: any) {
      setStageError(err.response?.data?.message || 'Gagal menghapus stage');
    }
  };

  const startStageEdit = (stage: any) => {
    setStageEditing(stage);
    setStageForm({
      event_id: stage.event_id,
      name: stage.name,
      stage_order: stage.stage_order,
      is_active: !!stage.is_active,
    });
    setStageError(null);
  };

  // ===== SCHEDULE HANDLERS =====
  const resetScheduleForm = () => {
    setScheduleForm({ event_id: 0, date_time: '', description: '', location: '' });
    setScheduleEditing(null);
    setScheduleError(null);
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleForm.event_id || !scheduleForm.date_time) {
      setScheduleError('Event dan tanggal/jam wajib diisi');
      return;
    }
    setScheduleSubmitting(true);
    setScheduleError(null);
    try {
      if (scheduleEditing) {
        await updateSchedule(scheduleEditing.id, scheduleForm);
      } else {
        await createSchedule(scheduleForm);
      }
      resetScheduleForm();
    } catch (err: any) {
      setScheduleError(err.response?.data?.message || 'Gagal menyimpan jadwal');
    } finally {
      setScheduleSubmitting(false);
    }
  };

  const handleScheduleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus jadwal ini?')) return;
    setScheduleError(null);
    try {
      await removeSchedule(id);
    } catch (err: any) {
      setScheduleError(err.response?.data?.message || 'Gagal menghapus jadwal');
    }
  };

  const startScheduleEdit = (schedule: any) => {
    setScheduleEditing(schedule);
    setScheduleForm({
      event_id: schedule.event_id,
      date_time: schedule.date_time,
      description: schedule.description || '',
      location: schedule.location || '',
    });
    setScheduleError(null);
  };

  // ===== ANNOUNCEMENT HANDLERS =====
  const resetAnnForm = () => {
    setAnnForm({
      title: '',
      content: '',
      type: 'global',
      target_team_id: '',
      target_stage_id: '',
      published_at: '',
    });
    setAnnEditing(null);
    setAnnError(null);
  };

  const handleAnnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annForm.title.trim() || !annForm.content.trim()) {
      setAnnError('Judul dan konten wajib diisi');
      return;
    }
    if (annForm.type === 'team' && !annForm.target_team_id) {
      setAnnError('Pilih tim target');
      return;
    }
    if (annForm.type === 'stage' && !annForm.target_stage_id) {
      setAnnError('Pilih stage target');
      return;
    }

    const payload: any = {
      title: annForm.title,
      content: annForm.content,
      type: annForm.type,
      published_at: annForm.published_at || new Date().toISOString(),
    };
    if (annForm.type === 'team') payload.target_team_id = parseInt(annForm.target_team_id);
    if (annForm.type === 'stage') payload.target_stage_id = parseInt(annForm.target_stage_id);

    setAnnSubmitting(true);
    setAnnError(null);
    try {
      if (annEditing) {
        await api.put(`/announcements/${annEditing.id}`, payload);
      } else {
        await api.post('/announcements', payload);
      }
      await loadAnnouncements();
      resetAnnForm();
    } catch (err: any) {
      setAnnError(err.response?.data?.message || 'Gagal menyimpan pengumuman');
    } finally {
      setAnnSubmitting(false);
    }
  };

  const handleAnnDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus pengumuman ini?')) return;
    setAnnError(null);
    try {
      await api.delete(`/announcements/${id}`);
      await loadAnnouncements();
    } catch (err: any) {
      setAnnError(err.response?.data?.message || 'Gagal menghapus pengumuman');
    }
  };

  const startAnnEdit = (item: any) => {
    setAnnEditing(item);
    setAnnForm({
      title: item.title,
      content: item.content,
      type: item.type,
      target_team_id: item.target_team_id || '',
      target_stage_id: item.target_stage_id || '',
      published_at: item.published_at ? item.published_at.slice(0, 16) : '',
    });
    setAnnError(null);
  };

  // ===== COMPONENTS =====
  const LoadingSpinner = () => (
    <div className="loading-container">
      <div className="loading-spinner" />
    </div>
  );

  const Alert = ({ message, type, onClose }: { message: string; type: 'error' | 'success'; onClose: () => void }) => (
    <div className={`alert alert-${type}`}>
      <span>{message}</span>
      <button onClick={onClose} className="alert-close">×</button>
    </div>
  );

  // ===== RENDER =====
  return (
    <div className="manage-landing-page">
      <Navbar
        user={user}
        onLogout={handleLogout}
        scrolled={scrolled}
        scrollPercent={scrollPct}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        showQuickActions={true}
        roleLabel="Admin"
      />

      {/* Hero – tanpa network */}
      <div className="hero">
        <div className="hero-content">
          <span className="hero-eyebrow">Admin Panel · Empat Pilar MPR RI</span>
          <h1>Manage Landing Page</h1>
          <p>Kelola FAQ, Event, Stage, Jadwal, dan Pengumuman untuk halaman publik.</p>
        </div>
      </div>

      {/* Action bar – back button */}
      <div className="action-bar">
        <Link href="/admin/" className="btn-back">
          ← Back to Dashboard
        </Link>
      </div>

      {/* Tab navigasi */}
      <div className="tab-bar">
        <div className="tab-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'tab-btn-active' : ''}`}
              onClick={() => setActiveTab(tab.id as any)}
            >
              <span className="tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ===== TAB CONTENT ===== */}
      <div className="tab-content">
        {activeTab === 'faq' && (
          <>
            {faqError && <Alert message={faqError} type="error" onClose={() => setFaqError(null)} />}

            <div className="panel">
              <h3 className="panel-title">{faqEditing ? 'Edit FAQ' : 'Tambah FAQ Baru'}</h3>
              <form onSubmit={handleFaqSubmit}>
                <div className="form-group">
                  <label className="form-label">Pertanyaan</label>
                  <input
                    type="text"
                    value={faqForm.question}
                    onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Jawaban</label>
                  <textarea
                    value={faqForm.answer}
                    onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                    rows={4}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Urutan Tampil</label>
                  <input
                    type="number"
                    value={faqForm.display_order}
                    onChange={(e) => setFaqForm({ ...faqForm, display_order: parseInt(e.target.value) || 0 })}
                    className="form-control"
                    style={{ width: '120px' }}
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" disabled={faqSubmitting} className="btn-primary">
                    {faqSubmitting ? 'Menyimpan...' : faqEditing ? 'Update' : 'Simpan'}
                  </button>
                  {faqEditing && (
                    <button type="button" onClick={resetFaqForm} className="btn-outline">
                      Batal
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="table-wrapper">
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Pertanyaan</th>
                      <th>Jawaban</th>
                      <th>Urutan</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {faqLoading ? (
                      <tr><td colSpan={5}><LoadingSpinner /></td></tr>
                    ) : faqs.length === 0 ? (
                      <tr>
                        <td colSpan={5}>
                          <div className="empty-state">
                            <span className="empty-icon">❓</span>
                            <p>Belum ada FAQ</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      faqs.map((faq, idx) => (
                        <tr key={faq.id}>
                          <td className="cell-id">{idx + 1}</td>
                          <td className="cell-strong">{faq.question}</td>
                          <td>{faq.answer}</td>
                          <td>{faq.display_order}</td>
                          <td>
                            <button onClick={() => startFaqEdit(faq)} className="action-link">Edit</button>
                            <button onClick={() => handleFaqDelete(faq.id)} className="action-link action-link-delete">Hapus</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'events' && (
          <>
            {eventError && <Alert message={eventError} type="error" onClose={() => setEventError(null)} />}

            <div className="panel">
              <h3 className="panel-title">{eventEditing ? 'Edit Event' : 'Tambah Event Baru'}</h3>
              <form onSubmit={handleEventSubmit}>
                <div className="form-group">
                  <label className="form-label">Nama Event</label>
                  <input
                    type="text"
                    value={eventForm.name}
                    onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Deskripsi</label>
                  <textarea
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    rows={3}
                    className="form-control"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Tanggal Mulai</label>
                    <input
                      type="date"
                      value={eventForm.start_date}
                      onChange={(e) => setEventForm({ ...eventForm, start_date: e.target.value })}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tanggal Selesai</label>
                    <input
                      type="date"
                      value={eventForm.end_date}
                      onChange={(e) => setEventForm({ ...eventForm, end_date: e.target.value })}
                      className="form-control"
                      required
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" disabled={eventSubmitting} className="btn-primary">
                    {eventSubmitting ? 'Menyimpan...' : eventEditing ? 'Update' : 'Simpan'}
                  </button>
                  {eventEditing && (
                    <button type="button" onClick={resetEventForm} className="btn-outline">
                      Batal
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="table-wrapper">
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nama</th>
                      <th>Mulai</th>
                      <th>Selesai</th>
                      <th>Stage</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventsLoading ? (
                      <tr><td colSpan={6}><LoadingSpinner /></td></tr>
                    ) : events.length === 0 ? (
                      <tr>
                        <td colSpan={6}>
                          <div className="empty-state">
                            <span className="empty-icon">📅</span>
                            <p>Belum ada event</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      events.map((event) => (
                        <tr key={event.id}>
                          <td className="cell-id">#{event.id}</td>
                          <td className="cell-strong">{event.name}</td>
                          <td>{event.start_date}</td>
                          <td>{event.end_date}</td>
                          <td>{event.stages?.length || 0}</td>
                          <td>
                            <button onClick={() => startEventEdit(event)} className="action-link">Edit</button>
                            <button onClick={() => handleEventDelete(event.id)} className="action-link action-link-delete">Hapus</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'stages' && (
          <>
            {stageError && <Alert message={stageError} type="error" onClose={() => setStageError(null)} />}

            <div className="panel">
              <h3 className="panel-title">{stageEditing ? 'Edit Stage' : 'Tambah Stage Baru'}</h3>
              <form onSubmit={handleStageSubmit}>
                <div className="form-group">
                  <label className="form-label">Event</label>
                  <select
                    value={stageForm.event_id}
                    onChange={(e) => setStageForm({ ...stageForm, event_id: parseInt(e.target.value) })}
                    className="form-control"
                    required
                  >
                    <option value="">Pilih Event</option>
                    {events.map((e) => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Nama Stage</label>
                  <input
                    type="text"
                    value={stageForm.name}
                    onChange={(e) => setStageForm({ ...stageForm, name: e.target.value })}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Urutan</label>
                    <input
                      type="number"
                      value={stageForm.stage_order}
                      onChange={(e) => setStageForm({ ...stageForm, stage_order: parseInt(e.target.value) || 1 })}
                      className="form-control"
                      min="1"
                      required
                    />
                  </div>
                  <div className="form-group checkbox-group">
                    <label className="form-label checkbox-label">
                      <input
                        type="checkbox"
                        checked={stageForm.is_active}
                        onChange={(e) => setStageForm({ ...stageForm, is_active: e.target.checked })}
                      />
                      Aktif
                    </label>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" disabled={stageSubmitting} className="btn-primary">
                    {stageSubmitting ? 'Menyimpan...' : stageEditing ? 'Update' : 'Simpan'}
                  </button>
                  {stageEditing && (
                    <button type="button" onClick={resetStageForm} className="btn-outline">
                      Batal
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="table-wrapper">
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Event</th>
                      <th>Nama</th>
                      <th>Urutan</th>
                      <th>Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stagesLoading ? (
                      <tr><td colSpan={6}><LoadingSpinner /></td></tr>
                    ) : stages.length === 0 ? (
                      <tr>
                        <td colSpan={6}>
                          <div className="empty-state">
                            <span className="empty-icon">📋</span>
                            <p>Belum ada stage</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      stages.map((stage) => (
                        <tr key={stage.id}>
                          <td className="cell-id">#{stage.id}</td>
                          <td>{stage.event?.name || '-'}</td>
                          <td className="cell-strong">{stage.name}</td>
                          <td>{stage.stage_order}</td>
                          <td>
                            <span className={`badge ${stage.is_active ? 'badge-active' : 'badge-inactive'}`}>
                              {stage.is_active ? 'Aktif' : 'Tidak Aktif'}
                            </span>
                          </td>
                          <td>
                            <button onClick={() => startStageEdit(stage)} className="action-link">Edit</button>
                            <button onClick={() => handleStageDelete(stage.id)} className="action-link action-link-delete">Hapus</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'schedules' && (
          <>
            {scheduleError && <Alert message={scheduleError} type="error" onClose={() => setScheduleError(null)} />}

            <div className="panel">
              <h3 className="panel-title">{scheduleEditing ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}</h3>
              <form onSubmit={handleScheduleSubmit}>
                <div className="form-group">
                  <label className="form-label">Event</label>
                  <select
                    value={scheduleForm.event_id}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, event_id: parseInt(e.target.value) })}
                    className="form-control"
                    required
                  >
                    <option value="">Pilih Event</option>
                    {events.map((e) => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Tanggal & Waktu</label>
                  <input
                    type="datetime-local"
                    value={scheduleForm.date_time}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, date_time: e.target.value })}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Deskripsi</label>
                  <input
                    type="text"
                    value={scheduleForm.description}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Lokasi</label>
                  <input
                    type="text"
                    value={scheduleForm.location}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, location: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" disabled={scheduleSubmitting} className="btn-primary">
                    {scheduleSubmitting ? 'Menyimpan...' : scheduleEditing ? 'Update' : 'Simpan'}
                  </button>
                  {scheduleEditing && (
                    <button type="button" onClick={resetScheduleForm} className="btn-outline">
                      Batal
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="table-wrapper">
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Event</th>
                      <th>Tanggal & Waktu</th>
                      <th>Lokasi</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedulesLoading ? (
                      <tr><td colSpan={5}><LoadingSpinner /></td></tr>
                    ) : schedules.length === 0 ? (
                      <tr>
                        <td colSpan={5}>
                          <div className="empty-state">
                            <span className="empty-icon">🕐</span>
                            <p>Belum ada jadwal</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      schedules.map((schedule) => (
                        <tr key={schedule.id}>
                          <td className="cell-id">#{schedule.id}</td>
                          <td>{schedule.event?.name || '-'}</td>
                          <td>
                            {new Date(schedule.date_time).toLocaleString('id-ID', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td>{schedule.location || '-'}</td>
                          <td>
                            <button onClick={() => startScheduleEdit(schedule)} className="action-link">Edit</button>
                            <button onClick={() => handleScheduleDelete(schedule.id)} className="action-link action-link-delete">Hapus</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'announcements' && (
          <>
            {annError && <Alert message={annError} type="error" onClose={() => setAnnError(null)} />}

            <div className="panel">
              <h3 className="panel-title">{annEditing ? 'Edit Pengumuman' : 'Tambah Pengumuman Baru'}</h3>
              <form onSubmit={handleAnnSubmit}>
                <div className="form-group">
                  <label className="form-label">Judul</label>
                  <input
                    type="text"
                    value={annForm.title}
                    onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Konten</label>
                  <textarea
                    value={annForm.content}
                    onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })}
                    rows={4}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tipe</label>
                  <select
                    value={annForm.type}
                    onChange={(e) => {
                      const newType = e.target.value;
                      setAnnForm({
                        ...annForm,
                        type: newType,
                        target_team_id: '',
                        target_stage_id: '',
                      });
                    }}
                    className="form-control"
                  >
                    <option value="global">Global (Semua)</option>
                    <option value="stage">Stage (Per Stage)</option>
                    <option value="team">Tim (Per Tim)</option>
                  </select>
                </div>

                {annForm.type === 'stage' && (
                  <div className="form-group">
                    <label className="form-label">Target Stage</label>
                    <select
                      value={annForm.target_stage_id}
                      onChange={(e) => setAnnForm({ ...annForm, target_stage_id: e.target.value })}
                      className="form-control"
                    >
                      <option value="">Pilih Stage</option>
                      {stagesRef.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {annForm.type === 'team' && (
                  <div className="form-group">
                    <label className="form-label">Target Tim</label>
                    <select
                      value={annForm.target_team_id}
                      onChange={(e) => setAnnForm({ ...annForm, target_team_id: e.target.value })}
                      className="form-control"
                    >
                      <option value="">Pilih Tim</option>
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>{t.team_name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Tanggal Publikasi</label>
                  <input
                    type="datetime-local"
                    value={annForm.published_at}
                    onChange={(e) => setAnnForm({ ...annForm, published_at: e.target.value })}
                    className="form-control"
                  />
                  <small className="form-hint">Kosongkan untuk menggunakan waktu sekarang</small>
                </div>

                <div className="form-actions">
                  <button type="submit" disabled={annSubmitting} className="btn-primary">
                    {annSubmitting ? 'Menyimpan...' : annEditing ? 'Update' : 'Simpan'}
                  </button>
                  {annEditing && (
                    <button type="button" onClick={resetAnnForm} className="btn-outline">
                      Batal
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="table-wrapper">
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Judul</th>
                      <th>Tipe</th>
                      <th>Target</th>
                      <th>Publikasi</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {annLoading ? (
                      <tr><td colSpan={6}><LoadingSpinner /></td></tr>
                    ) : announcements.length === 0 ? (
                      <tr>
                        <td colSpan={6}>
                          <div className="empty-state">
                            <span className="empty-icon">📢</span>
                            <p>Belum ada pengumuman</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      announcements.map((item) => (
                        <tr key={item.id}>
                          <td className="cell-id">#{item.id}</td>
                          <td className="cell-strong">{item.title}</td>
                          <td>
                            <span className={`badge ${
                              item.type === 'global'
                                ? 'badge-purple'
                                : item.type === 'stage'
                                ? 'badge-blue'
                                : 'badge-green'
                            }`}>
                              {item.type}
                            </span>
                          </td>
                          <td>
                            {item.type === 'team' && item.target_team_id
                              ? `Tim #${item.target_team_id}`
                              : item.type === 'stage' && item.target_stage_id
                              ? `Stage #${item.target_stage_id}`
                              : '-'}
                          </td>
                          <td>
                            {item.published_at
                              ? new Date(item.published_at).toLocaleDateString('id-ID')
                              : '-'}
                          </td>
                          <td>
                            <button onClick={() => startAnnEdit(item)} className="action-link">Edit</button>
                            <button onClick={() => handleAnnDelete(item.id)} className="action-link action-link-delete">Hapus</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        /* ===== DESIGN SYSTEM BASE ===== */
        .manage-landing-page {
          background: #f5f5f5;
          min-height: 100vh;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #0c0a09;
          padding: 0 0 40px 0;
        }

        /* ===== HERO ===== */
        .hero {
          background: #f5f5f5;
          padding: 32px 32px 20px;
          text-align: center;
        }
        .hero-content {
          max-width: 800px;
          margin: 0 auto;
        }
        .hero-eyebrow {
          display: inline-block;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.96px;
          text-transform: uppercase;
          color: #777169;
          background: #f0efed;
          padding: 2px 10px;
          border-radius: 9999px;
          margin-bottom: 12px;
        }
        .hero h1 {
          font-family: 'Waldenburg Light', 'Times New Roman', serif;
          font-weight: 300;
          font-size: 34px;
          line-height: 1.08;
          letter-spacing: -0.96px;
          color: #0c0a09;
          margin: 0 0 4px 0;
        }
        .hero p {
          font-size: 14px;
          line-height: 1.5;
          letter-spacing: 0.15px;
          color: #4e4e4e;
          max-width: 540px;
          margin: 0 auto;
        }

        /* ===== ACTION BAR ===== */
        .action-bar {
          max-width: 1200px;
          margin: 0 auto 16px;
          padding: 0 32px;
        }
        .btn-back {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          font-size: 12px;
          color: #777169;
          padding: 6px 14px;
          border: 1px solid #e7e5e4;
          border-radius: 9999px;
          background: #ffffff;
          text-decoration: none;
          transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
          white-space: nowrap;
        }
        .btn-back:hover {
          background: #f0efed;
          color: #0c0a09;
          border-color: #d6d3d1;
        }

        /* ===== TAB BAR ===== */
        .tab-bar {
          max-width: 1200px;
          margin: 0 auto 16px;
          padding: 0 32px;
        }
        .tab-nav {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #ffffff;
          border: 1px solid #e7e5e4;
          padding: 5px;
          border-radius: 14px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
          flex-wrap: wrap;
        }
        .tab-btn {
          padding: 6px 14px;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          font-size: 12px;
          background: transparent;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          color: #777169;
          transition: background 0.15s ease, color 0.15s ease;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .tab-btn:hover {
          color: #0c0a09;
          background: #f0efed;
        }
        .tab-btn-active,
        .tab-btn-active:hover {
          color: #ffffff;
          background: #292524;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
        .tab-icon {
          font-size: 14px;
        }

        /* ===== TAB CONTENT ===== */
        .tab-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 32px;
        }

        /* ===== PANEL ===== */
        .panel {
          background: #ffffff;
          border-radius: 12px;
          padding: 18px 20px 16px;
          border: 1px solid #e7e5e4;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
          margin-bottom: 14px;
        }
        .panel-title {
          font-family: 'Waldenburg Light', 'Times New Roman', serif;
          font-weight: 300;
          font-size: 20px;
          line-height: 1.2;
          letter-spacing: 0;
          color: #0c0a09;
          margin: 0 0 14px 0;
        }

        /* ===== FORM ===== */
        .form-group {
          margin-bottom: 12px;
        }
        .form-label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: #0c0a09;
          margin-bottom: 3px;
        }
        .form-control {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #e7e5e4;
          border-radius: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          color: #0c0a09;
          background: #ffffff;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .form-control:focus {
          border-color: #292524;
          box-shadow: 0 0 0 3px rgba(41, 37, 36, 0.08);
        }
        .form-control:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .checkbox-group {
          display: flex;
          align-items: center;
        }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 0;
          cursor: pointer;
        }
        .checkbox-label input[type="checkbox"] {
          width: 16px;
          height: 16px;
          accent-color: #292524;
        }
        .form-hint {
          display: block;
          font-size: 11px;
          color: #a8a29e;
          margin-top: 2px;
        }
        .form-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 4px;
        }

        /* ===== BUTTONS ===== */
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 8px 16px;
          background: #292524;
          color: #ffffff;
          border: none;
          border-radius: 9999px;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          font-size: 13px;
          line-height: 1;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .btn-primary:hover:not(:disabled) {
          background: #0c0a09;
        }
        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-outline {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 8px 16px;
          background: transparent;
          color: #292524;
          border: 1px solid #d6d3d1;
          border-radius: 9999px;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          font-size: 13px;
          line-height: 1;
          cursor: pointer;
          transition: background 0.15s ease, border-color 0.15s ease;
        }
        .btn-outline:hover:not(:disabled) {
          background: #f0efed;
          border-color: #292524;
        }
        .btn-outline:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* ===== TABLE ===== */
        .table-wrapper {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e7e5e4;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
          overflow: hidden;
          margin-bottom: 14px;
        }
        .table-scroll {
          overflow-x: auto;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
          font-family: 'Inter', sans-serif;
          background: #ffffff;
        }
        .data-table thead {
          background: #fafafa;
        }
        .data-table th {
          font-weight: 500;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.96px;
          color: #777169;
          border-bottom: 1px solid #e7e5e4;
          padding: 10px 14px;
          text-align: left;
          white-space: nowrap;
        }
        .data-table td {
          padding: 10px 14px;
          font-size: 13px;
          color: #4e4e4e;
          border-bottom: 1px solid #f0efed;
          vertical-align: middle;
        }
        .data-table tbody tr:last-child td {
          border-bottom: none;
        }
        .data-table tbody tr:hover {
          background: #fafafa;
        }
        .cell-id {
          font-weight: 500;
          color: #a8a29e;
          font-size: 12px;
        }
        .cell-strong {
          font-weight: 500;
          color: #0c0a09;
        }

        /* ===== ACTION LINK ===== */
        .action-link {
          display: inline-block;
          font-size: 11px;
          font-weight: 500;
          color: #292524;
          background: #f0efed;
          padding: 3px 10px;
          border-radius: 9999px;
          border: none;
          cursor: pointer;
          transition: background 0.12s ease;
          margin-right: 4px;
          text-decoration: none;
        }
        .action-link:hover {
          background: #e7e5e4;
        }
        .action-link-delete {
          color: #dc2626;
          background: #fef2f2;
        }
        .action-link-delete:hover {
          background: #fee2e2;
        }

        /* ===== BADGE ===== */
        .badge {
          display: inline-block;
          font-size: 10px;
          font-weight: 500;
          padding: 2px 10px;
          border-radius: 9999px;
          white-space: nowrap;
        }
        .badge-active {
          background: #f0efed;
          color: #292524;
        }
        .badge-inactive {
          background: #f5f5f5;
          color: #a8a29e;
        }
        .badge-purple {
          background: #f0efed;
          color: #292524;
        }
        .badge-blue {
          background: #e7e5e4;
          color: #292524;
        }
        .badge-green {
          background: #f0efed;
          color: #292524;
        }

        /* ===== ALERT ===== */
        .alert {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 13px;
          margin-bottom: 12px;
        }
        .alert-error {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }
        .alert-success {
          background: #f0fdf4;
          color: #16a34a;
          border: 1px solid #bbf7d0;
        }
        .alert-close {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: inherit;
          padding: 0 4px;
        }

        /* ===== LOADING ===== */
        .loading-container {
          display: flex;
          justify-content: center;
          padding: 20px 0;
        }
        .loading-spinner {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 3px solid #e7e5e4;
          border-top-color: #292524;
          animation: spin 0.85s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* ===== EMPTY STATE ===== */
        .empty-state {
          text-align: center;
          padding: 32px 20px;
        }
        .empty-icon {
          font-size: 32px;
          display: block;
          margin-bottom: 8px;
        }
        .empty-state p {
          margin: 0;
          font-size: 13px;
          color: #a8a29e;
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 768px) {
          .hero {
            padding: 24px 16px 16px;
          }
          .hero h1 {
            font-size: 26px;
            letter-spacing: -0.64px;
          }
          .action-bar {
            padding: 0 16px;
          }
          .tab-bar {
            padding: 0 16px;
          }
          .tab-content {
            padding: 0 16px;
          }
          .tab-nav {
            width: 100%;
            justify-content: center;
          }
          .tab-btn {
            font-size: 11px;
            padding: 5px 10px;
          }
          .form-row {
            grid-template-columns: 1fr;
          }
          .data-table th,
          .data-table td {
            padding: 8px 10px;
            font-size: 12px;
          }
        }

        @media (max-width: 480px) {
          .panel {
            padding: 14px 12px;
          }
          .form-actions {
            flex-direction: column;
          }
          .btn-primary,
          .btn-outline {
            justify-content: center;
          }
          .tab-btn {
            font-size: 10px;
            padding: 4px 8px;
          }
          .tab-icon {
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
}