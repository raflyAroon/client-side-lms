// components/TeamRegistrationWizardV2.tsx
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

  // Animation mount/unmount
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

  // Escape key handler
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
      if (onSuccess) onSuccess(); // optional close
    }, 350);
  };

  // Field updates
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
  };

  // Validasi per step (mengikuti logika V2)
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

  // Transisi antar step dengan animasi slide
  const transitionStep = (nextStep: number, dir: 'forward' | 'back') => {
    setStepDir(dir);
    setStepAnimating(true);
    setTimeout(() => {
      setStep(nextStep);
      setStepAnimating(false);
      if (bodyRef.current) bodyRef.current.scrollTop = 0;
    }, 260);
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

  // Submit ke backend
  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const submitData = new FormData();
      // Step 0
      submitData.append('team_name', formData.team_name);
      submitData.append('institution', formData.institution || '');
      submitData.append('city', formData.city);
      // Step 1
      formData.members.forEach((member, idx) => {
        submitData.append(`members[${idx}][name]`, member.name);
        submitData.append(`members[${idx}][email]`, member.email);
        if (member.phone) submitData.append(`members[${idx}][phone]`, member.phone);
        submitData.append(`members[${idx}][nim]`, member.nim);
        submitData.append(`members[${idx}][faculty]`, member.faculty);
        submitData.append(`members[${idx}][study_program]`, member.study_program);
        submitData.append(`members[${idx}][position]`, member.position);
      });
      // Step 2 files
      if (formData.hak_cipta) submitData.append('hak_cipta', formData.hak_cipta);
      if (formData.komitmen) submitData.append('komitmen', formData.komitmen);
      if (formData.rekomendasi) submitData.append('rekomendasi', formData.rekomendasi);
      submitData.append('video_link', formData.video_link);
      if (formData.summary_brief) submitData.append('summary_brief', formData.summary_brief);
      if (formData.ktm_ketua) submitData.append('ktm_ketua', formData.ktm_ketua);
      if (formData.ktm_anggota1) submitData.append('ktm_anggota1', formData.ktm_anggota1);
      if (formData.ktm_anggota2) submitData.append('ktm_anggota2', formData.ktm_anggota2);
      // Step 3 checkboxes
      submitData.append('agree_privacy', '1');
      submitData.append('agree_truth', '1');

      await teamService.completeRegistration(submitData);
      setSuccess(true);
      await fetchTeam(); // refresh data tim di context
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Gagal mendaftarkan tim');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen && !visible) return null;

  // Hitung progress bar berdasarkan step (0,1,2,3)
  const progressPercent = step === 0 ? 25 : step === 1 ? 50 : step === 2 ? 75 : 100;

  return (
    <div
      className={`wz-overlay ${visible ? 'wz-overlay--in' : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget && !loading) handleCancel(); }}
    >
      <div className={`wz-modal ${visible ? 'wz-modal--in' : ''}`} role="dialog" aria-modal="true" aria-label="Pendaftaran Tim">
        {/* HEADER dengan progress bar & step pills */}
        <div className="wz-header">
          <div className="wz-header-top">
            <div className="wz-brand">
              <div className="wz-brand-dot" />
              <span className="wz-title">Pendaftaran Tim Hackathon</span>
            </div>
            <button className="wz-close" onClick={handleCancel} disabled={loading} title="Tutup">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="wz-progress-track">
            <div className="wz-progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>

          <div className="wz-steps">
            {['Data Tim', 'Data Anggota', 'Dokumen', 'Konfirmasi'].map((label, i) => (
              <div key={i} className={`wz-step-pill ${step === i ? 'active' : step > i ? 'done' : ''}`}>
                <span className="wz-step-num">
                  {step > i ? (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : i + 1}
                </span>
                <span className="wz-step-label">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* BODY - Scrollable area dengan step transisi */}
        <div className="wz-body" ref={bodyRef}>
          {(error || (loading && !success)) && !success && (
            <div className="wz-error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          {success && (
            <div className="wz-success">
              <div className="wz-success-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 className="wz-success-title">Pendaftaran Berhasil!</h3>
              <p className="wz-success-sub">Tim Anda sedang diverifikasi oleh admin. Mengalihkan...</p>
            </div>
          )}

          {!success && (
            <div className="wz-step-wrapper">
              {/* STEP 0 - Data Tim */}
              <div
                className={`wz-step-content ${
                  stepAnimating
                    ? stepDir === 'forward'
                      ? 'wz-step--exit-left'
                      : 'wz-step--exit-right'
                    : step === 0
                    ? 'wz-step--enter'
                    : 'wz-step--hidden'
                }`}
              >
                {step === 0 && (
                  <div className="wz-form">
                    <div className="wz-section-label">Identitas Tim</div>
                    <div className="wz-field">
                      <label className="wz-label">
                        Nama Tim <span className="wz-req">*</span>
                      </label>
                      <div className={`wz-input-wrap ${focusedField === 'team_name' ? 'focused' : ''}`}>
                        <input
                          type="text"
                          className="wz-input"
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
                      <label className="wz-label">Institusi / Universitas</label>
                      <div className={`wz-input-wrap ${focusedField === 'institution' ? 'focused' : ''}`}>
                        <input
                          type="text"
                          className="wz-input"
                          value={formData.institution || ''}
                          onChange={(e) => updateField('institution', e.target.value)}
                          onFocus={() => setFocusedField('institution')}
                          onBlur={() => setFocusedField(null)}
                          placeholder="Nama universitas / sekolah"
                        />
                        <div className="wz-input-glow" />
                      </div>
                    </div>

                    <div className="wz-field">
                      <label className="wz-label">
                        Kota / Wilayah <span className="wz-req">*</span>
                      </label>
                      <div className={`wz-input-wrap ${focusedField === 'city' ? 'focused' : ''}`}>
                        <input
                          type="text"
                          className="wz-input"
                          value={formData.city}
                          onChange={(e) => updateField('city', e.target.value)}
                          onFocus={() => setFocusedField('city')}
                          onBlur={() => setFocusedField(null)}
                          placeholder="Contoh: Jakarta Selatan"
                        />
                        <div className="wz-input-glow" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* STEP 1 - Data Anggota (dengan NIM, Fakultas, Prodi) */}
              <div
                className={`wz-step-content ${
                  stepAnimating
                    ? stepDir === 'back'
                      ? 'wz-step--exit-right'
                      : 'wz-step--exit-left'
                    : step === 1
                    ? 'wz-step--enter'
                    : 'wz-step--hidden'
                }`}
              >
                {step === 1 && (
                  <div className="wz-form">
                    {formData.members.map((member, idx) => (
                      <div key={idx} className="wz-member-block">
                        <div className="wz-member-header">
                          <span className="wz-member-icon">
                            {member.position === 'ketua' ? '👑' : '👤'}
                          </span>
                          <span className="wz-member-title">
                            {member.position === 'ketua' ? 'Ketua Tim' : `Anggota ${idx}`}
                          </span>
                          {member.position === 'ketua' && <span className="wz-member-badge">Wajib</span>}
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

              {/* STEP 2 - Upload Dokumen & Video */}
              <div
                className={`wz-step-content ${
                  stepAnimating
                    ? stepDir === 'back'
                      ? 'wz-step--exit-right'
                      : 'wz-step--exit-left'
                    : step === 2
                    ? 'wz-step--enter'
                    : 'wz-step--hidden'
                }`}
              >
                {step === 2 && (
                  <div className="wz-form">
                    <div className="wz-section-label">Upload Dokumen Wajib</div>

                    {[
                      { field: 'hak_cipta', label: 'Surat Pernyataan Hak Cipta', accept: '.pdf,.doc,.docx' },
                      { field: 'komitmen', label: 'Surat Komitmen Keikutsertaan', accept: '.pdf,.doc,.docx' },
                      { field: 'rekomendasi', label: 'Surat Rekomendasi Universitas', accept: '.pdf,.doc,.docx' },
                    ].map((doc) => (
                      <div key={doc.field} className="wz-field doc-group">
                        <label className="wz-label">{doc.label} <span className="wz-req">*</span></label>
                        <div className={`wz-input-wrap ${focusedField === doc.field ? 'focused' : ''}`}>
                          <input
                            type="file"
                            accept={doc.accept}
                            onChange={(e) => handleFileChange(doc.field as any, e.target.files?.[0] || null)}
                            onFocus={() => setFocusedField(doc.field)}
                            onBlur={() => setFocusedField(null)}
                            className="wz-file-input"
                          />
                          <div className="wz-input-glow" />
                        </div>
                        {formData[doc.field as keyof typeof formData] && (
                          <span className="file-name">
                            📎 {(formData[doc.field as keyof typeof formData] as File).name}
                          </span>
                        )}
                      </div>
                    ))}

                    <div className="wz-field">
                      <label className="wz-label">Link Video Portofolio / Rencana Proyek <span className="wz-req">*</span></label>
                      <div className={`wz-input-wrap ${focusedField === 'video_link' ? 'focused' : ''}`}>
                        <input
                          type="url"
                          className="wz-input"
                          value={formData.video_link}
                          onChange={(e) => updateField('video_link', e.target.value)}
                          onFocus={() => setFocusedField('video_link')}
                          onBlur={() => setFocusedField(null)}
                          placeholder="https://youtu.be/..."
                        />
                        <div className="wz-input-glow" />
                      </div>
                    </div>

                    <div className="wz-field">
                      <label className="wz-label">Summary Brief Konsep Proyek (PDF) <span className="wz-req">*</span></label>
                      <div className={`wz-input-wrap ${focusedField === 'summary_brief' ? 'focused' : ''}`}>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileChange('summary_brief', e.target.files?.[0] || null)}
                          onFocus={() => setFocusedField('summary_brief')}
                          onBlur={() => setFocusedField(null)}
                          className="wz-file-input"
                        />
                        <div className="wz-input-glow" />
                      </div>
                      {formData.summary_brief && <span className="file-name">📎 {formData.summary_brief.name}</span>}
                    </div>

                    <div className="wz-divider-row">
                      <span className="wz-divider-label">Foto KTM</span>
                      <div className="wz-divider-line" />
                      <span className="wz-divider-badge">3 file</span>
                    </div>

                    {[
                      { field: 'ktm_ketua', label: 'KTM Ketua' },
                      { field: 'ktm_anggota1', label: 'KTM Anggota 1' },
                      { field: 'ktm_anggota2', label: 'KTM Anggota 2' },
                    ].map((ktm) => (
                      <div key={ktm.field} className="wz-field">
                        <label className="wz-label">{ktm.label} <span className="wz-req">*</span></label>
                        <div className={`wz-input-wrap ${focusedField === ktm.field ? 'focused' : ''}`}>
                          <input
                            type="file"
                            accept="image/jpeg,image/png"
                            onChange={(e) => handleFileChange(ktm.field as any, e.target.files?.[0] || null)}
                            onFocus={() => setFocusedField(ktm.field)}
                            onBlur={() => setFocusedField(null)}
                            className="wz-file-input"
                          />
                          <div className="wz-input-glow" />
                        </div>
                        {formData[ktm.field as keyof typeof formData] && (
                          <span className="file-name">🖼️ {(formData[ktm.field as keyof typeof formData] as File).name}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* STEP 3 - Konfirmasi & Persetujuan */}
              <div
                className={`wz-step-content ${
                  stepAnimating
                    ? stepDir === 'back'
                      ? 'wz-step--exit-right'
                      : 'wz-step--exit-left'
                    : step === 3
                    ? 'wz-step--enter'
                    : 'wz-step--hidden'
                }`}
              >
                {step === 3 && (
                  <div className="wz-confirm">
                    <p className="wz-confirm-intro">Periksa kembali data tim sebelum mengirim pendaftaran.</p>
                    <div className="wz-confirm-card">
                      <div className="wz-confirm-row">
                        <span className="wz-confirm-key">Nama Tim</span>
                        <span className="wz-confirm-val highlight">{formData.team_name}</span>
                      </div>
                      <div className="wz-confirm-row">
                        <span className="wz-confirm-key">Institusi</span>
                        <span className="wz-confirm-val">{formData.institution || '—'}</span>
                      </div>
                      <div className="wz-confirm-row">
                        <span className="wz-confirm-key">Kota</span>
                        <span className="wz-confirm-val">{formData.city}</span>
                      </div>
                    </div>

                    <div className="wz-members-confirm">
                      {formData.members.map((m, idx) => (
                        <div key={idx} className="wz-member-confirm-row">
                          <div className="wz-mcr-left">
                            <span className="wz-mcr-icon">{m.position === 'ketua' ? '👑' : '👤'}</span>
                            <div>
                              <div className="wz-mcr-name">{m.name}</div>
                              <div className="wz-mcr-email">{m.email} | NIM: {m.nim}</div>
                            </div>
                          </div>
                          <span className={`wz-mcr-badge ${m.position === 'ketua' ? 'ketua' : ''}`}>
                            {m.position === 'ketua' ? 'Ketua' : 'Anggota'}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="wz-confirm-card">
                      <div className="wz-confirm-row">
                        <span className="wz-confirm-key">Link Video</span>
                        <span className="wz-confirm-val">{formData.video_link}</span>
                      </div>
                      <div className="wz-confirm-row">
                        <span className="wz-confirm-key">Dokumen</span>
                        <span className="wz-confirm-val">
                          Hak Cipta ✓, Komitmen ✓, Rekomendasi ✓, Summary Brief ✓, 3 KTM ✓
                        </span>
                      </div>
                    </div>

                    <div className="wz-warning">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                      Data yang diisi akan diverifikasi oleh admin. Pastikan semua berkas sesuai.
                    </div>

                    <div className="wz-checkbox-group">
                      <label className="wz-checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.agree_privacy}
                          onChange={(e) => updateField('agree_privacy', e.target.checked)}
                        />
                        <span>Saya menyetujui kebijakan privasi dan pengelolaan data peserta.</span>
                      </label>
                    </div>
                    <div className="wz-checkbox-group">
                      <label className="wz-checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.agree_truth}
                          onChange={(e) => updateField('agree_truth', e.target.checked)}
                        />
                        <span>Saya menyatakan bahwa seluruh data yang diinput adalah benar dan dapat dipertanggungjawabkan.</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER dengan tombol navigasi */}
        {!success && (
          <div className="wz-footer">
            <button className="wz-btn-ghost" onClick={handleCancel} disabled={loading}>
              Batal
            </button>
            <div className="wz-footer-right">
              {step > 0 && (
                <button className="wz-btn-secondary" onClick={handleBack} disabled={loading}>
                  ← Kembali
                </button>
              )}
              <button className="wz-btn-primary" onClick={handleNext} disabled={loading}>
                {loading ? (
                  <span className="wz-spinner-wrap">
                    <span className="wz-spinner" />
                    Memproses…
                  </span>
                ) : step === 3 ? (
                  <>Daftarkan Tim <span className="btn-arrow">→</span></>
                ) : (
                  <>Lanjutkan <span className="btn-arrow">→</span></>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* GLOBAL STYLES (diambil dari V1, disesuaikan) */}
      <style jsx>{`
        /* OVERLAY */
        .wz-overlay {
          position: fixed;
          inset: 0;
          background: rgba(8, 20, 50, 0.55);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
          opacity: 0;
          transition: opacity 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .wz-overlay--in {
          opacity: 1;
        }

        /* MODAL */
        .wz-modal {
          background: #ffffff;
          border-radius: 32px;
          width: 100%;
          max-width: 720px;
          max-height: 88vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 0 0 1px rgba(0, 119, 255, 0.08), 0 32px 64px rgba(0, 30, 90, 0.22);
          transform: scale(0.94) translateY(12px);
          opacity: 0;
          transition: transform 0.38s cubic-bezier(0.34, 1.52, 0.64, 1), opacity 0.3s;
        }
        .wz-modal--in {
          transform: scale(1) translateY(0);
          opacity: 1;
        }

        /* HEADER */
        .wz-header {
          padding: 1.5rem 1.5rem 0;
          border-bottom: 1px solid rgba(0, 119, 255, 0.08);
          background: linear-gradient(180deg, #fafcff 0%, #ffffff 100%);
          flex-shrink: 0;
        }
        .wz-header-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.1rem;
        }
        .wz-brand {
          display: flex;
          align-items: center;
          gap: 0.55rem;
        }
        .wz-brand-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0077ff, #00d4ff);
          box-shadow: 0 0 0 3px rgba(0, 119, 255, 0.18);
          animation: wz-pulse 2.2s ease-in-out infinite;
        }
        @keyframes wz-pulse {
          0%, 100% { box-shadow: 0 0 0 3px rgba(0, 119, 255, 0.18); }
          50% { box-shadow: 0 0 0 6px rgba(0, 119, 255, 0.07); }
        }
        .wz-title {
          font-family: 'Clash Display', 'Plus Jakarta Sans', sans-serif;
          font-size: 1.2rem;
          font-weight: 700;
          color: #0a1628;
        }
        .wz-close {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1.5px solid rgba(0, 0, 0, 0.1);
          background: rgba(0, 0, 0, 0.03);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #4a6fa5;
          transition: all 0.2s;
        }
        .wz-close:hover:not(:disabled) {
          background: #fee2e2;
          border-color: #fca5a5;
          color: #dc2626;
          transform: rotate(90deg);
        }
        .wz-close:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .wz-progress-track {
          height: 3px;
          background: rgba(0, 119, 255, 0.08);
          border-radius: 99px;
          margin-bottom: 1.1rem;
          overflow: hidden;
        }
        .wz-progress-fill {
          height: 100%;
          border-radius: 99px;
          background: linear-gradient(90deg, #0077ff, #00d4ff, #00c896);
          background-size: 200% 100%;
          transition: width 0.5s cubic-bezier(0.34, 1.52, 0.64, 1);
          animation: wz-shimmer 2.5s linear infinite;
        }
        @keyframes wz-shimmer {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }

        .wz-steps {
          display: flex;
          gap: 0.5rem;
          padding-bottom: 1.1rem;
          flex-wrap: wrap;
        }
        .wz-step-pill {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.3rem 0.7rem 0.3rem 0.35rem;
          border-radius: 99px;
          border: 1.5px solid rgba(0, 0, 0, 0.08);
          background: transparent;
          transition: all 0.3s;
        }
        .wz-step-pill.active {
          border-color: rgba(0, 119, 255, 0.3);
          background: rgba(0, 119, 255, 0.06);
        }
        .wz-step-pill.done {
          border-color: rgba(0, 200, 150, 0.3);
          background: rgba(0, 200, 150, 0.06);
        }
        .wz-step-num {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.65rem;
          font-weight: 800;
          background: rgba(0, 0, 0, 0.06);
          color: #4a6fa5;
        }
        .wz-step-pill.active .wz-step-num {
          background: linear-gradient(135deg, #0077ff, #00d4ff);
          color: white;
          box-shadow: 0 2px 8px rgba(0, 119, 255, 0.35);
        }
        .wz-step-pill.done .wz-step-num {
          background: linear-gradient(135deg, #00c896, #00d4ff);
          color: white;
        }
        .wz-step-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #8ca8cc;
        }
        .wz-step-pill.active .wz-step-label {
          color: #0077ff;
        }
        .wz-step-pill.done .wz-step-label {
          color: #00a876;
        }

        /* BODY */
        .wz-body {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          scroll-behavior: smooth;
        }
        .wz-body::-webkit-scrollbar {
          width: 5px;
        }
        .wz-body::-webkit-scrollbar-track {
          background: rgba(0, 119, 255, 0.05);
          border-radius: 10px;
        }
        .wz-body::-webkit-scrollbar-thumb {
          background: rgba(0, 119, 255, 0.25);
          border-radius: 10px;
        }

        /* STEP TRANSITIONS */
        .wz-step-wrapper {
          position: relative;
        }
        .wz-step-content {
          transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.25s ease;
        }
        .wz-step--enter {
          transform: translateX(0);
          opacity: 1;
        }
        .wz-step--hidden {
          display: none;
        }
        .wz-step--exit-left {
          transform: translateX(-32px);
          opacity: 0;
          pointer-events: none;
        }
        .wz-step--exit-right {
          transform: translateX(32px);
          opacity: 0;
          pointer-events: none;
        }

        /* FORM ELEMENTS (dari V1) */
        .wz-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .wz-section-label {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #8ca8cc;
          margin-bottom: -0.2rem;
        }
        .wz-field {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .wz-label {
          font-size: 0.78rem;
          font-weight: 700;
          color: #1e3a5f;
        }
        .wz-req {
          color: #ef4444;
          margin-left: 2px;
        }
        .wz-input-wrap {
          position: relative;
          border-radius: 14px;
          overflow: hidden;
        }
        .wz-input, .wz-file-input {
          width: 100%;
          padding: 0.72rem 1rem;
          border: 1.5px solid #e2eaf4;
          border-radius: 14px;
          font-size: 0.88rem;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #0a1628;
          background: #fafcff;
          transition: all 0.25s;
          outline: none;
          position: relative;
          z-index: 1;
        }
        .wz-file-input {
          padding: 0.6rem 0.8rem;
          background: #fafcff;
        }
        .wz-input::placeholder, .wz-file-input::placeholder {
          color: #b0c4de;
        }
        .wz-input-wrap.focused .wz-input,
        .wz-input-wrap.focused .wz-file-input {
          border-color: #0077ff;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(0, 119, 255, 0.12);
        }
        .wz-input-glow {
          position: absolute;
          inset: 0;
          border-radius: 14px;
          background: radial-gradient(circle at 30% 20%, rgba(0,119,255,0.08), transparent);
          opacity: 0;
          transition: opacity 0.25s;
          pointer-events: none;
          z-index: 0;
        }
        .wz-input-wrap.focused .wz-input-glow {
          opacity: 1;
        }
        .file-name {
          font-size: 0.7rem;
          color: #0077ff;
          margin-top: 0.2rem;
          display: inline-block;
        }

        .wz-field-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
        }
        .wz-divider-row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin: 0.2rem 0;
        }
        .wz-divider-label {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #8ca8cc;
          white-space: nowrap;
        }
        .wz-divider-line {
          flex: 1;
          height: 1px;
          background: rgba(0, 119, 255, 0.1);
        }
        .wz-divider-badge {
          font-size: 0.65rem;
          font-weight: 700;
          color: #0077ff;
          background: rgba(0, 119, 255, 0.08);
          border: 1px solid rgba(0, 119, 255, 0.15);
          padding: 0.15rem 0.45rem;
          border-radius: 99px;
        }

        .wz-member-block {
          background: linear-gradient(135deg, #f5f9ff 0%, #f0f7ff 100%);
          border: 1px solid rgba(0, 119, 255, 0.08);
          border-radius: 20px;
          padding: 0.9rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }
        .wz-member-header {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .wz-member-icon {
          font-size: 1rem;
        }
        .wz-member-title {
          font-size: 0.8rem;
          font-weight: 700;
          color: #1e3a5f;
          flex: 1;
        }
        .wz-member-badge {
          font-size: 0.62rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #0077ff;
          background: rgba(0, 119, 255, 0.1);
          border: 1px solid rgba(0, 119, 255, 0.2);
          padding: 0.12rem 0.45rem;
          border-radius: 99px;
        }
        .wz-member-fields {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        /* CONFIRM STEP */
        .wz-confirm {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .wz-confirm-intro {
          font-size: 0.85rem;
          color: #4a6fa5;
        }
        .wz-confirm-card {
          background: linear-gradient(135deg, #f5f9ff, #f0f7ff);
          border: 1px solid rgba(0, 119, 255, 0.1);
          border-radius: 20px;
          padding: 1rem 1.1rem;
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
        }
        .wz-confirm-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 1rem;
        }
        .wz-confirm-key {
          font-size: 0.75rem;
          font-weight: 600;
          color: #8ca8cc;
        }
        .wz-confirm-val {
          font-size: 0.88rem;
          font-weight: 500;
          color: #1e3a5f;
          text-align: right;
        }
        .wz-confirm-val.highlight {
          font-family: 'Clash Display', sans-serif;
          font-weight: 700;
          background: linear-gradient(135deg, #0077ff, #00c896);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .wz-members-confirm {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .wz-member-confirm-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #f8faff;
          border: 1px solid rgba(0, 119, 255, 0.07);
          border-radius: 16px;
          padding: 0.7rem 0.9rem;
        }
        .wz-mcr-left {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex: 1;
        }
        .wz-mcr-icon {
          font-size: 1.1rem;
        }
        .wz-mcr-name {
          font-size: 0.85rem;
          font-weight: 700;
          color: #0a1628;
        }
        .wz-mcr-email {
          font-size: 0.72rem;
          color: #8ca8cc;
        }
        .wz-mcr-badge {
          font-size: 0.65rem;
          font-weight: 700;
          padding: 0.18rem 0.55rem;
          border-radius: 99px;
          background: rgba(0, 119, 255, 0.08);
          color: #4a6fa5;
        }
        .wz-mcr-badge.ketua {
          background: linear-gradient(135deg, rgba(0,119,255,0.12), rgba(0,212,255,0.08));
          color: #0060cc;
        }
        .wz-warning {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.75rem;
          color: #92710a;
          background: linear-gradient(135deg, #fffbeb, #fef9e0);
          border: 1px solid rgba(245, 158, 11, 0.2);
          padding: 0.6rem 0.85rem;
          border-radius: 14px;
        }
        .wz-checkbox-group {
          margin: 0.5rem 0;
        }
        .wz-checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.8rem;
          color: #1e3a5f;
          cursor: pointer;
        }
        .wz-checkbox-label input {
          width: 16px;
          height: 16px;
          accent-color: #0077ff;
        }

        /* ERROR & SUCCESS */
        .wz-error {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #fff1f2;
          border: 1px solid #fecdd3;
          color: #be123c;
          padding: 0.65rem 0.85rem;
          border-radius: 14px;
          font-size: 0.8rem;
          font-weight: 500;
          margin-bottom: 1.2rem;
          animation: wz-shake 0.35s;
        }
        @keyframes wz-shake {
          0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(5px)}60%{transform:translateX(-4px)}80%{transform:translateX(3px)}
        }
        .wz-success {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2.5rem 1rem;
          gap: 0.75rem;
          animation: wz-pop 0.5s cubic-bezier(0.34, 1.52, 0.64, 1);
        }
        @keyframes wz-pop {
          from { transform: scale(0.85); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .wz-success-icon {
          width: 68px;
          height: 68px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00c896, #00d4ff);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 8px 24px rgba(0, 200, 150, 0.35);
        }
        .wz-success-title {
          font-family: 'Clash Display', sans-serif;
          font-size: 1.25rem;
          font-weight: 700;
          color: #0a1628;
        }
        .wz-success-sub {
          font-size: 0.85rem;
          color: #8ca8cc;
        }

        /* FOOTER */
        .wz-footer {
          padding: 1rem 1.5rem 1.4rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid rgba(0, 119, 255, 0.07);
          background: #fafcff;
          flex-shrink: 0;
        }
        .wz-footer-right {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }
        .wz-btn-ghost {
          background: transparent;
          border: none;
          font-weight: 600;
          color: #8ca8cc;
          cursor: pointer;
          padding: 0.4rem 0.5rem;
          border-radius: 10px;
        }
        .wz-btn-ghost:hover:not(:disabled) {
          color: #dc2626;
          background: rgba(239, 68, 68, 0.06);
        }
        .wz-btn-secondary {
          background: rgba(0, 119, 255, 0.06);
          border: 1.5px solid rgba(0, 119, 255, 0.18);
          border-radius: 40px;
          padding: 0.6rem 1.15rem;
          font-weight: 700;
          font-size: 0.8rem;
          color: #0060cc;
          cursor: pointer;
        }
        .wz-btn-secondary:hover:not(:disabled) {
          background: rgba(0, 119, 255, 0.1);
          border-color: #0077ff;
        }
        .wz-btn-primary {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          background: linear-gradient(135deg, #0077ff 0%, #00aaff 50%, #00d4ff 100%);
          background-size: 200% 100%;
          border: none;
          border-radius: 40px;
          padding: 0.65rem 1.35rem;
          font-weight: 700;
          font-size: 0.82rem;
          color: white;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(0, 119, 255, 0.38);
          transition: all 0.25s;
        }
        .wz-btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 22px rgba(0, 119, 255, 0.5);
          background-position: 100% 0;
        }
        .wz-btn-primary:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }
        .btn-arrow {
          transition: transform 0.2s;
        }
        .wz-btn-primary:hover:not(:disabled) .btn-arrow {
          transform: translateX(4px);
        }
        .wz-spinner-wrap {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .wz-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: white;
          border-radius: 50%;
          animation: wz-spin 0.7s linear infinite;
        }
        @keyframes wz-spin {
          to { transform: rotate(360deg); }
        }

        /* RESPONSIVE */
        @media (max-width: 640px) {
          .wz-modal {
            max-height: 92vh;
            border-radius: 26px;
          }
          .wz-header {
            padding: 1.2rem 1.2rem 0;
          }
          .wz-body {
            padding: 1.2rem;
          }
          .wz-footer {
            padding: 0.85rem 1.2rem 1.2rem;
          }
          .wz-field-row {
            grid-template-columns: 1fr;
          }
          .wz-confirm-row {
            flex-direction: column;
            gap: 0.15rem;
            align-items: flex-start;
          }
          .wz-confirm-val {
            text-align: left;
          }
          .wz-steps {
            gap: 0.3rem;
          }
          .wz-step-label {
            display: none;
          }
          .wz-step-pill {
            padding: 0.3rem 0.35rem;
          }
        }
      `}</style>
    </div>
  );
}