// components/TeamRegistrationWizard.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTeam } from '@/hooks/useTeam';
import { TeamRegistrationFormData, MemberFormData } from '@/types/teamRegistration';
import { teamService } from '@/services/teamService';

interface WizardProps {
  isOpen: boolean;
  onSuccess?: () => void;
}

export default function TeamRegistrationWizard({ isOpen, onSuccess }: WizardProps) {
  const { fetchTeam } = useTeam();
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [stepDir, setStepDir] = useState<'forward' | 'back'>('forward');
  const [stepAnimating, setStepAnimating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // State untuk nama file yang dipilih (agar tampil setelah upload)
  const [fileNames, setFileNames] = useState<Record<string, string>>({
    hak_cipta: '',
    komitmen: '',
    rekomendasi: '',
    summary_brief: '',
    ktm_ketua: '',
    ktm_anggota1: '',
    ktm_anggota2: '',
  });

  const [formData, setFormData] = useState<TeamRegistrationFormData>({
    team_name: '',
    institution: '',
    city: '',
    members: [
      { name: '', email: '', phone: '', nim: '', faculty: '', study_program: '', position: 'ketua' },
      { name: '', email: '', phone: '', nim: '', faculty: '', study_program: '', position: 'anggota1' },
      { name: '', email: '', phone: '', nim: '', faculty: '', study_program: '', position: 'anggota2' },
    ],
    hak_cipta: null,
    komitmen: null,
    rekomendasi: null,
    video_link: '',
    summary_brief: null,
    ktm_ketua: null,
    ktm_anggota1: null,
    ktm_anggota2: null,
    agree_privacy: false,
    agree_truth: false,
  });

  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setError('');
      setSuccess(false);
      setStepAnimating(false);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCancel();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  const handleCancel = () => {
    setVisible(false);
    setTimeout(() => {
      if (onSuccess) onSuccess();
    }, 350);
  };

  const updateField = (field: keyof TeamRegistrationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateMember = (idx: number, field: keyof MemberFormData, value: string) => {
    const updated = [...formData.members];
    updated[idx] = { ...updated[idx], [field]: value };
    setFormData(prev => ({ ...prev, members: updated }));
  };

  const handleFileChange = (
    field: keyof Pick<TeamRegistrationFormData, 'hak_cipta' | 'komitmen' | 'rekomendasi' | 'summary_brief' | 'ktm_ketua' | 'ktm_anggota1' | 'ktm_anggota2'>,
    file: File | null
  ) => {
    setFormData(prev => ({ ...prev, [field]: file }));
    // Update nama file untuk ditampilkan
    setFileNames(prev => ({ ...prev, [field]: file ? file.name : '' }));
  };

  const validateStep = (): boolean => {
    setError('');
    if (step === 0) {
      if (!formData.team_name.trim()) { setError('Nama tim harus diisi'); return false; }
      if (!formData.city.trim()) { setError('Kota/Wilayah harus diisi'); return false; }
      return true;
    }
    if (step === 1) {
      for (let i = 0; i < formData.members.length; i++) {
        const m = formData.members[i];
        if (!m.name.trim()) { setError(`Nama ${m.position === 'ketua' ? 'Ketua' : `Anggota ${i}`} harus diisi`); return false; }
        if (!m.email.trim() || !m.email.includes('@')) { setError(`Email ${m.position === 'ketua' ? 'Ketua' : `Anggota ${i}`} tidak valid`); return false; }
        if (!m.nim.trim()) { setError(`NIM ${m.position === 'ketua' ? 'Ketua' : `Anggota ${i}`} harus diisi`); return false; }
        if (!m.faculty.trim()) { setError(`Fakultas ${m.position === 'ketua' ? 'Ketua' : `Anggota ${i}`} harus diisi`); return false; }
        if (!m.study_program.trim()) { setError(`Program Studi ${m.position === 'ketua' ? 'Ketua' : `Anggota ${i}`} harus diisi`); return false; }
      }
      return true;
    }
    if (step === 2) {
      if (!formData.hak_cipta) { setError('Surat pernyataan hak cipta wajib diunggah'); return false; }
      if (!formData.komitmen) { setError('Surat komitmen wajib diunggah'); return false; }
      if (!formData.rekomendasi) { setError('Surat rekomendasi universitas wajib diunggah'); return false; }
      if (!formData.video_link.trim()) { setError('Link video portofolio wajib diisi'); return false; }
      if (!formData.summary_brief) { setError('Summary brief konsep proyek wajib diunggah'); return false; }
      if (!formData.ktm_ketua) { setError('Foto KTM ketua wajib diunggah'); return false; }
      if (!formData.ktm_anggota1) { setError('Foto KTM anggota 1 wajib diunggah'); return false; }
      if (!formData.ktm_anggota2) { setError('Foto KTM anggota 2 wajib diunggah'); return false; }
      return true;
    }
    if (step === 3) {
      if (!formData.agree_privacy) { setError('Harap setujui kebijakan privasi'); return false; }
      if (!formData.agree_truth) { setError('Harap setujui pernyataan kebenaran data'); return false; }
      return true;
    }
    return true;
  };

  const transitionStep = (nextStep: number, dir: 'forward' | 'back') => {
    setStepDir(dir);
    setStepAnimating(true);
    setTimeout(() => {
      setStep(nextStep);
      setStepAnimating(false);
      if (bodyRef.current) bodyRef.current.scrollTop = 0;
    }, 280);
  };

  const handleNext = () => {
    if (validateStep()) {
      if (step === 3) {
        handleSubmit();
      } else {
        transitionStep(step + 1, 'forward');
      }
    }
  };

  const handleBack = () => {
    if (step > 0) transitionStep(step - 1, 'back');
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const submitData = new FormData();
      submitData.append('team_name', formData.team_name);
      submitData.append('institution', formData.institution || '');
      submitData.append('city', formData.city);
      formData.members.forEach((member, idx) => {
        submitData.append(`members[${idx}][name]`, member.name);
        submitData.append(`members[${idx}][email]`, member.email);
        if (member.phone) submitData.append(`members[${idx}][phone]`, member.phone);
        submitData.append(`members[${idx}][nim]`, member.nim);
        submitData.append(`members[${idx}][faculty]`, member.faculty);
        submitData.append(`members[${idx}][study_program]`, member.study_program);
        submitData.append(`members[${idx}][position]`, member.position);
      });
      if (formData.hak_cipta) submitData.append('hak_cipta', formData.hak_cipta);
      if (formData.komitmen) submitData.append('komitmen', formData.komitmen);
      if (formData.rekomendasi) submitData.append('rekomendasi', formData.rekomendasi);
      submitData.append('video_link', formData.video_link);
      if (formData.summary_brief) submitData.append('summary_brief', formData.summary_brief);
      if (formData.ktm_ketua) submitData.append('ktm_ketua', formData.ktm_ketua);
      if (formData.ktm_anggota1) submitData.append('ktm_anggota1', formData.ktm_anggota1);
      if (formData.ktm_anggota2) submitData.append('ktm_anggota2', formData.ktm_anggota2);
      submitData.append('agree_privacy', '1');
      submitData.append('agree_truth', '1');

      await teamService.completeRegistration(submitData);
      setSuccess(true);
      await fetchTeam();
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 2200);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Gagal mendaftarkan tim');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen && !visible) return null;

  const progressPercent = step === 0 ? 25 : step === 1 ? 50 : step === 2 ? 75 : 100;

  const stepMeta = [
    { label: 'Data Tim', icon: '🏷️' },
    { label: 'Anggota', icon: '👥' },
    { label: 'Dokumen', icon: '📁' },
    { label: 'Konfirmasi', icon: '✅' },
  ];

  return (
    <div
      className={`wz-overlay ${visible ? 'wz-overlay--in' : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget && !loading) handleCancel(); }}
    >
      <div className={`wz-modal ${visible ? 'wz-modal--in' : ''}`} role="dialog" aria-modal="true" aria-label="Pendaftaran Tim">

        {/* ── HEADER ── */}
        <div className="wz-header">
          <div className="wz-header-top">
            <div className="wz-brand">
              <div className="wz-brand-ring">
                <div className="wz-brand-dot" />
              </div>
              <div className="wz-brand-text">
                <span className="wz-title">Pendaftaran Tim</span>
                <span className="wz-subtitle">Hackathon Inovasi Digital MPR RI 2026</span>
              </div>
            </div>
            <button className="wz-close" onClick={handleCancel} disabled={loading} title="Tutup">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Progress bar baru dengan animasi improved */}
          <div className="wz-progress-track">
            <div className="wz-progress-fill" style={{ width: `${progressPercent}%` }}>
              <div className="wz-progress-glow" />
            </div>
          </div>

          {/* Step pills improved */}
          <div className="wz-steps">
            {stepMeta.map((s, i) => (
              <div key={i} className={`wz-step-pill ${step === i ? 'active' : step > i ? 'done' : ''}`}>
                <span className="wz-step-num">
                  {step > i ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <span>{i + 1}</span>
                  )}
                </span>
                <span className="wz-step-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="wz-body" ref={bodyRef}>

          {error && !success && (
            <div className="wz-error" role="alert">
              <div className="wz-error-icon">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="wz-success">
              <div className="wz-success-rings">
                <div className="wz-success-ring wz-success-ring--3" />
                <div className="wz-success-ring wz-success-ring--2" />
                <div className="wz-success-ring wz-success-ring--1" />
                <div className="wz-success-icon">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              </div>
              <h3 className="wz-success-title">Pendaftaran Berhasil! 🎉</h3>
              <p className="wz-success-sub">Tim Anda telah terdaftar dan sedang diverifikasi oleh admin.</p>
              <div className="wz-success-redirect">
                <div className="wz-redirect-bar" />
                <span>Mengalihkan…</span>
              </div>
            </div>
          )}

          {!success && (
            <div className="wz-step-wrapper">

              {/* ── STEP 0 — Data Tim ── */}
              <div
                className={`wz-step-content ${
                  stepAnimating
                    ? stepDir === 'forward' ? 'wz-step--exit-left' : 'wz-step--exit-right'
                    : step === 0 ? 'wz-step--enter' : 'wz-step--hidden'
                }`}
              >
                {step === 0 && (
                  <div className="wz-form">
                    <div className="wz-section-header">
                      <div className="wz-section-icon">🏷️</div>
                      <div>
                        <div className="wz-section-label">Identitas Tim</div>
                        <div className="wz-section-desc">Masukkan informasi dasar tim Anda</div>
                      </div>
                    </div>

                    <div className="wz-field">
                      <label className="wz-label">Nama Tim <span className="wz-req">*</span></label>
                      <div className={`wz-input-wrap ${focusedField === 'team_name' ? 'focused' : ''}`}>
                        <div className="wz-input-icon">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                          </svg>
                        </div>
                        <input
                          type="text"
                          className="wz-input wz-input--icon"
                          value={formData.team_name}
                          onChange={(e) => updateField('team_name', e.target.value)}
                          onFocus={() => setFocusedField('team_name')}
                          onBlur={() => setFocusedField(null)}
                          placeholder="Contoh: Tim Inovasi Digital"
                        />
                        <div className="wz-input-glow" />
                      </div>
                    </div>

                    <div className="wz-field">
                      <label className="wz-label">Institusi / Universitas <span className="wz-optional">(opsional)</span></label>
                      <div className={`wz-input-wrap ${focusedField === 'institution' ? 'focused' : ''}`}>
                        <div className="wz-input-icon">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                          </svg>
                        </div>
                        <input
                          type="text"
                          className="wz-input wz-input--icon"
                          value={formData.institution || ''}
                          onChange={(e) => updateField('institution', e.target.value)}
                          onFocus={() => setFocusedField('institution')}
                          onBlur={() => setFocusedField(null)}
                          placeholder="Nama universitas / institusi"
                        />
                        <div className="wz-input-glow" />
                      </div>
                    </div>

                    <div className="wz-field">
                      <label className="wz-label">Kota / Wilayah <span className="wz-req">*</span></label>
                      <div className={`wz-input-wrap ${focusedField === 'city' ? 'focused' : ''}`}>
                        <div className="wz-input-icon">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                          </svg>
                        </div>
                        <input
                          type="text"
                          className="wz-input wz-input--icon"
                          value={formData.city}
                          onChange={(e) => updateField('city', e.target.value)}
                          onFocus={() => setFocusedField('city')}
                          onBlur={() => setFocusedField(null)}
                          placeholder="Contoh: Jakarta Selatan"
                        />
                        <div className="wz-input-glow" />
                      </div>
                    </div>

                    <div className="wz-info-card">
                      <div className="wz-info-card-dot" />
                      <p>Nama tim akan ditampilkan secara publik di papan leaderboard kompetisi.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* ── STEP 1 — Data Anggota ── */}
              <div
                className={`wz-step-content ${
                  stepAnimating
                    ? stepDir === 'back' ? 'wz-step--exit-right' : 'wz-step--exit-left'
                    : step === 1 ? 'wz-step--enter' : 'wz-step--hidden'
                }`}
              >
                {step === 1 && (
                  <div className="wz-form">
                    <div className="wz-section-header">
                      <div className="wz-section-icon">👥</div>
                      <div>
                        <div className="wz-section-label">Data Anggota Tim</div>
                        <div className="wz-section-desc">Lengkapi data seluruh anggota (1 ketua + 2 anggota)</div>
                      </div>
                    </div>

                    {formData.members.map((member, idx) => (
                      <div key={idx} className={`wz-member-block ${member.position === 'ketua' ? 'wz-member-block--ketua' : ''}`}>
                        <div className="wz-member-header">
                          <div className="wz-member-avatar">
                            <span>{member.position === 'ketua' ? '👑' : '👤'}</span>
                          </div>
                          <div className="wz-member-meta">
                            <span className="wz-member-title">
                              {member.position === 'ketua' ? 'Ketua Tim' : `Anggota ${idx}`}
                            </span>
                            {member.position === 'ketua' && (
                              <span className="wz-member-badge wz-member-badge--ketua">Ketua</span>
                            )}
                          </div>
                        </div>

                        <div className="wz-member-fields">
                          <div className={`wz-input-wrap ${focusedField === `name-${idx}` ? 'focused' : ''}`}>
                            <input
                              type="text"
                              className="wz-input"
                              placeholder="Nama lengkap *"
                              value={member.name}
                              onChange={(e) => updateMember(idx, 'name', e.target.value)}
                              onFocus={() => setFocusedField(`name-${idx}`)}
                              onBlur={() => setFocusedField(null)}
                            />
                            <div className="wz-input-glow" />
                          </div>

                          <div className="wz-field-row">
                            <div className={`wz-input-wrap ${focusedField === `email-${idx}` ? 'focused' : ''}`}>
                              <input
                                type="email"
                                className="wz-input"
                                placeholder="Email *"
                                value={member.email}
                                onChange={(e) => updateMember(idx, 'email', e.target.value)}
                                onFocus={() => setFocusedField(`email-${idx}`)}
                                onBlur={() => setFocusedField(null)}
                              />
                              <div className="wz-input-glow" />
                            </div>
                            <div className={`wz-input-wrap ${focusedField === `phone-${idx}` ? 'focused' : ''}`}>
                              <input
                                type="tel"
                                className="wz-input"
                                placeholder="WhatsApp (opsional)"
                                value={member.phone || ''}
                                onChange={(e) => updateMember(idx, 'phone', e.target.value)}
                                onFocus={() => setFocusedField(`phone-${idx}`)}
                                onBlur={() => setFocusedField(null)}
                              />
                              <div className="wz-input-glow" />
                            </div>
                          </div>

                          <div className="wz-field-row">
                            <div className={`wz-input-wrap ${focusedField === `nim-${idx}` ? 'focused' : ''}`}>
                              <input
                                type="text"
                                className="wz-input"
                                placeholder="NIM *"
                                value={member.nim}
                                onChange={(e) => updateMember(idx, 'nim', e.target.value)}
                                onFocus={() => setFocusedField(`nim-${idx}`)}
                                onBlur={() => setFocusedField(null)}
                              />
                              <div className="wz-input-glow" />
                            </div>
                            <div className={`wz-input-wrap ${focusedField === `faculty-${idx}` ? 'focused' : ''}`}>
                              <input
                                type="text"
                                className="wz-input"
                                placeholder="Fakultas *"
                                value={member.faculty}
                                onChange={(e) => updateMember(idx, 'faculty', e.target.value)}
                                onFocus={() => setFocusedField(`faculty-${idx}`)}
                                onBlur={() => setFocusedField(null)}
                              />
                              <div className="wz-input-glow" />
                            </div>
                          </div>

                          <div className={`wz-input-wrap ${focusedField === `prodi-${idx}` ? 'focused' : ''}`}>
                            <input
                              type="text"
                              className="wz-input"
                              placeholder="Program Studi *"
                              value={member.study_program}
                              onChange={(e) => updateMember(idx, 'study_program', e.target.value)}
                              onFocus={() => setFocusedField(`prodi-${idx}`)}
                              onBlur={() => setFocusedField(null)}
                            />
                            <div className="wz-input-glow" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── STEP 2 — Upload Dokumen ── */}
              <div
                className={`wz-step-content ${
                  stepAnimating
                    ? stepDir === 'back' ? 'wz-step--exit-right' : 'wz-step--exit-left'
                    : step === 2 ? 'wz-step--enter' : 'wz-step--hidden'
                }`}
              >
                {step === 2 && (
                  <div className="wz-form">
                    <div className="wz-section-header">
                      <div className="wz-section-icon">📁</div>
                      <div>
                        <div className="wz-section-label">Upload Dokumen Wajib</div>
                        <div className="wz-section-desc">Format PDF, DOC, DOCX — maks. 5 MB per file</div>
                      </div>
                    </div>

                    {/* Document uploads */}
                    {[
                      { field: 'hak_cipta', label: 'Surat Pernyataan Hak Cipta', accept: '.pdf,.doc,.docx', icon: '📜' },
                      { field: 'komitmen', label: 'Surat Komitmen Keikutsertaan', accept: '.pdf,.doc,.docx', icon: '🤝' },
                      { field: 'rekomendasi', label: 'Surat Rekomendasi Universitas', accept: '.pdf,.doc,.docx', icon: '🏛️' },
                    ].map((doc) => (
                      <div key={doc.field} className="wz-upload-card">
                        <div className="wz-upload-card-header">
                          <span className="wz-upload-card-icon">{doc.icon}</span>
                          <label className="wz-label wz-label--upload">{doc.label} <span className="wz-req">*</span></label>
                        </div>
                        <div className="wz-custom-file">
                          <input
                            type="file"
                            id={`file-${doc.field}`}
                            accept={doc.accept}
                            onChange={(e) => handleFileChange(doc.field as any, e.target.files?.[0] || null)}
                            className="wz-file-input-hidden"
                          />
                          <label htmlFor={`file-${doc.field}`} className="wz-file-label">
                            <span className="wz-file-button">Pilih file</span>
                            <span className="wz-file-name">
                              {fileNames[doc.field] || 'Tidak ada file dipilih'}
                            </span>
                          </label>
                          <div className="wz-input-glow" />
                        </div>
                      </div>
                    ))}

                    {/* Video link */}
                    <div className="wz-field">
                      <label className="wz-label">Link Video Portofolio / Rencana Proyek <span className="wz-req">*</span></label>
                      <div className={`wz-input-wrap ${focusedField === 'video_link' ? 'focused' : ''}`}>
                        <div className="wz-input-icon">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                          </svg>
                        </div>
                        <input
                          type="url"
                          className="wz-input wz-input--icon"
                          value={formData.video_link}
                          onChange={(e) => updateField('video_link', e.target.value)}
                          onFocus={() => setFocusedField('video_link')}
                          onBlur={() => setFocusedField(null)}
                          placeholder="https://youtu.be/..."
                        />
                        <div className="wz-input-glow" />
                      </div>
                    </div>

                    {/* Summary brief */}
                    <div className="wz-upload-card">
                      <div className="wz-upload-card-header">
                        <span className="wz-upload-card-icon">📄</span>
                        <label className="wz-label wz-label--upload">Summary Brief Konsep Proyek <span className="wz-req">*</span></label>
                      </div>
                      <div className="wz-custom-file">
                        <input
                          type="file"
                          id="file-summary_brief"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileChange('summary_brief', e.target.files?.[0] || null)}
                          className="wz-file-input-hidden"
                        />
                        <label htmlFor="file-summary_brief" className="wz-file-label">
                          <span className="wz-file-button">Pilih file</span>
                          <span className="wz-file-name">
                            {fileNames.summary_brief || 'Tidak ada file dipilih'}
                          </span>
                        </label>
                        <div className="wz-input-glow" />
                      </div>
                    </div>

                    {/* KTM divider */}
                    <div className="wz-divider-row">
                      <div className="wz-divider-icon">🪪</div>
                      <span className="wz-divider-label">Foto KTM</span>
                      <div className="wz-divider-line" />
                      <span className="wz-divider-badge">3 file</span>
                    </div>

                    <div className="wz-ktm-grid">
                      {[
                        { field: 'ktm_ketua', label: 'KTM Ketua', emoji: '👑' },
                        { field: 'ktm_anggota1', label: 'KTM Anggota 1', emoji: '👤' },
                        { field: 'ktm_anggota2', label: 'KTM Anggota 2', emoji: '👤' },
                      ].map((ktm) => (
                        <div key={ktm.field} className="wz-ktm-card">
                          <div className="wz-ktm-icon-wrap">
                            {formData[ktm.field as keyof typeof formData] ? (
                              <span className="wz-ktm-check">✓</span>
                            ) : (
                              <span>{ktm.emoji}</span>
                            )}
                          </div>
                          <label className="wz-label wz-label--sm">{ktm.label} <span className="wz-req">*</span></label>
                          <div className="wz-custom-file">
                            <input
                              type="file"
                              id={`file-${ktm.field}`}
                              accept="image/jpeg,image/png"
                              onChange={(e) => handleFileChange(ktm.field as any, e.target.files?.[0] || null)}
                              className="wz-file-input-hidden"
                            />
                            <label htmlFor={`file-${ktm.field}`} className="wz-file-label wz-file-label--sm">
                              <span className="wz-file-button">Pilih file</span>
                              <span className="wz-file-name">
                                {fileNames[ktm.field] || 'Tidak ada file'}
                              </span>
                            </label>
                            <div className="wz-input-glow" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── STEP 3 — Konfirmasi ── */}
              <div
                className={`wz-step-content ${
                  stepAnimating
                    ? stepDir === 'back' ? 'wz-step--exit-right' : 'wz-step--exit-left'
                    : step === 3 ? 'wz-step--enter' : 'wz-step--hidden'
                }`}
              >
                {step === 3 && (
                  <div className="wz-confirm">
                    <div className="wz-section-header">
                      <div className="wz-section-icon">✅</div>
                      <div>
                        <div className="wz-section-label">Konfirmasi Pendaftaran</div>
                        <div className="wz-section-desc">Periksa kembali sebelum mengirimkan pendaftaran</div>
                      </div>
                    </div>

                    <div className="wz-glass-card">
                      <div className="wz-glass-card-title">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        Informasi Tim
                      </div>
                      <div className="wz-confirm-row">
                        <span className="wz-confirm-key">Nama Tim</span>
                        <span className="wz-confirm-val wz-confirm-val--highlight">{formData.team_name}</span>
                      </div>
                      <div className="wz-confirm-divider" />
                      <div className="wz-confirm-row">
                        <span className="wz-confirm-key">Institusi</span>
                        <span className="wz-confirm-val">{formData.institution || '—'}</span>
                      </div>
                      <div className="wz-confirm-divider" />
                      <div className="wz-confirm-row">
                        <span className="wz-confirm-key">Kota / Wilayah</span>
                        <span className="wz-confirm-val">{formData.city}</span>
                      </div>
                    </div>

                    <div className="wz-glass-card">
                      <div className="wz-glass-card-title">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                        Anggota Tim
                      </div>
                      {formData.members.map((m, idx) => (
                        <React.Fragment key={idx}>
                          {idx > 0 && <div className="wz-confirm-divider" />}
                          <div className="wz-member-confirm-row">
                            <div className="wz-mcr-avatar">
                              {m.position === 'ketua' ? '👑' : '👤'}
                            </div>
                            <div className="wz-mcr-info">
                              <div className="wz-mcr-name">{m.name || <span className="wz-empty">—</span>}</div>
                              <div className="wz-mcr-sub">{m.email} · NIM {m.nim}</div>
                              <div className="wz-mcr-sub">{m.faculty} — {m.study_program}</div>
                            </div>
                            <span className={`wz-mcr-badge ${m.position === 'ketua' ? 'wz-mcr-badge--ketua' : ''}`}>
                              {m.position === 'ketua' ? 'Ketua' : 'Anggota'}
                            </span>
                          </div>
                        </React.Fragment>
                      ))}
                    </div>

                    <div className="wz-glass-card">
                      <div className="wz-glass-card-title">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        Dokumen & Media
                      </div>
                      <div className="wz-confirm-row">
                        <span className="wz-confirm-key">Link Video</span>
                        <span className="wz-confirm-val wz-confirm-val--link">{formData.video_link || '—'}</span>
                      </div>
                      <div className="wz-confirm-divider" />
                      <div className="wz-doc-checklist">
                        {[
                          { key: 'hak_cipta', label: 'Hak Cipta' },
                          { key: 'komitmen', label: 'Komitmen' },
                          { key: 'rekomendasi', label: 'Rekomendasi' },
                          { key: 'summary_brief', label: 'Summary Brief' },
                          { key: 'ktm_ketua', label: 'KTM Ketua' },
                          { key: 'ktm_anggota1', label: 'KTM Anggota 1' },
                          { key: 'ktm_anggota2', label: 'KTM Anggota 2' },
                        ].map(d => (
                          <div key={d.key} className="wz-doc-check-item">
                            <span className={`wz-doc-check-dot ${formData[d.key as keyof typeof formData] ? 'ok' : 'missing'}`} />
                            <span className="wz-doc-check-label">{d.label}</span>
                            {formData[d.key as keyof typeof formData] && (
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#00c896" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="wz-warning">
                      <div className="wz-warning-icon">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                      </div>
                      <span>Data yang diisi akan diverifikasi oleh admin. Pastikan semua berkas valid dan sesuai ketentuan.</span>
                    </div>

                    <div className="wz-checkbox-stack">
                      <label className={`wz-checkbox-card ${formData.agree_privacy ? 'checked' : ''}`}>
                        <input
                          type="checkbox"
                          checked={formData.agree_privacy}
                          onChange={(e) => updateField('agree_privacy', e.target.checked)}
                        />
                        <div className="wz-checkbox-custom">
                          {formData.agree_privacy && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          )}
                        </div>
                        <span>Saya menyetujui kebijakan privasi dan pengelolaan data peserta kompetisi.</span>
                      </label>

                      <label className={`wz-checkbox-card ${formData.agree_truth ? 'checked' : ''}`}>
                        <input
                          type="checkbox"
                          checked={formData.agree_truth}
                          onChange={(e) => updateField('agree_truth', e.target.checked)}
                        />
                        <div className="wz-checkbox-custom">
                          {formData.agree_truth && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          )}
                        </div>
                        <span>Saya menyatakan seluruh data yang diinput adalah benar dan dapat dipertanggungjawabkan.</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

        {/* ── FOOTER ── */}
        {!success && (
          <div className="wz-footer">
            <button className="wz-btn-ghost" onClick={handleCancel} disabled={loading}>
              Batal
            </button>
            <div className="wz-footer-right">
              {step > 0 && (
                <button className="wz-btn-secondary" onClick={handleBack} disabled={loading}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                  Kembali
                </button>
              )}
              <button className="wz-btn-primary" onClick={handleNext} disabled={loading}>
                {loading ? (
                  <span className="wz-spinner-wrap">
                    <span className="wz-spinner" />
                    Memproses…
                  </span>
                ) : step === 3 ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Daftarkan Tim
                  </>
                ) : (
                  <>
                    Lanjutkan
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="btn-arrow-svg">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        /* ── OVERLAY (tanpa bubbles, glassmorphism) ── */
        .wz-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
          opacity: 0;
          transition: opacity 0.38s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .wz-overlay--in {
          opacity: 1;
        }

        /* ── MODAL (glassmorphism utama) ── */
        .wz-modal {
          position: relative;
          z-index: 1;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-radius: 28px;
          width: 100%;
          max-width: 680px;
          max-height: 88vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow:
            0 0 0 1px rgba(255, 255, 255, 0.3),
            0 4px 6px rgba(0, 30, 90, 0.06),
            0 20px 40px rgba(0, 30, 90, 0.18),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
          transform: scale(0.93) translateY(16px);
          opacity: 0;
          transition:
            transform 0.42s cubic-bezier(0.34, 1.48, 0.64, 1),
            opacity 0.32s ease;
        }
        .wz-modal--in {
          transform: scale(1) translateY(0);
          opacity: 1;
        }

        /* ── HEADER ── */
        .wz-header {
          position: relative;
          padding: 1.4rem 1.5rem 0;
          border-bottom: 1px solid rgba(0, 119, 255, 0.1);
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(8px);
          flex-shrink: 0;
        }
        .wz-header-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 1.1rem;
          position: relative;
          z-index: 1;
        }
        .wz-brand {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }
        .wz-brand-ring {
          position: relative;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(0, 119, 255, 0.15), rgba(0, 212, 255, 0.1));
          border: 1.5px solid rgba(0, 119, 255, 0.2);
        }
        .wz-brand-ring::before {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 1px solid rgba(0, 119, 255, 0.12);
          animation: wz-ring-pulse 2.4s ease-in-out infinite;
        }
        @keyframes wz-ring-pulse {
          0%,100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.18); opacity: 0; }
        }
        .wz-brand-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0077ff, #00d4ff);
          box-shadow: 0 2px 8px rgba(0, 119, 255, 0.45);
        }
        .wz-brand-text {
          display: flex;
          flex-direction: column;
          gap: 0.05rem;
        }
        .wz-title {
          font-family: 'Clash Display', 'Plus Jakarta Sans', sans-serif;
          font-size: 1.05rem;
          font-weight: 800;
          color: #0a1628;
          line-height: 1.2;
          letter-spacing: -0.02em;
        }
        .wz-subtitle {
          font-size: 0.68rem;
          font-weight: 600;
          color: #4a6fa5;
          letter-spacing: 0.01em;
        }
        .wz-close {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 1.5px solid rgba(0, 0, 0, 0.09);
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #4a6fa5;
          transition: all 0.22s cubic-bezier(0.34, 1.52, 0.64, 1);
          flex-shrink: 0;
        }
        .wz-close:hover:not(:disabled) {
          background: rgba(239, 68, 68, 0.08);
          border-color: rgba(239, 68, 68, 0.25);
          color: #dc2626;
          transform: rotate(90deg) scale(1.1);
        }
        .wz-close:disabled { opacity: 0.4; cursor: not-allowed; }

        /* Progress Bar Improved */
        .wz-progress-track {
          height: 4px;
          background: rgba(0, 119, 255, 0.08);
          border-radius: 99px;
          margin-bottom: 1rem;
          overflow: hidden;
          position: relative;
          z-index: 1;
        }
        .wz-progress-fill {
          height: 100%;
          border-radius: 99px;
          background: linear-gradient(90deg, #0077ff 0%, #00aaff 40%, #00d4ff 70%, #00c896 100%);
          background-size: 250% 100%;
          transition: width 0.55s cubic-bezier(0.34, 1.52, 0.64, 1);
          animation: wz-shimmer 2.8s linear infinite;
          position: relative;
        }
        .wz-progress-glow {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 12px;
          background: rgba(255, 255, 255, 0.7);
          border-radius: 50%;
          filter: blur(4px);
          animation: wz-glow-move 2.8s linear infinite;
        }
        @keyframes wz-shimmer {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
        @keyframes wz-glow-move {
          0% { opacity: 0.4; }
          50% { opacity: 1; }
          100% { opacity: 0.4; }
        }

        /* Step Pills Improved */
        .wz-steps {
          display: flex;
          gap: 0.4rem;
          padding-bottom: 1rem;
          flex-wrap: wrap;
          position: relative;
          z-index: 1;
        }
        .wz-step-pill {
          display: flex;
          align-items: center;
          gap: 0.38rem;
          padding: 0.28rem 0.65rem 0.28rem 0.3rem;
          border-radius: 99px;
          border: 1.5px solid rgba(0, 0, 0, 0.07);
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(6px);
          transition: all 0.3s cubic-bezier(0.34, 1.52, 0.64, 1);
        }
        .wz-step-pill.active {
          border-color: rgba(0, 119, 255, 0.4);
          background: rgba(0, 119, 255, 0.1);
          box-shadow: 0 2px 12px rgba(0, 119, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8);
        }
        .wz-step-pill.done {
          border-color: rgba(0, 200, 150, 0.3);
          background: rgba(0, 200, 150, 0.08);
          box-shadow: 0 2px 8px rgba(0, 200, 150, 0.1);
        }
        .wz-step-num {
          width: 20px; height: 20px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.62rem; font-weight: 800;
          background: rgba(0, 0, 0, 0.06);
          color: #4a6fa5;
          transition: all 0.3s;
        }
        .wz-step-pill.active .wz-step-num {
          background: linear-gradient(135deg, #0077ff, #00d4ff);
          color: white;
          box-shadow: 0 2px 10px rgba(0, 119, 255, 0.4);
        }
        .wz-step-pill.done .wz-step-num {
          background: linear-gradient(135deg, #00c896, #00d4ff);
          color: white;
          box-shadow: 0 2px 8px rgba(0, 200, 150, 0.35);
        }
        .wz-step-label {
          font-size: 0.72rem; font-weight: 700;
          color: #4a6fa5;
          letter-spacing: 0.01em;
        }
        .wz-step-pill.active .wz-step-label { color: #0077ff; }
        .wz-step-pill.done .wz-step-label { color: #00a876; }

        /* ── BODY ── */
        .wz-body {
          flex: 1;
          overflow-y: auto;
          padding: 1.4rem 1.5rem;
          scroll-behavior: smooth;
        }
        .wz-body::-webkit-scrollbar { width: 4px; }
        .wz-body::-webkit-scrollbar-track {
          background: rgba(0, 119, 255, 0.04);
          border-radius: 10px;
        }
        .wz-body::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(0, 119, 255, 0.2), rgba(0, 212, 255, 0.2));
          border-radius: 10px;
        }

        /* Step Transitions */
        .wz-step-wrapper { position: relative; }
        .wz-step-content {
          transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.22s ease;
        }
        .wz-step--enter { transform: translateX(0); opacity: 1; }
        .wz-step--hidden { display: none; }
        .wz-step--exit-left { transform: translateX(-28px); opacity: 0; pointer-events: none; }
        .wz-step--exit-right { transform: translateX(28px); opacity: 0; pointer-events: none; }

        /* Form Base */
        .wz-form { display: flex; flex-direction: column; gap: 0.9rem; }

        .wz-section-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.2rem;
          padding: 0.85rem 1rem;
          background: rgba(0, 119, 255, 0.05);
          backdrop-filter: blur(4px);
          border: 1px solid rgba(0, 119, 255, 0.1);
          border-radius: 16px;
        }
        .wz-section-icon {
          font-size: 1.4rem;
          line-height: 1;
        }
        .wz-section-label {
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.09em;
          color: #1e3a5f;
        }
        .wz-section-desc {
          font-size: 0.72rem;
          color: #4a6fa5;
          margin-top: 0.1rem;
        }

        .wz-field { display: flex; flex-direction: column; gap: 0.32rem; }
        .wz-label {
          font-size: 0.76rem;
          font-weight: 700;
          color: #1e3a5f;
          letter-spacing: 0.01em;
        }
        .wz-optional {
          font-size: 0.68rem;
          font-weight: 500;
          color: #8ca8cc;
          margin-left: 3px;
        }
        .wz-req { color: #ef4444; margin-left: 2px; }

        /* Input Wrap */
        .wz-input-wrap {
          position: relative;
          border-radius: 13px;
        }
        .wz-input-icon {
          position: absolute;
          left: 0.85rem;
          top: 50%;
          transform: translateY(-50%);
          color: #8ca8cc;
          z-index: 2;
          display: flex;
          align-items: center;
          pointer-events: none;
          transition: color 0.2s;
        }
        .wz-input-wrap.focused .wz-input-icon { color: #0077ff; }

        .wz-input {
          width: 100%;
          padding: 0.7rem 0.9rem;
          border: 1.5px solid rgba(0, 0, 0, 0.1);
          border-radius: 13px;
          font-size: 0.85rem;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #0a1628;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(4px);
          transition: all 0.22s ease;
          outline: none;
          position: relative;
          z-index: 1;
        }
        .wz-input--icon { padding-left: 2.5rem; }
        .wz-input::placeholder { color: #b8cde4; }

        .wz-input-wrap.focused .wz-input {
          border-color: #0077ff;
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 0 0 0 3px rgba(0, 119, 255, 0.1), 0 2px 8px rgba(0, 119, 255, 0.08);
        }
        .wz-input-glow {
          position: absolute;
          inset: 0;
          border-radius: 13px;
          background: radial-gradient(ellipse at 25% 0%, rgba(0, 119, 255, 0.07), transparent 70%);
          opacity: 0;
          transition: opacity 0.22s;
          pointer-events: none;
          z-index: 0;
        }
        .wz-input-wrap.focused .wz-input-glow { opacity: 1; }

        .wz-field-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
        }

        /* Info Card */
        .wz-info-card {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.75rem 1rem;
          background: rgba(0, 119, 255, 0.08);
          backdrop-filter: blur(4px);
          border: 1px solid rgba(0, 119, 255, 0.12);
          border-radius: 13px;
          font-size: 0.75rem;
          color: #1e3a5f;
          line-height: 1.4;
        }
        .wz-info-card-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0077ff, #00d4ff);
          flex-shrink: 0;
        }

        /* Custom File Input (Glassmorphism) */
        .wz-custom-file {
          position: relative;
          margin-top: 0.25rem;
        }
        .wz-file-input-hidden {
          position: absolute;
          width: 0.1px;
          height: 0.1px;
          opacity: 0;
          overflow: hidden;
          z-index: -1;
        }
        .wz-file-label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0.75rem;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(4px);
          border: 1.5px solid rgba(0, 0, 0, 0.08);
          border-radius: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .wz-file-label:hover {
          border-color: rgba(0, 119, 255, 0.3);
          background: rgba(255, 255, 255, 0.85);
        }
        .wz-file-button {
          background: linear-gradient(135deg, #0077ff, #00aaff);
          color: white;
          padding: 0.3rem 0.9rem;
          border-radius: 40px;
          font-size: 0.75rem;
          font-weight: 700;
          white-space: nowrap;
        }
        .wz-file-name {
          font-size: 0.75rem;
          color: #4a6fa5;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .wz-file-label--sm .wz-file-button {
          padding: 0.2rem 0.7rem;
          font-size: 0.7rem;
        }
        .wz-file-label--sm .wz-file-name {
          font-size: 0.7rem;
        }

        /* Member Blocks */
        .wz-member-block {
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(4px);
          border: 1.5px solid rgba(0, 119, 255, 0.1);
          border-radius: 18px;
          padding: 1rem 1rem 0.9rem;
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
          transition: all 0.2s;
        }
        .wz-member-block:hover {
          border-color: rgba(0, 119, 255, 0.2);
          box-shadow: 0 4px 16px rgba(0, 119, 255, 0.08);
        }
        .wz-member-block--ketua {
          border-color: rgba(0, 119, 255, 0.2);
          background: rgba(0, 119, 255, 0.05);
        }
        .wz-member-header {
          display: flex;
          align-items: center;
          gap: 0.55rem;
        }
        .wz-member-avatar {
          width: 34px; height: 34px;
          border-radius: 50%;
          background: rgba(0, 119, 255, 0.1);
          border: 1.5px solid rgba(0, 119, 255, 0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.9rem;
        }
        .wz-member-meta {
          display: flex; align-items: center; gap: 0.45rem; flex: 1;
        }
        .wz-member-title {
          font-size: 0.78rem; font-weight: 700; color: #1e3a5f;
        }
        .wz-member-badge {
          font-size: 0.6rem; font-weight: 800;
          text-transform: uppercase; letter-spacing: 0.05em;
          padding: 0.1rem 0.45rem;
          border-radius: 99px;
        }
        .wz-member-badge--ketua {
          color: #0060cc;
          background: rgba(0, 119, 255, 0.12);
          border: 1px solid rgba(0, 119, 255, 0.2);
        }
        .wz-member-fields { display: flex; flex-direction: column; gap: 0.45rem; }

        /* Upload Cards */
        .wz-upload-card {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          padding: 0.85rem 1rem;
          background: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(4px);
          border: 1.5px solid rgba(0, 0, 0, 0.08);
          border-radius: 16px;
          transition: all 0.2s;
        }
        .wz-upload-card:hover {
          border-color: rgba(0, 119, 255, 0.2);
          background: rgba(255, 255, 255, 0.7);
        }
        .wz-upload-card-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .wz-upload-card-icon { font-size: 1rem; }

        /* Divider */
        .wz-divider-row {
          display: flex; align-items: center; gap: 0.55rem; margin: 0.2rem 0;
        }
        .wz-divider-icon { font-size: 0.95rem; }
        .wz-divider-label {
          font-size: 0.68rem; font-weight: 800;
          text-transform: uppercase; letter-spacing: 0.09em;
          color: #4a6fa5; white-space: nowrap;
        }
        .wz-divider-line { flex: 1; height: 1px; background: linear-gradient(90deg, rgba(0, 119, 255, 0.15), transparent); }
        .wz-divider-badge {
          font-size: 0.63rem; font-weight: 800;
          color: #0077ff;
          background: rgba(0, 119, 255, 0.08);
          border: 1px solid rgba(0, 119, 255, 0.15);
          padding: 0.12rem 0.45rem;
          border-radius: 99px;
        }

        /* KTM Grid */
        .wz-ktm-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.55rem;
        }
        .wz-ktm-card {
          display: flex; flex-direction: column; gap: 0.3rem;
          padding: 0.75rem 0.7rem;
          background: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(4px);
          border: 1.5px solid rgba(0, 0, 0, 0.08);
          border-radius: 14px;
          transition: all 0.2s;
        }
        .wz-ktm-card:hover {
          border-color: rgba(0, 119, 255, 0.2);
          background: rgba(255, 255, 255, 0.7);
        }
        .wz-ktm-icon-wrap {
          width: 32px; height: 32px;
          border-radius: 50%;
          background: rgba(0, 119, 255, 0.08);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.85rem; margin-bottom: 0.1rem;
        }
        .wz-ktm-check {
          font-size: 0.9rem;
          color: #00c896;
          font-weight: 800;
        }

        /* Glass Cards (Confirm Step) */
        .wz-glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(0, 119, 255, 0.1);
          border-radius: 18px;
          padding: 1rem 1.1rem;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          box-shadow: 0 2px 12px rgba(0, 30, 90, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }
        .wz-glass-card-title {
          display: flex; align-items: center; gap: 0.45rem;
          font-size: 0.68rem; font-weight: 800;
          text-transform: uppercase; letter-spacing: 0.08em;
          color: #4a6fa5;
          padding-bottom: 0.4rem;
          border-bottom: 1px solid rgba(0, 119, 255, 0.1);
        }
        .wz-confirm { display: flex; flex-direction: column; gap: 0.85rem; }
        .wz-confirm-row {
          display: flex; justify-content: space-between; align-items: baseline;
          gap: 0.8rem;
        }
        .wz-confirm-divider {
          height: 1px;
          background: linear-gradient(90deg, rgba(0, 119, 255, 0.07), transparent);
        }
        .wz-confirm-key {
          font-size: 0.72rem; font-weight: 600; color: #8ca8cc;
          white-space: nowrap;
        }
        .wz-confirm-val {
          font-size: 0.84rem; font-weight: 500; color: #1e3a5f;
          text-align: right; word-break: break-all;
        }
        .wz-confirm-val--highlight {
          font-family: 'Clash Display', 'Plus Jakarta Sans', sans-serif;
          font-weight: 800;
          font-size: 0.9rem;
          background: linear-gradient(135deg, #0077ff, #00c896);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .wz-confirm-val--link {
          font-size: 0.75rem;
          color: #0077ff;
          word-break: break-all;
        }
        .wz-empty { color: #b8cde4; font-style: italic; }

        /* Member Confirm Rows */
        .wz-member-confirm-row {
          display: flex; align-items: flex-start; gap: 0.65rem;
        }
        .wz-mcr-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          background: rgba(0, 119, 255, 0.08);
          border: 1.5px solid rgba(0, 119, 255, 0.12);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.9rem; flex-shrink: 0;
        }
        .wz-mcr-info { flex: 1; }
        .wz-mcr-name { font-size: 0.82rem; font-weight: 700; color: #0a1628; }
        .wz-mcr-sub { font-size: 0.68rem; color: #4a6fa5; margin-top: 0.1rem; }
        .wz-mcr-badge {
          font-size: 0.63rem; font-weight: 700;
          padding: 0.15rem 0.5rem; border-radius: 99px;
          background: rgba(0, 119, 255, 0.08);
          color: #4a6fa5; flex-shrink: 0;
        }
        .wz-mcr-badge--ketua {
          background: rgba(0, 119, 255, 0.15);
          color: #0060cc;
        }

        /* Doc Checklist */
        .wz-doc-checklist {
          display: flex; flex-wrap: wrap; gap: 0.35rem 0.6rem;
        }
        .wz-doc-check-item {
          display: flex; align-items: center; gap: 0.3rem;
          font-size: 0.7rem; color: #4a6fa5;
        }
        .wz-doc-check-dot {
          width: 6px; height: 6px; border-radius: 50%;
        }
        .wz-doc-check-dot.ok { background: #00c896; }
        .wz-doc-check-dot.missing { background: #e2eaf4; }
        .wz-doc-check-label { font-weight: 600; }

        /* Warning */
        .wz-warning {
          display: flex; align-items: flex-start; gap: 0.55rem;
          font-size: 0.74rem; color: #7c5e0e;
          line-height: 1.45;
          background: rgba(255, 248, 230, 0.9);
          backdrop-filter: blur(4px);
          border: 1px solid rgba(245, 158, 11, 0.2);
          padding: 0.7rem 0.9rem;
          border-radius: 14px;
        }
        .wz-warning-icon {
          flex-shrink: 0; margin-top: 1px;
          color: #d97706;
        }

        /* Checkboxes */
        .wz-checkbox-stack { display: flex; flex-direction: column; gap: 0.5rem; }
        .wz-checkbox-card {
          display: flex; align-items: flex-start; gap: 0.65rem;
          padding: 0.8rem 1rem;
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(6px);
          border: 1.5px solid rgba(0, 119, 255, 0.1);
          border-radius: 14px;
          font-size: 0.78rem; color: #1e3a5f;
          cursor: pointer;
          transition: all 0.2s;
          line-height: 1.45;
        }
        .wz-checkbox-card input[type="checkbox"] { display: none; }
        .wz-checkbox-card:hover { border-color: rgba(0, 119, 255, 0.2); background: rgba(240, 247, 255, 0.7); }
        .wz-checkbox-card.checked {
          border-color: rgba(0, 119, 255, 0.3);
          background: rgba(0, 119, 255, 0.08);
          box-shadow: 0 2px 12px rgba(0, 119, 255, 0.08);
        }
        .wz-checkbox-custom {
          width: 18px; height: 18px; flex-shrink: 0;
          border-radius: 6px;
          border: 2px solid rgba(0, 119, 255, 0.3);
          background: rgba(255, 255, 255, 0.8);
          display: flex; align-items: center; justify-content: center;
          transition: all 0.18s;
          margin-top: 1px;
        }
        .wz-checkbox-card.checked .wz-checkbox-custom {
          background: linear-gradient(135deg, #0077ff, #00aaff);
          border-color: transparent;
          box-shadow: 0 2px 8px rgba(0, 119, 255, 0.4);
        }

        /* Error & Success */
        .wz-error {
          display: flex; align-items: center; gap: 0.55rem;
          background: rgba(254, 226, 226, 0.85);
          backdrop-filter: blur(6px);
          border: 1px solid rgba(252, 165, 165, 0.5);
          color: #be123c;
          padding: 0.65rem 0.9rem;
          border-radius: 13px;
          font-size: 0.78rem; font-weight: 600;
          margin-bottom: 1rem;
          animation: wz-shake 0.38s cubic-bezier(0.36, 0.07, 0.19, 0.97);
        }
        @keyframes wz-shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-7px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(3px); }
        }

        /* Success Screen */
        .wz-success {
          display: flex; flex-direction: column; align-items: center;
          padding: 3rem 1.5rem 2.5rem;
          gap: 0.85rem;
          animation: wz-pop 0.55s cubic-bezier(0.34, 1.52, 0.64, 1);
        }
        @keyframes wz-pop {
          from { transform: scale(0.82); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .wz-success-rings {
          position: relative;
          width: 80px; height: 80px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 0.25rem;
        }
        .wz-success-ring {
          position: absolute;
          border-radius: 50%;
          border: 2px solid rgba(0, 200, 150, 0.25);
          animation: wz-ring-expand 2s ease-out infinite;
        }
        .wz-success-ring--1 { inset: 0; animation-delay: 0s; }
        .wz-success-ring--2 { inset: -10px; animation-delay: 0.3s; opacity: 0.6; }
        .wz-success-ring--3 { inset: -20px; animation-delay: 0.6s; opacity: 0.3; }
        @keyframes wz-ring-expand {
          0% { transform: scale(0.9); opacity: 1; }
          100% { transform: scale(1.3); opacity: 0; }
        }
        .wz-success-icon {
          position: relative; z-index: 1;
          width: 80px; height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00c896 0%, #00aaff 50%, #0077ff 100%);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 28px rgba(0, 200, 150, 0.4), 0 2px 8px rgba(0, 119, 255, 0.2);
        }
        .wz-success-title {
          font-family: 'Clash Display', 'Plus Jakarta Sans', sans-serif;
          font-size: 1.3rem; font-weight: 800;
          color: #0a1628; letter-spacing: -0.02em;
        }
        .wz-success-sub { font-size: 0.83rem; color: #4a6fa5; text-align: center; }
        .wz-success-redirect {
          display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
          margin-top: 0.2rem;
        }
        .wz-redirect-bar {
          width: 140px; height: 3px;
          border-radius: 99px;
          background: rgba(0, 119, 255, 0.1);
          overflow: hidden;
          position: relative;
        }
        .wz-redirect-bar::after {
          content: '';
          position: absolute;
          left: -100%;
          top: 0; bottom: 0;
          width: 100%;
          background: linear-gradient(90deg, #0077ff, #00d4ff, #00c896);
          border-radius: 99px;
          animation: wz-redirect-fill 2.1s ease forwards;
        }
        @keyframes wz-redirect-fill {
          to { left: 0; }
        }
        .wz-success-redirect span { font-size: 0.72rem; color: #8ca8cc; }

        /* Footer */
        .wz-footer {
          padding: 1rem 1.5rem 1.3rem;
          display: flex; justify-content: space-between; align-items: center;
          border-top: 1px solid rgba(0, 119, 255, 0.07);
          background: rgba(250, 252, 255, 0.8);
          backdrop-filter: blur(8px);
          flex-shrink: 0;
        }
        .wz-footer-right { display: flex; align-items: center; gap: 0.55rem; }

        .wz-btn-ghost {
          background: transparent; border: none;
          font-weight: 700; font-size: 0.8rem;
          color: #4a6fa5; cursor: pointer;
          padding: 0.45rem 0.6rem;
          border-radius: 10px;
          transition: all 0.18s;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .wz-btn-ghost:hover:not(:disabled) {
          color: #dc2626;
          background: rgba(239, 68, 68, 0.07);
        }
        .wz-btn-ghost:disabled { opacity: 0.4; cursor: not-allowed; }

        .wz-btn-secondary {
          display: flex; align-items: center; gap: 0.35rem;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(6px);
          border: 1.5px solid rgba(0, 119, 255, 0.2);
          border-radius: 40px;
          padding: 0.6rem 1.1rem;
          font-weight: 700; font-size: 0.78rem;
          color: #0060cc; cursor: pointer;
          transition: all 0.22s;
          font-family: 'Plus Jakarta Sans', sans-serif;
          box-shadow: 0 1px 4px rgba(0, 119, 255, 0.08);
        }
        .wz-btn-secondary:hover:not(:disabled) {
          background: rgba(0, 119, 255, 0.1);
          border-color: rgba(0, 119, 255, 0.4);
          transform: translateX(-2px);
          box-shadow: 0 2px 10px rgba(0, 119, 255, 0.15);
        }
        .wz-btn-secondary:disabled { opacity: 0.4; cursor: not-allowed; }

        .wz-btn-primary {
          display: flex; align-items: center; gap: 0.45rem;
          background: linear-gradient(135deg, #0055cc 0%, #0077ff 40%, #00aaff 75%, #00d4ff 100%);
          background-size: 220% 100%;
          border: none; border-radius: 40px;
          padding: 0.65rem 1.3rem;
          font-weight: 800; font-size: 0.82rem;
          color: white; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          box-shadow:
            0 4px 14px rgba(0, 119, 255, 0.38),
            0 1px 3px rgba(0, 119, 255, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
          transition: all 0.28s cubic-bezier(0.34, 1.52, 0.64, 1);
          position: relative;
          overflow: hidden;
        }
        .wz-btn-primary::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), transparent);
          border-radius: 40px;
        }
        .wz-btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 119, 255, 0.5), 0 2px 6px rgba(0, 119, 255, 0.25);
          background-position: 100% 0;
        }
        .wz-btn-primary:active:not(:disabled) {
          transform: translateY(0px) scale(0.98);
        }
        .wz-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-arrow-svg { transition: transform 0.2s; }
        .wz-btn-primary:hover:not(:disabled) .btn-arrow-svg {
          transform: translateX(3px);
        }

        .wz-spinner-wrap { display: flex; align-items: center; gap: 0.5rem; }
        .wz-spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: wz-spin 0.7s linear infinite;
        }
        @keyframes wz-spin { to { transform: rotate(360deg); } }

        /* Responsive */
        @media (max-width: 640px) {
          .wz-modal { max-height: 93vh; border-radius: 24px; }
          .wz-header { padding: 1.1rem 1.15rem 0; }
          .wz-body { padding: 1.1rem 1.15rem; }
          .wz-footer { padding: 0.8rem 1.15rem 1.1rem; }
          .wz-field-row { grid-template-columns: 1fr; }
          .wz-ktm-grid { grid-template-columns: 1fr; }
          .wz-confirm-row { flex-direction: column; gap: 0.1rem; }
          .wz-confirm-val { text-align: left; }
          .wz-steps { gap: 0.25rem; }
          .wz-step-label { display: none; }
          .wz-step-pill { padding: 0.28rem 0.3rem; }
          .wz-title { font-size: 0.95rem; }
          .wz-subtitle { display: none; }
          .wz-file-label { flex-wrap: wrap; }
          .wz-file-button { white-space: nowrap; }
        }

        @media (prefers-reduced-motion: reduce) {
          .wz-brand-ring::before, .wz-progress-fill,
          .wz-success-ring, .wz-redirect-bar::after {
            animation: none;
          }
          .wz-step-content, .wz-modal, .wz-overlay {
            transition-duration: 0.01ms;
          }
        }
      `}</style>
    </div>
  );
}