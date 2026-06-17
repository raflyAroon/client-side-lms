# Logic Flow — LMS Hackathon MPR RI
> Frontend → Backend → Database

---

## Keputusan Desain

`teams.selection_status` menggunakan expand enum sebagai state machine linear di satu kolom, bukan join ke tabel `stages`. Alasannya: status tim bersifat sekuensial dan tidak pernah mundur, sehingga cukup dicek dari satu field tanpa JOIN. `selection_results` tetap dipakai untuk menyimpan rekam jejak hasil review per stage oleh admin.

`submission_files.file_type` tetap berisi `file` atau `link` karena maknanya adalah tipe media (apakah upload file atau input URL), bukan kategori project.

`submissions.project_type` menggunakan nilai sesuai requirement: `AI Application`, `Game Dev`, `Video Animation`.

Kolom `shirt_size` ditambahkan di `team_members` dengan nilai nullable. Pengisiannya dilakukan saat peserta mengkonfirmasi di sidebar Status Tim ketika status tim adalah `lolos_seleksi`.

Logbook dibedakan via kolom `submission_category` di `submission_files` dengan nilai `logbook_1`, `logbook_2`, atau `final_submission`. Logbook hanya ada pada stage hackathon first half.

---

## Database Schema Changes (Migration Required)

### ALTER `teams.selection_status`
```sql
ALTER TABLE public.teams DROP CONSTRAINT teams_selection_status_check;

ALTER TABLE public.teams
ADD CONSTRAINT teams_selection_status_check
CHECK (selection_status IN (
  'pending',
  'lolos_seleksi',
  'follow_the_bootcamp',
  'first_half_hackathon',
  'semi_final',
  'final',
  'rejected'
));
```

### ALTER `team_members` — tambah shirt_size
```sql
ALTER TABLE public.team_members
ADD COLUMN shirt_size character varying(10) DEFAULT NULL;
-- Nilai yang valid: XS | S | M | L | XL | XXL
```

### ALTER `submissions.project_type`
```sql
ALTER TABLE public.submissions DROP CONSTRAINT submissions_project_type_check;

ALTER TABLE public.submissions
ADD CONSTRAINT submissions_project_type_check
CHECK (project_type IN ('AI Application', 'Game Dev', 'Video Animation'));
```

### ALTER `submission_files` — tambah submission_category
```sql
ALTER TABLE public.submission_files
ADD COLUMN submission_category character varying(50) DEFAULT 'final_submission';

ALTER TABLE public.submission_files
ADD CONSTRAINT submission_files_category_check
CHECK (submission_category IN ('logbook_1', 'logbook_2', 'final_submission'));
```

---

## Enum Reference

### teams.selection_status
`pending` → `lolos_seleksi` → `follow_the_bootcamp` → `first_half_hackathon` → `semi_final` → `final`
Bisa juga berakhir ke `rejected` dari status manapun kecuali `final`.

### submissions.status
`draft` → `submitted` → `under_review` → `approved` → `rejected`

### submissions.project_type
`AI Application` | `Game Dev` | `Video Animation`

### submission_files.file_type
`file` | `link`

### submission_files.submission_category
`logbook_1` | `logbook_2` | `final_submission`

### team_members.position
`ketua` | `anggota1` | `anggota2`

### team_members.shirt_size (nullable)
`XS` | `S` | `M` | `L` | `XL` | `XXL`

### team_documents.type
`hak_cipta` | `komitmen` | `rekomendasi` | `video_link` | `summary_brief` | `ktm_ketua` | `ktm_anggota1` | `ktm_anggota2`

### announcements.type
`global` | `stage` | `team`

### users.role
`admin` | `juri` | `peserta`

---

## State Machine: teams.selection_status

```
[Registrasi Tim + Upload Dokumen]
        │
        ▼
    pending          ← default saat tim berhasil submit registrasi
        │
        │  Admin klik "Approved" pada halaman review tim
        ▼
  lolos_seleksi      ← peserta melihat notifikasi di Sidebar Status
        │               peserta klik tombol Confirm + mengisi shirt size tiap member
        │  Sistem update otomatis setelah peserta konfirmasi
        ▼
follow_the_bootcamp  ← peserta melihat notifikasi di Sidebar Status
        │               peserta klik tombol Confirm + memilih project_type tim
        │  Sistem update otomatis setelah peserta konfirmasi
        ▼
first_half_hackathon ← Sidebar Hackathon aktif
        │               peserta mengisi Logbook 1, Logbook 2, Final Submission
        │  Admin review submission → klik Approved
        ▼
   semi_final        ← Sidebar Hackathon menampilkan form Semi-Final
        │               peserta mengisi Semi-Final Submission
        │  Admin review submission → klik Approved
        ▼
    final            ← Sidebar Hackathon menampilkan form Final
                        peserta mengisi Final Submission

Dari status manapun (kecuali final), admin bisa klik Rejected:
        │  Admin klik "Rejected"
        ▼
   rejected
```

---

## 1. Landing Page

```
Frontend                     Backend                          Database
────────                     ───────                          ────────

GET /api/faqs            →   FaqController@index          →   SELECT * FROM faqs
                                                               ORDER BY display_order ASC

GET /api/announcements   →   AnnouncementController@index →   SELECT * FROM announcements
                                                               WHERE type = 'global'
                                                               AND published_at <= NOW()

GET /api/events          →   EventController@index        →   SELECT * FROM events
                                                               ORDER BY start_date ASC

GET /api/schedules       →   ScheduleController@index     →   SELECT sc.*, e.name as event_name
                                                               FROM schedules sc
                                                               JOIN events e ON e.id = sc.event_id
                                                               ORDER BY sc.date_time ASC
```

---

## 2. Module Authentication

### 2.1 Registrasi + OTP ✅ Done

```
Frontend                     Backend                          Database
────────                     ───────                          ────────

POST /api/auth/register
{
  name,
  email,
  password,
  password_confirmation
}                        →   AuthController@register

                             1. Validasi input (semua required,
                                password min 8 karakter)
                             2. Cek email belum terdaftar    →   SELECT FROM users WHERE email = ?
                             3. Hash password dengan bcrypt
                             4. Buat user baru               →   INSERT INTO users
                                                                  (name, email, password_hash, role='peserta')
                             5. Generate OTP 6 digit (random)
                             6. Simpan OTP                   →   INSERT INTO otps
                                                                  (user_id, code, expires_at = NOW()+10menit)
                             7. Kirim email berisi kode OTP
                         ←   Response 201: { message: "Kode OTP telah dikirim ke email" }


POST /api/auth/verify-otp
{
  email,
  code
}                        →   AuthController@verifyOtp

                             1. Cari OTP valid               →   SELECT FROM otps
                                                                  WHERE user_id = (SELECT id FROM users WHERE email = ?)
                                                                  AND code = ?
                                                                  AND is_used = false
                                                                  AND expires_at > NOW()
                             2. Tandai OTP sudah dipakai     →   UPDATE otps SET is_used = true WHERE id = ?
                             3. Buat token autentikasi       →   INSERT INTO personal_access_tokens
                             4. Catat aktivitas login        →   INSERT INTO audit_logs
                                                                  (user_id, action='register', entity_type='users')
                         ←   Response 200: { token, user: { id, name, email, role } }

                         Frontend menyimpan token:
                         localStorage → key: auth_token
                         Cookie       → key: auth_token (httpOnly)
```

### 2.2 Login ✅ Done

```
Frontend                     Backend                          Database
────────                     ───────                          ────────

POST /api/auth/login
{
  email,
  password
}                        →   AuthController@login

                             1. Cari user by email           →   SELECT FROM users WHERE email = ?
                             2. Verifikasi password (bcrypt compare)
                             3. Buat token                   →   INSERT INTO personal_access_tokens
                             4. Catat aktivitas              →   INSERT INTO audit_logs (action='login')
                         ←   Response 200: { token, user: { id, name, role } }

                         Frontend redirect berdasarkan role:
                           peserta → /dashboard/peserta
                           admin   → /dashboard/admin
                           juri    → /dashboard/juri
```

### 2.3 Forgot Password ⏳ Belum Implementasi

```
POST /api/auth/forgot-password
{ email }                →   Kirim link reset ke email
                         →   INSERT INTO password_reset_tokens (email, token, expires_at)

POST /api/auth/reset-password
{ token, password }      →   Validasi token belum expired
                         →   UPDATE users SET password_hash = ? WHERE email = ?
                         →   DELETE FROM password_reset_tokens WHERE token = ?
```

### 2.4 Remember Me ⏳ Belum Implementasi

```
Saat login dengan remember_me = true:
Token expiry diperpanjang dari default (1 hari) menjadi 30 hari.
Cookie disimpan dengan maxAge = 30 hari.
```

---

## 3. Module Peserta — Dashboard

Dashboard peserta terdiri dari 3 sidebar:
- Sidebar 1: Status Tim
- Sidebar 2: Profil Tim
- Sidebar 3: Hackathon (submissions)

---

### 3.1 Registrasi Tim + Upload Dokumen ✅ Done

```
Frontend                     Backend                          Database
────────                     ───────                          ────────

POST /api/teams/register
(multipart/form-data)
{
  team_name,
  institution,
  city,
  members: [
    {
      name, email, phone,
      nim, faculty,
      study_program,
      position         ← ketua | anggota1 | anggota2
    }
  ],
  documents: {
    hak_cipta     : File,
    komitmen      : File,
    rekomendasi   : File,
    video_link    : "https://...",
    summary_brief : File,
    ktm_ketua     : File,
    ktm_anggota1  : File,
    ktm_anggota2  : File
  }
}                        →   TeamController@register

                             1. Validasi auth middleware (role: peserta)
                             2. Cek user belum punya tim     →   SELECT FROM teams WHERE ketua_id = user_id
                             3. Buat tim baru                →   INSERT INTO teams
                                                                  (team_name, institution, city,
                                                                   ketua_id, selection_status='pending')
                             4. Buat 3 team_members          →   INSERT INTO team_members x3
                                                                  (team_id, name, email, phone,
                                                                   nim, faculty, study_program, position)
                             5. Upload file dokumen ke storage
                             6. Simpan setiap dokumen        →   INSERT INTO team_documents
                                                                  (team_id, type, file_name, file_path,
                                                                   file_url, mime_type, file_size)
                                Untuk video_link (bukan file):
                                                             →   INSERT INTO team_documents
                                                                  (team_id, type='video_link',
                                                                   external_link='https://...',
                                                                   file_path=NULL)
                             7. Catat log                    →   INSERT INTO audit_logs
                         ←   Response 201: { team_id, message: "Registrasi tim berhasil" }
```

---

### 3.2 Sidebar 1 — Status Tim ⏳ Belum Implementasi

Sidebar ini adalah pusat informasi status perkembangan tim dan tempat peserta melakukan konfirmasi lanjut tahap. Semua aksi konfirmasi peserta terjadi di sini.

#### Load Data Status

```
Frontend                     Backend                          Database
────────                     ───────                          ────────

GET /api/peserta/team/status
                         →   PesertaController@teamStatus

                             1. Ambil tim milik user         →   SELECT t.*
                                                                  FROM teams t
                                                                  WHERE t.ketua_id = user_id
                             2. Ambil data members           →   SELECT * FROM team_members WHERE team_id = ?
                         ←   Response 200:
                             {
                               team: {
                                 id, team_name,
                                 selection_status,
                                 selection_note
                               },
                               members: [
                                 { id, name, position, shirt_size }
                               ]
                             }

Frontend menampilkan pesan dinamis berdasarkan selection_status:

  pending              → "Tim kamu sedang dalam proses review oleh panitia."
                          (tidak ada tombol aksi)

  lolos_seleksi        → "Selamat! Tim kamu dinyatakan lolos seleksi dokumen."
                          Tampilkan: form isi shirt size + tombol "Konfirmasi Lanjut"

  follow_the_bootcamp  → "Tim kamu telah terdaftar untuk mengikuti Bootcamp."
                          Tampilkan: form pilih project_type + tombol "Konfirmasi Lanjut"

  first_half_hackathon → "Tim kamu telah memasuki tahap Hackathon."
                          (tidak ada tombol konfirmasi, peserta langsung ke Sidebar Hackathon)

  semi_final           → "Selamat! Tim kamu lolos ke babak Semi-Final."
                          (tidak ada tombol konfirmasi, form ada di Sidebar Hackathon)

  final                → "Selamat! Tim kamu lolos ke babak Final."
                          (tidak ada tombol konfirmasi, form ada di Sidebar Hackathon)

  rejected             → "Mohon maaf, tim kamu tidak lolos seleksi."
                          Tampilkan catatan: selection_note dari admin
```

#### Konfirmasi Lolos Seleksi — Isi Shirt Size

Ditampilkan ketika `selection_status = 'lolos_seleksi'`.

```
Frontend                     Backend                          Database
────────                     ───────                          ────────

POST /api/peserta/team/confirm-lolos-seleksi
{
  members: [
    { member_id: 1, shirt_size: "M" },
    { member_id: 2, shirt_size: "L" },
    { member_id: 3, shirt_size: "XL" }
  ]
}                        →   PesertaController@confirmLolosSeleksi

                             1. Validasi auth + team status = 'lolos_seleksi'
                             2. Update shirt_size tiap member →   UPDATE team_members
                                                                  SET shirt_size = ?
                                                                  WHERE id = ? AND team_id = ?
                                                                  (dijalankan 3x untuk tiap member)
                             3. Update status tim             →   UPDATE teams
                                                                  SET selection_status = 'follow_the_bootcamp'
                                                                  WHERE id = ?
                             4. Catat log                    →   INSERT INTO audit_logs
                         ←   Response 200: { message: "Konfirmasi berhasil, selamat mengikuti Bootcamp!" }
```

#### Konfirmasi Follow The Bootcamp — Pilih Project Type

Ditampilkan ketika `selection_status = 'follow_the_bootcamp'`.

```
Frontend                     Backend                          Database
────────                     ───────                          ────────

POST /api/peserta/team/confirm-bootcamp
{
  project_type: "AI Application" | "Game Dev" | "Video Animation",
  description: "..."
}                        →   PesertaController@confirmBootcamp

                             1. Validasi auth + team status = 'follow_the_bootcamp'
                             2. Ambil stage hackathon aktif  →   SELECT id FROM stages
                                                                  WHERE name ILIKE '%hackathon%'
                                                                  AND is_active = true
                                                                  LIMIT 1
                             3. Buat submission hackathon    →   INSERT INTO submissions
                                                                  (team_id, stage_id,
                                                                   project_type, description,
                                                                   status='draft')
                             4. Update status tim            →   UPDATE teams
                                                                  SET selection_status = 'first_half_hackathon'
                                                                  WHERE id = ?
                             5. Catat log                    →   INSERT INTO audit_logs
                         ←   Response 200:
                             {
                               message: "Konfirmasi berhasil!",
                               submission_id: <id submission yang baru dibuat>
                             }
```

---

### 3.3 Sidebar 2 — Profil Tim ⏳ Belum Implementasi

```
Frontend                     Backend                          Database
────────                     ───────                          ────────

GET /api/peserta/team/profile
                         →   PesertaController@teamProfile

                             1. Ambil data tim               →   SELECT * FROM teams WHERE ketua_id = user_id
                             2. Ambil team_members           →   SELECT * FROM team_members WHERE team_id = ?
                             3. Ambil team_documents         →   SELECT * FROM team_documents WHERE team_id = ?
                             4. Ambil data user (ketua)      →   SELECT id, name, email FROM users WHERE id = ?
                         ←   Response 200:
                             {
                               team: { team_name, institution, city, selection_status },
                               members: [
                                 {
                                   id, name, email, phone,
                                   nim, faculty, study_program,
                                   position, shirt_size
                                 }
                               ],
                               documents: [
                                 {
                                   type, file_name,
                                   file_url, external_link,
                                   is_verified
                                 }
                               ]
                             }
```

---

### 3.4 Sidebar 3 — Hackathon (Submissions) ⏳ Belum Implementasi

Sidebar ini hanya tampil dan bisa diakses apabila `selection_status` adalah `first_half_hackathon`, `semi_final`, atau `final`.

Halaman ini memiliki tiga bagian utama yang ditampilkan secara berurutan dari atas ke bawah:

Bagian pertama adalah **Hackathon First Half** — selalu tampil selama status `first_half_hackathon` ke atas.
Bagian kedua adalah **Semi-Final** — baru tampil ketika status sudah `semi_final` atau `final`.
Bagian ketiga adalah **Final** — baru tampil ketika status sudah `final`.

#### Load Data Submissions

```
Frontend                     Backend                          Database
────────                     ───────                          ────────

GET /api/peserta/submissions
                         →   SubmissionController@index

                             SELECT s.id, s.stage_id, s.project_type,
                                    s.status, s.submitted_at,
                                    sf.id as file_id, sf.file_url,
                                    sf.file_name, sf.file_type,
                                    sf.external_url, sf.submission_category
                             FROM submissions s
                             LEFT JOIN submission_files sf ON sf.submission_id = s.id
                             WHERE s.team_id = ?
                             ORDER BY s.stage_id ASC
                         ←   Response 200:
                             {
                               project_type: "AI Application",
                               submissions: [
                                 {
                                   id, stage_id, status, submitted_at,
                                   files: [
                                     {
                                       submission_category,
                                       file_url, file_name,
                                       file_type, external_url
                                     }
                                   ]
                                 }
                               ]
                             }
```

#### Upload File ke Submission (Logbook & Final Submission)

```
Frontend                     Backend                          Database
────────                     ───────                          ────────

POST /api/peserta/submissions/{submission_id}/files
(multipart/form-data)
{
  submission_category : "logbook_1" | "logbook_2" | "final_submission",
  file_type           : "file" | "link",
  file                : File   (jika file_type = "file"),
  external_url        : "https://..."  (jika file_type = "link")
}                        →   SubmissionController@uploadFile

                             1. Validasi auth + submission milik tim ini
                             →   SELECT FROM submissions WHERE id = ? AND team_id = ?
                             2. Jika file_type = "file": upload ke storage
                             3. Simpan record file           →   INSERT INTO submission_files
                                                                  (submission_id, file_url, file_name,
                                                                   file_size, mime_type, file_path,
                                                                   file_type, external_url,
                                                                   submission_category)
                         ←   Response 201:
                             {
                               file_id,
                               file_url,
                               message: "File berhasil diunggah"
                             }
```

#### Submit Final (Mengunci Submission)

Setelah semua file diunggah, peserta klik tombol "Kumpulkan".

```
Frontend                     Backend                          Database
────────                     ───────                          ────────

POST /api/peserta/submissions/{submission_id}/submit
                         →   SubmissionController@submit

                             1. Validasi submission masih berstatus 'draft'
                             2. Validasi file wajib sudah ada
                                (berdasarkan project_type):

                                AI Application wajib punya:
                                  final_submission dengan source_code (file/link)
                                  final_submission dengan video_demo (link)
                                  final_submission dengan hosting_url (link)

                                Game Dev wajib punya:
                                  final_submission dengan source_code_link (link)
                                  final_submission dengan build_file (file .application)
                                  final_submission dengan video_demo (link)

                                Video Animation wajib punya:
                                  final_submission dengan video_file (file .mp4)
                                  final_submission dengan video_demo (link)

                             3. Update status submission     →   UPDATE submissions
                                                                  SET status = 'submitted',
                                                                      submitted_at = NOW()
                                                                  WHERE id = ?
                             4. Catat log                    →   INSERT INTO audit_logs
                         ←   Response 200: { message: "Submission berhasil dikumpulkan" }
```

#### Catatan Template per Project Type

**AI Application** membutuhkan 3 file pada `final_submission`:
Upload folder source code (zip/winrar) atau input link repo GitHub, input link video presentasi/live demo (YouTube/GDrive), dan input link hosting/deployment.

**Game Dev** membutuhkan 3 file pada `final_submission`:
Input link source code (GitHub), upload build file berekstensi `.application`, dan input link video presentasi/live demo.

**Video Animation** membutuhkan 2 file pada `final_submission`:
Upload file video project berformat `.MP4` dan input link video presentasi/live demo.

Logbook (hanya untuk Hackathon First Half):
Logbook 1 dan Logbook 2 masing-masing berisi input link dan upload file PDF.

#### Submit Semi-Final

Guard: `selection_status = 'semi_final'`. Flow sama persis dengan submit final submission di Hackathon First Half. `stage_id` merujuk ke stage semi-final.

#### Submit Final

Guard: `selection_status = 'final'`. Flow sama persis. `stage_id` merujuk ke stage final.

---

### 3.5 Update Profil User + Tim ⏳ Belum Implementasi

```
Frontend                     Backend                          Database
────────                     ───────                          ────────

PUT /api/peserta/profile
{
  name, email, phone
}                        →   UPDATE users SET name=?, email=?, ... WHERE id = user_id

PUT /api/peserta/team
{
  team_name,
  institution,
  city,
  members: [
    { id, name, email, phone, nim, faculty, study_program }
  ]
}                        →   UPDATE teams SET ... WHERE id = ?
                         →   UPDATE team_members SET ... WHERE id = ? (per member)
                         →   INSERT INTO team_histories (team_id, snapshot_data, changed_by)
```

---

## 4. Module Admin

### 4.1 List Seluruh Tim ⏳ Belum Implementasi

```
Frontend                     Backend                          Database
────────                     ───────                          ────────

GET /api/admin/teams
?status=pending&page=1   →   AdminController@listTeams

                             SELECT t.id, t.team_name, t.institution,
                                    t.selection_status, t.created_at,
                                    u.name AS ketua_name
                             FROM teams t
                             JOIN users u ON u.id = t.ketua_id
                             WHERE t.selection_status = ?     ← opsional, bisa tanpa filter
                             ORDER BY t.created_at DESC
                             LIMIT 20 OFFSET ?
                         ←   Response 200:
                             {
                               data: [
                                 { id, team_name, ketua_name, selection_status, created_at }
                               ],
                               meta: { total, page, per_page, last_page }
                             }
```

---

### 4.2 View Detail Tim + Approve/Reject (Status: pending) ⏳ Belum Implementasi

```
Frontend                     Backend                          Database
────────                     ───────                          ────────

GET /api/admin/teams/{id}
                         →   AdminController@showTeam

                             1. Ambil data tim               →   SELECT * FROM teams WHERE id = ?
                             2. Ambil members                →   SELECT * FROM team_members WHERE team_id = ?
                             3. Ambil dokumen                →   SELECT * FROM team_documents WHERE team_id = ?
                             4. Ambil user ketua             →   SELECT id, name, email FROM users WHERE id = ?
                         ←   Response 200: { team, members, documents }

                         Frontend: setiap file dibuka di new tab via window.open(file_url)
                         Untuk external_link (video): window.open(external_link)


POST /api/admin/teams/{id}/approve
{ note: "..." }          →   AdminController@approveTeam

                             1. Validasi team status = 'pending'
                             2. Simpan hasil seleksi         →   INSERT INTO selection_results
                                                                  (team_id, stage_id,
                                                                   is_passed=true, note,
                                                                   announced_at=NOW())
                             3. Update status tim            →   UPDATE teams
                                                                  SET selection_status='lolos_seleksi',
                                                                      selection_note=?,
                                                                      selection_processed_at=NOW()
                             4. Kirim notifikasi ke tim      →   INSERT INTO announcements
                                                                  (target_team_id, type='team',
                                                                   title='Hasil Seleksi Tim',
                                                                   published_at=NOW())
                             5. Catat log                    →   INSERT INTO audit_logs
                         ←   Response 200: { message: "Tim berhasil disetujui" }


POST /api/admin/teams/{id}/reject
{ note: "alasan penolakan..." }
                         →   AdminController@rejectTeam

                             1. Validasi team status = 'pending'
                             2. Simpan hasil seleksi         →   INSERT INTO selection_results
                                                                  (is_passed=false, note)
                             3. Update status tim            →   UPDATE teams
                                                                  SET selection_status='rejected',
                                                                      selection_note=?
                             4. Catat log                    →   INSERT INTO audit_logs
                         ←   Response 200: { message: "Tim ditolak" }
```

---

### 4.3 View Submissions Tim + Review ⏳ Belum Implementasi

Digunakan ketika status tim sudah `follow_the_bootcamp` ke atas.

```
Frontend                     Backend                          Database
────────                     ───────                          ────────

GET /api/admin/teams/{id}/submissions
                         →   AdminController@teamSubmissions

                             SELECT s.id, s.project_type, s.status, s.submitted_at,
                                    st.name as stage_name, st.stage_order,
                                    sf.id as file_id, sf.file_url, sf.file_name,
                                    sf.file_type, sf.external_url, sf.submission_category
                             FROM submissions s
                             JOIN stages st ON st.id = s.stage_id
                             LEFT JOIN submission_files sf ON sf.submission_id = s.id
                             WHERE s.team_id = ?
                             ORDER BY st.stage_order ASC
                         ←   Response 200:
                             {
                               team: { id, team_name, selection_status },
                               submissions: [
                                 {
                                   id, stage_name, project_type, status, submitted_at,
                                   files: [
                                     {
                                       submission_category, file_url,
                                       file_name, file_type, external_url
                                     }
                                   ]
                                 }
                               ]
                             }

                         Frontend: file dibuka di new tab, link dibuka langsung.


PATCH /api/admin/submissions/{id}/review
{
  action : "approved" | "rejected",
  note   : "..."
}                        →   AdminController@reviewSubmission

                             1. Update status submission     →   UPDATE submissions
                                                                  SET status = 'under_review'
                                                                  saat admin pertama kali membuka
                             2. Simpan hasil review          →   INSERT INTO selection_results
                                                                  (team_id, stage_id,
                                                                   is_passed = action === 'approved',
                                                                   note)
                             3. Update status submission     →   UPDATE submissions
                                                                  SET status = 'approved' | 'rejected'
                             4. Jika approved, update status tim berdasarkan stage:
                                stage = first_half_hackathon →   UPDATE teams SET selection_status='semi_final'
                                stage = semi_final           →   UPDATE teams SET selection_status='final'
                             5. Kirim notifikasi ke tim      →   INSERT INTO announcements
                                                                  (target_team_id, type='team')
                             6. Catat log                    →   INSERT INTO audit_logs
                         ←   Response 200: { message: "Review berhasil disimpan" }
```

---

## 5. Middleware & Guards (Backend)

```php
// Proteksi endpoint berdasarkan role
Route::middleware(['auth:sanctum', 'role:peserta'])->group(function () {
    // Semua endpoint /api/peserta/*
});

Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    // Semua endpoint /api/admin/*
});

// CheckTeamStatus middleware
// Digunakan untuk memastikan selection_status tim sesuai sebelum aksi diizinkan.
// Contoh: endpoint submit logbook hanya boleh diakses jika status = 'first_half_hackathon'
// Contoh: endpoint confirm-lolos-seleksi hanya jika status = 'lolos_seleksi'
```

---

## 6. Feature Status Summary

✅ Done
- Landing page: FAQ, Announcement, Event, Schedule
- Registrasi peserta + OTP verification via email
- Login + redirect by role
- Registrasi Tim + Upload Dokumen

⏳ Belum Implementasi
- Forgot Password
- Remember Me
- Sidebar 1 — Status Tim (load status + pesan dinamis)
- Sidebar 1 — Konfirmasi lolos_seleksi (isi shirt size per member)
- Sidebar 1 — Konfirmasi follow_the_bootcamp (pilih project_type)
- Sidebar 2 — Profil Tim (view data tim, member, dokumen)
- Sidebar 3 — Hackathon: Form Hackathon First Half (logbook 1, logbook 2, final submission)
- Sidebar 3 — Hackathon: Form Semi-Final Submission
- Sidebar 3 — Hackathon: Form Final Submission
- Update Profil User + Tim
- Admin: List seluruh tim dengan filter status
- Admin: View detail tim + Approve/Reject (status pending)
- Admin: View submissions tim + Review (status bootcamp ke atas)