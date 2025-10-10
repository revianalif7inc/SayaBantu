// src/components/SettingsPage.tsx
import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

const useAuthHeader = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('Token tidak ditemukan di localStorage');
  }
  return { Authorization: `Bearer ${token || ''}` };
};


/* ================= tipe data ================= */
export type Service = {
  id: number;
  name: string;
  short_name?: string | null;
  slug?: string | null;
  summary?: string | null;
  description?: string | null;
  icon_type?: 'emoji' | 'svg' | 'image';
  icon_value?: string | null;
  icon_bg?: string | null;
  price_min?: number | null;
  price_unit?: string | null;
  is_popular: number;
  is_active: number;
  sort_order: number;
};

export type Email = {
  id: number;
  label: string | null;
  email: string;
  is_primary: number;
  is_active: number;
};

export type Address = {
  id: number;
  label: string | null;
  address_line: string;
  city?: string | null;
  province?: string | null;
  postal_code?: string | null;
  maps_url?: string | null;
  lat?: number | null;
  lng?: number | null;
  is_primary: number;
  is_active: number;
};

export type Social = {
  id: number;
  platform:
  | 'instagram'
  | 'facebook'
  | 'tiktok'
  | 'x'
  | 'youtube'
  | 'linkedin'
  | 'whatsapp'
  | 'other';
  handle?: string | null;
  url: string;
  icon_type?: 'iconset' | 'svg' | 'image';
  icon_value?: string | null;
  sort_order: number;
  is_active: number;
};

export type User = {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
  password?: string;
};

/* =============== helpers =============== */
const formatErr = (e: any) => {
  const s = e?.response?.status;
  const data = e?.response?.data;
  const msg =
    (data && (data.detail || data.message || data.error)) ||
    e?.message ||
    'Unknown error';
  return `(${s ?? '??'}) ${msg}`;
};

const UIStyles = () => (
  <style>{`
      :root{
        --sb-green:#10b981; --sb-green-600:#059669; --sb-green-50:#ecfdf5;
        --sb-border:#e5e7eb; --sb-text:#111827; --sb-muted:#6b7280;
        --sb-danger:#ef4444; --sb-bg:#ffffff; --sb-surface:#ffffff;
      }
      .sb-container{max-width:1100px;margin:0 auto;padding:16px}
      .sb-h1{font-size:22px;font-weight:700;margin:6px 0 16px}
      .sb-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 16px}
      .sb-tab{padding:8px 12px;border-radius:10px;border:1px solid var(--sb-border);background:#fff;
        color:var(--sb-text);font-weight:700;line-height:1}
      .sb-tab--active{background:var(--sb-green);border-color:var(--sb-green);color:#fff}
      .sb-card{border:1px solid var(--sb-border);border-radius:12px;background:var(--sb-surface);
        padding:14px}
      .sb-card + .sb-card{margin-top:16px}
      .sb-card h3{margin:0 0 10px;font-size:16px}
      .sb-row{display:flex;align-items:center;gap:8px}
      .sb-spacer{height:12px}
      .sb-btn{appearance:none;border:1px solid var(--sb-border);background:#fff;border-radius:10px;
        padding:8px 12px;font-weight:600;cursor:pointer}
      .sb-btn--primary{background:var(--sb-green);border-color:var(--sb-green);color:#fff}
      .sb-btn--danger{background:var(--sb-danger);border-color:var(--sb-danger);color:#fff}
      .sb-btn:disabled{opacity:.6;cursor:not-allowed}
      .sb-link{background:none;border:none;color:var(--sb-green-600);font-weight:700;cursor:pointer}
      .sb-link--danger{color:var(--sb-danger)}
      .sb-input, .sb-select, .sb-textarea{
        width:100%;border:1px solid var(--sb-border);border-radius:10px;padding:9px 10px;
        background:#fff;outline:none
      }
      .sb-field{display:flex;flex-direction:column;gap:6px}
      .sb-field label{font-size:12px;color:var(--sb-muted);font-weight:600}
      .sb-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
      .sb-grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}
      @media (max-width: 820px){ .sb-grid-2, .sb-grid-3{grid-template-columns:1fr} }
      .sb-table-wrap{border:1px solid var(--sb-border);border-radius:12px;overflow:auto}
      table.sb-table{width:100%;border-collapse:separate;border-spacing:0}
      .sb-table th,.sb-table td{padding:10px 12px;border-bottom:1px solid var(--sb-border);vertical-align:top}
      .sb-table th{background:var(--sb-green-50);text-align:left;position:sticky;top:0;z-index:1}
      .sb-badge{display:inline-flex;align-items:center;justify-content:center;min-width:24px;
        height:24px;border-radius:999px;border:1px solid var(--sb-border);font-size:12px}
      .sb-badge--ok{background:#ecfdf5;border-color:#bbf7d0;color:#065f46}
      .sb-url{word-break:break-all;color:#0ea5e9'}
      .sb-msg{color:#b91c1c;margin:0 0 8px}
    `}</style>
);

const TabBtn: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ active, onClick, children }) => (
  <button className={`sb-tab ${active ? 'sb-tab--active' : ''}`} onClick={onClick}>
    {children}
  </button>
);

const LinkAction: React.FC<{
  danger?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ danger, onClick, children }) => (
  <button className={`sb-link ${danger ? 'sb-link--danger' : ''}`} onClick={onClick}>
    {children}
  </button>
);

/* ================= Tabs ================= */
type TabKey = 'logo' | 'wa' | 'services' | 'emails' | 'addresses' | 'socials' | 'users';

const Tabs: React.FC<{ active: TabKey; onChange: (k: TabKey) => void }> = ({
  active,
  onChange,
}) => (
  <div className="sb-tabs">
    <TabBtn active={active === 'logo'} onClick={() => onChange('logo')}>
      Logo
    </TabBtn>
    <TabBtn active={active === 'wa'} onClick={() => onChange('wa')}>
      WhatsApp
    </TabBtn>
    <TabBtn active={active === 'services'} onClick={() => onChange('services')}>
      Layanan
    </TabBtn>
    <TabBtn active={active === 'emails'} onClick={() => onChange('emails')}>
      Email
    </TabBtn>
    <TabBtn active={active === 'addresses'} onClick={() => onChange('addresses')}>
      Alamat
    </TabBtn>
    <TabBtn active={active === 'socials'} onClick={() => onChange('socials')}>
      Sosmed
    </TabBtn>
    <TabBtn active={active === 'users'} onClick={() => onChange('users')}>
      Users
    </TabBtn>
  </div>
);

/* ================= Panel: Logo ================= */
const PanelLogo: React.FC = () => {
  const headers = useAuthHeader();
  const [currentLogo, setCurrentLogo] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState('');

  const load = async () => {
    try {
      const r = await api.get('/settings', { headers });
      setCurrentLogo(r.data.logo_url || '');
      setMsg('');
    } catch (e: any) {
      setMsg(`Gagal memuat logo ${formatErr(e)}`);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const simpan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return setMsg('Pilih file logo terlebih dahulu.');
    try {
      const fd = new FormData();
      fd.append('logo', file);
      await api.put('/settings', fd, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' },
      });
      setFile(null);
      setMsg('Logo berhasil diperbarui.');
      await load();
    } catch (e: any) {
      setMsg(`Gagal menyimpan logo ${formatErr(e)}`);
    }
  };

  const hapus = async () => {
    if (!confirm('Hapus logo utama?')) return;
    try {
      await api.delete('/settings/logo', { headers });
      await load();
    } catch (e: any) {
      setMsg(`Gagal menghapus ${formatErr(e)}`);
    }
  };

  const resolveLogoUrl = (url: string) => {
    if (!url) return '';
    // jika URL sudah absolute (http/https), gunakan langsung
    if (!url.startsWith('/uploads')) return url;

    const base = (api.defaults.baseURL ?? '').replace(/\/$/, '');
    return `${base}${url}`;
  };

  return (
    <>
      {msg && <p className="sb-msg">{msg}</p>}
      <div className="sb-card">
        <h3>Logo Saat Ini</h3>
        {currentLogo ? (
          <img src={resolveLogoUrl(currentLogo)} alt="logo" height={64} style={{ borderRadius: 8 }} />
        ) : (
          <em>- belum ada -</em>
        )}
        <div className="sb-spacer" />
        <button onClick={hapus} className="sb-btn sb-btn--danger" disabled={!currentLogo}>
          Hapus Logo
        </button>
      </div>

      <div className="sb-card">
        <h3>Ganti Logo</h3>
        <form onSubmit={simpan} className="sb-grid-2">
          <div className="sb-field" style={{ gridColumn: '1 / -1' }}>
            <label>File</label>
            <input className="sb-input" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            {file && <small style={{ color: 'var(--sb-muted)' }}>File: {file.name}</small>}
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <button className="sb-btn sb-btn--primary" type="submit">
              Simpan Logo
            </button>
          </div>
        </form>
      </div>
    </>
  );
};


/* ================= Panel: WhatsApp ================= */
const PanelWhatsApp: React.FC = () => {
  const headers = useAuthHeader();
  const [wa, setWa] = useState('');
  const [waMsg, setWaMsg] = useState('Halo, saya butuh bantuan.');
  const [current, setCurrent] = useState('');
  const [msg, setMsg] = useState('');

  const load = async () => {
    try {
      const response = await api.get('/settings', { headers });
      setCurrent(response.data.whatsapp_number || '');
      setWa(response.data.whatsapp_number || '');
      setWaMsg(response.data.whatsapp_message || 'Halo, saya butuh bantuan.');
      setMsg('');
    } catch (e: any) {
      setMsg(`Gagal memuat data: ${formatErr(e)}`);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const simpan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wa || !waMsg) {
      return setMsg('Nomor WhatsApp atau pesan tidak boleh kosong.');
    }

    try {
      const response = await api.put('/settings/whatsapp', {
        whatsapp_number: wa,
        whatsapp_message: waMsg, 
      }, { headers });


      if (response.status === 200) {
        setMsg('Pengaturan WhatsApp berhasil diperbarui.');
        await load(); // Reload data setelah berhasil menyimpan
      }
    } catch (e: any) {
      setMsg(`Gagal menyimpan pengaturan WhatsApp: ${formatErr(e)}`);
    }
  };

  const hapus = async () => {
    if (!confirm('Hapus nomor WhatsApp utama?')) return;
    try {
      await api.delete('/settings/whatsapp', { headers });
      await load();
    } catch (e: any) {
      setMsg(`Gagal menghapus: ${formatErr(e)}`);
    }
  };

  return (
    <>
      {msg && <p className="sb-msg">{msg}</p>}

      <div className="sb-card">
        <h3>Nomor & Pesan Whatsapp Saat Ini</h3>
        <p style={{ margin: 0 }}>{current || <em>- belum ada -</em>}</p>
        {/* preview pesan */}
        <p style={{ margin: 0, color: 'var(--sb-muted)' }}>
          {waMsg ? `Pesan: ${waMsg}` : ''}
        </p>
        <div className="sb-spacer" />
        <button onClick={hapus} className="sb-btn sb-btn--danger" disabled={!current}>
          Hapus Nomor WA
        </button>
      </div>

      <div className="sb-card">
        <h3>Ubah Nomor & Pesan WhatsApp</h3>
        <form onSubmit={simpan} className="sb-grid-2">
          <div className="sb-field" style={{ gridColumn: '1 / -1' }}>
            <label>Pesan default saat user klik</label>
            <textarea
              className="sb-textarea"
              rows={3}
              maxLength={500}
              value={waMsg}
              onChange={(e) => setWaMsg(e.target.value)}
              placeholder="Halo, saya butuh bantuan."
            />
            <small className="text-muted">
              Token: {`{site}`} dan {`{page}`} akan diganti otomatis saat diklik.
            </small>
          </div>

          <div className="sb-field" style={{ gridColumn: '1 / -1' }}>
            <label>Nomor WhatsApp</label>
            <input
              className="sb-input"
              type="text"
              value={wa}
              onChange={(e) => setWa(e.target.value)}
              placeholder="+628xxx"
            />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <button className="sb-btn sb-btn--primary" type="submit" disabled={!wa || !waMsg}>
              Simpan
            </button>
          </div>
        </form>
      </div>
    </>
  );
};


//===================PANEL SERVICE==================//
const PanelServices: React.FC = () => {
  const headers = useAuthHeader();
  const [rows, setRows] = useState<Service[]>([]);
  const [msg, setMsg] = useState('');

  const emptyForm: Service = {
    id: 0,
    name: '',
    short_name: '',
    slug: '',
    summary: '',
    description: '',
    icon_value: '',
    icon_type: 'image',
    icon_bg: '',
    price_min: 0,
    price_unit: '',
    is_popular: 0,
    is_active: 1,
    sort_order: 0,
  };

  const [form, setForm] = useState<Service>(emptyForm);
  const [iconFile, setIconFile] = useState<File | null>(null);

  const loadServices = async () => {
    try {
      const response = await api.get('/services', { headers });
      setRows(response.data);
      setMsg('');
    } catch (error: any) {
      setMsg(`Gagal memuat layanan ${formatErr(error)}`);
    }
  };

  useEffect(() => {
    loadServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const isCheckbox = type === 'checkbox';
    if (isCheckbox) {
      const { checked } = e.target as HTMLInputElement;
      setForm(prev => ({ ...prev, [name]: checked ? 1 : 0 }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setIconFile(file);
  };

  // simple slugify
  const slugify = (s: string) =>
    String(s || '')
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');

  // buat slug unik berdasarkan daftar rows yang sudah dimuat
  const makeUniqueSlug = (base: string, excludeId?: number) => {
    const existing = new Set(
      rows
        .filter(r => (excludeId ? r.id !== excludeId : true))
        .map(r => String(r.slug || '').toLowerCase())
    );
    if (!existing.has(base)) return base;
    // coba suffix -1, -2, ... (hingga 100), jika masih clash pakai timestamp
    for (let i = 1; i <= 100; i++) {
      const s = `${base}-${i}`;
      if (!existing.has(s)) return s;
    }
    return `${base}-${Date.now()}`;
  };

  const saveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    const formData = new FormData();

    // slug: pakai form.slug bila ada, kalau tidak generate dari name
    const baseSlug = (form.slug && String(form.slug).trim()) || slugify(String(form.name || ''));
    // pastikan uniqueness terhadap rows yang sudah dimuat (exclude current id saat edit)
    const slugValue = makeUniqueSlug(baseSlug, form.id || undefined);

    // masukkan semua field form kecuali id
    Object.keys(form).forEach((key) => {
      if (key === 'id') return;
      const value = (form as any)[key];
      if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });

    // pastikan slug ter-set (override jika ubah)
    formData.set('slug', slugValue);

    // file ikon jika ada
    if (iconFile) {
      formData.append('icon_file', iconFile);
    }

    // helper doRequest (dipakai untuk retry satu kali jika duplicate)
    const doRequest = async (attemptSlug: string) => {
      // pastikan formData memiliki slug terbaru
      formData.set('slug', attemptSlug);
      if (form.id) {
        return api.put(`/services/${form.id}`, formData, {
          headers: { ...headers, 'Content-Type': 'multipart/form-data' },
        });
      } else {
        return api.post('/services', formData, {
          headers: { ...headers, 'Content-Type': 'multipart/form-data' },
        });
      }
    };

    try {
      // pertama kali kirim dengan slugValue yang sudah unik menurut client
      await doRequest(slugValue);

      setMsg(`Layanan berhasil disimpan. (slug: ${slugValue})`);
      setForm(emptyForm);
      setIconFile(null);
      await loadServices();
    } catch (error: any) {
      console.error('saveService error', error?.response?.data || error);
      // cek apakah error duplicate slug (beberapa backend pakai message/ detail)
      const errMsgFromServer =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        '';

      const duplicateDetected =
        /duplicate entry/i.test(String(errMsgFromServer)) ||
        /uniq_service_slug/i.test(String(errMsgFromServer)) ||
        /duplicate/i.test(String(errMsgFromServer));

      if (duplicateDetected) {
        const fallbackSlug = `${slugValue}-${Date.now()}`;
        try {
          await doRequest(fallbackSlug);
          setMsg(`Layanan disimpan dengan slug baru karena bentrok: ${fallbackSlug}`);
          setForm(emptyForm);
          setIconFile(null);
          await loadServices();
          return;
        } catch (err2: any) {
          console.error('retry with fallbackSlug failed', err2?.response?.data || err2);
          setMsg(`Gagal menyimpan layanan: Duplicate slug (coba gunakan nama berbeda).`);
          return;
        }
      }

      const userMsg =
        errMsgFromServer || (error?.response ? `status ${error.response.status}` : error?.message || 'Unknown error');
      setMsg(`Gagal menyimpan layanan: ${userMsg}`);
    }
  };

  const handleEdit = (service: Service) => {
    setForm(service);
    setIconFile(null);
  };

  const handleDelete = async (id: number) => {
    if (!id) {
      setMsg('ID layanan tidak valid.');
      return;
    }

    if (!confirm('Anda yakin ingin menghapus layanan ini?')) return;

    try {
      const response = await api.delete(`/services/${id}`, { headers });

      if (response.status === 200) {
        setMsg('Layanan berhasil dihapus.');
        await loadServices();
      } else {
        setMsg('Gagal menghapus layanan. Coba lagi.');
      }
    } catch (error: any) {
      if (error?.response?.status === 404) {
        setMsg('Layanan tidak ditemukan.');
      } else {
        setMsg(`Gagal menghapus layanan ${formatErr(error)}`);
      }
    }
  };

  return (
    <>
      {msg && <p className="sb-msg">{msg}</p>}

      <div className="sb-table-wrap">
        <table className="sb-table">
          <thead>
            <tr>
              <th>Nama Layanan</th>
              <th>Ringkasan</th>
              <th style={{ textAlign: 'center' }}>Populer</th>
              <th style={{ textAlign: 'center' }}>Aktif</th>
              <th style={{ textAlign: 'center' }}>Urutan</th>
              <th style={{ textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((service) => (
              <tr key={service.id}>
                <td>{service.name}</td>
                <td>{service.summary}</td>
                <td style={{ textAlign: 'center' }}>
                  {service.is_popular ? <span className="sb-badge sb-badge--ok">✓</span> : '-'}
                </td>
                <td style={{ textAlign: 'center' }}>
                  {service.is_active ? <span className="sb-badge sb-badge--ok">✓</span> : '-'}
                </td>
                <td style={{ textAlign: 'center' }}>{service.sort_order}</td>
                <td style={{ textAlign: 'center' }}>
                  <LinkAction onClick={() => handleEdit(service)}>Edit</LinkAction>{' '}
                  <LinkAction danger onClick={() => handleDelete(service.id)}>Hapus</LinkAction>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 14 }}>
                  Belum ada data layanan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="sb-card">
        <h3>{form.id ? `Edit Layanan #${form.id}` : 'Tambah Layanan Baru'}</h3>
        <form onSubmit={saveService}>
          <div className="sb-grid-2">
            <div className="sb-field">
              <label>Nama Layanan</label>
              <input className="sb-input" type="text" name="name" value={form.name} onChange={handleInputChange} required />
            </div>
            <div className="sb-field">
              <label>Ringkasan (Summary)</label>
              <input className="sb-input" type="text" name="summary" value={form.summary || ''} onChange={handleInputChange} />
            </div>
            <div className="sb-field">
              <label>Ikon (File Gambar)</label>
              <input className="sb-input" type="file" accept="image/*" onChange={handleFileChange} />
              {iconFile && <small style={{ color: 'var(--sb-muted)' }}>File baru: {iconFile.name}</small>}
              {!iconFile && form.icon_value && <small style={{ color: 'var(--sb-muted)' }}>Ikon saat ini: {form.icon_value}</small>}
            </div>
            <div className="sb-field">
              <label>Icon Background</label>
              <input className="sb-input" type="text" name="icon_bg" value={form.icon_bg || ''} onChange={handleInputChange} />
            </div>
            <div className="sb-field">
              <label>Urutan Tampil</label>
              <input className="sb-input" type="number" name="sort_order" value={form.sort_order} onChange={handleInputChange} />
            </div>
          </div>

          <div className="sb-row" style={{ marginTop: 12, gap: 16 }}>
            <label className="sb-row">
              <input type="checkbox" name="is_active" checked={form.is_active === 1} onChange={handleInputChange} /> Aktif
            </label>
            <label className="sb-row">
              <input type="checkbox" name="is_popular" checked={form.is_popular === 1} onChange={handleInputChange} /> Populer
            </label>
          </div>

          <div className="sb-spacer" />
          <button className="sb-btn sb-btn--primary" type="submit">
            {form.id ? 'Simpan Perubahan' : 'Tambah Layanan'}
          </button>
          {form.id !== 0 && (
            <button
              className="sb-btn"
              type="button"
              style={{ marginLeft: 8 }}
              onClick={() => { setForm(emptyForm); setIconFile(null); }}
            >
              Batal
            </button>
          )}
        </form>
      </div>
    </>
  );
};


/* ================= Panel: Emails ================= */
const PanelEmails: React.FC = () => {
  const headers = useAuthHeader();
  const [rows, setRows] = useState<Email[]>([]);
  const [form, setForm] = useState<Email>({ id: 0, label: 'umum', email: '', is_primary: 0, is_active: 1 });
  const [msg, setMsg] = useState('');

  const load = async () => {
    try {
      const r = await api.get('/emails', { headers });
      setRows(r.data);
      setMsg('');
    } catch (e: any) {
      setMsg(`Gagal memuat email ${formatErr(e)}`);
    }
  };
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (form.id) await api.put(`/emails/${form.id}`, form, { headers });
      else await api.post('/emails', form, { headers });
      setForm({ id: 0, label: 'umum', email: '', is_primary: 0, is_active: 1 });
      await load();
    } catch (e: any) {
      setMsg(`Gagal simpan email ${formatErr(e)}`);
    }
  };
  const edit = (r: Email) => setForm({ ...r });
  const del = async (id: number) => {
    if (!confirm('Hapus email?')) return;
    try {
      await api.delete(`/emails/${id}`, { headers });
      await load();
    } catch (e: any) {
      setMsg(`Gagal hapus email ${formatErr(e)}`);
    }
  };

  return (
    <>
      {msg && <p className="sb-msg">{msg}</p>}
      <div className="sb-table-wrap">
        <table className="sb-table">
          <thead>
            <tr>
              <th>Label</th>
              <th>Email</th>
              <th style={{ textAlign: 'center' }}>Primary</th>
              <th style={{ textAlign: 'center' }}>Aktif</th>
              <th style={{ textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.label}</td>
                <td>{r.email}</td>
                <td style={{ textAlign: 'center' }}>{r.is_primary ? <span className="sb-badge sb-badge--ok">✓</span> : '-'}</td>
                <td style={{ textAlign: 'center' }}>{r.is_active ? <span className="sb-badge sb-badge--ok">✓</span> : '-'}</td>
                <td style={{ textAlign: 'center' }}>
                  <LinkAction onClick={() => edit(r)}>Edit</LinkAction>{' '}
                  <LinkAction danger onClick={() => del(r.id)}>Hapus</LinkAction>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 14 }}>
                  Belum ada data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="sb-card">
        <h3>{form.id ? `Edit #${form.id}` : 'Tambah Email'}</h3>
        <form onSubmit={save}>
          <div className="sb-grid-3">
            <div className="sb-field">
              <label>Label</label>
              <input className="sb-input" value={form.label || ''} onChange={(e) => setForm({ ...form, label: e.target.value })} />
            </div>
            <div className="sb-field">
              <label>Email</label>
              <input className="sb-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="sb-field">
              <label>Primary</label>
              <input type="checkbox" checked={!!form.is_primary} onChange={(e) => setForm({ ...form, is_primary: e.target.checked ? 1 : 0 })} />
            </div>
          </div>
          <div className="sb-row" style={{ marginTop: 8 }}>
            <label className="sb-row">
              <input type="checkbox" checked={!!form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked ? 1 : 0 })} /> Aktif
            </label>
          </div>
          <div className="sb-spacer" />
          <button className="sb-btn sb-btn--primary" type="submit">{form.id ? 'Simpan' : 'Tambah'}</button>
          {!!form.id && (
            <button className="sb-btn" type="button" style={{ marginLeft: 8 }} onClick={() => setForm({ id: 0, label: 'umum', email: '', is_primary: 0, is_active: 1 })}>Batal</button>
          )}
        </form>
      </div>
    </>
  );
};

/* ================= Panel: Addresses ================= */
const PanelAddresses: React.FC = () => {
  const headers = useAuthHeader();
  const [rows, setRows] = useState<Address[]>([]);
  const [msg, setMsg] = useState('');
  const empty: Address = { id: 0 as any, label: 'kantor', address_line: '', is_primary: 0, is_active: 1 };
  const [form, setForm] = useState<Address>(empty);

  const load = async () => {
    try {
      const r = await api.get('/addresses', { headers });
      setRows(r.data);
      setMsg('');
    } catch (e: any) {
      setMsg(`Gagal memuat alamat ${formatErr(e)}`);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (form.id) await api.put(`/addresses/${form.id}`, form, { headers });
      else await api.post('/addresses', form, { headers });
      setForm(empty);
      await load();
    } catch (e: any) {
      setMsg(`Gagal simpan alamat ${formatErr(e)}`);
    }
  };
  const edit = (r: Address) => setForm({ ...r });
  const del = async (id: number) => {
    if (!confirm('Hapus alamat?')) return;
    try {
      await api.delete(`/addresses/${id}`, { headers });
      await load();
    } catch (e: any) {
      setMsg(`Gagal hapus alamat ${formatErr(e)}`);
    }
  };

  return (
    <>
      {msg && <p className="sb-msg">{msg}</p>}
      <div className="sb-table-wrap">
        <table className="sb-table">
          <thead>
            <tr>
              <th>Label</th>
              <th>Alamat</th>
              <th style={{ textAlign: 'center' }}>Primary</th>
              <th style={{ textAlign: 'center' }}>Aktif</th>
              <th style={{ textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.label}</td>
                <td>{r.address_line}</td>
                <td style={{ textAlign: 'center' }}>{r.is_primary ? <span className="sb-badge sb-badge--ok">✓</span> : '-'}</td>
                <td style={{ textAlign: 'center' }}>{r.is_active ? <span className="sb-badge sb-badge--ok">✓</span> : '-'}</td>
                <td style={{ textAlign: 'center' }}>
                  <LinkAction onClick={() => edit(r)}>Edit</LinkAction>{' '}
                  <LinkAction danger onClick={() => del(r.id)}>Hapus</LinkAction>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 14 }}>Belum ada data</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="sb-card">
        <h3>{form.id ? `Edit #${form.id}` : 'Tambah Alamat'}</h3>
        <form onSubmit={save}>
          <div className="sb-grid-2">
            <div className="sb-field">
              <label>Label</label>
              <input className="sb-input" value={form.label || ''} onChange={(e) => setForm({ ...form, label: e.target.value })} />
            </div>
            <div className="sb-field">
              <label>Maps URL</label>
              <input className="sb-input" value={form.maps_url || ''} onChange={(e) => setForm({ ...form, maps_url: e.target.value })} />
            </div>
            <div className="sb-field" style={{ gridColumn: '1 / -1' }}>
              <label>Alamat Lengkap</label>
              <textarea className="sb-textarea" rows={3} value={form.address_line} onChange={(e) => setForm({ ...form, address_line: e.target.value })} />
            </div>
          </div>
          <div className="sb-row" style={{ marginTop: 8 }}>
            <label className="sb-row">
              <input type="checkbox" checked={!!form.is_primary} onChange={(e) => setForm({ ...form, is_primary: e.target.checked ? 1 : 0 })} /> Primary
            </label>
            <label className="sb-row" style={{ marginLeft: 14 }}>
              <input type="checkbox" checked={!!form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked ? 1 : 0 })} /> Aktif
            </label>
          </div>
          <div className="sb-spacer" />
          <button className="sb-btn sb-btn--primary" type="submit">{form.id ? 'Simpan' : 'Tambah'}</button>
          {!!form.id && <button className="sb-btn" type="button" style={{ marginLeft: 8 }} onClick={() => setForm(empty)}>Batal</button>}
        </form>
      </div>
    </>
  );
};

/* ================= Panel: Socials ================= */
const PanelSocials: React.FC = () => {
  const headers = useAuthHeader();
  const [rows, setRows] = useState<Social[]>([]);
  const [msg, setMsg] = useState('');
  const empty: Social = { id: 0 as any, platform: 'instagram', handle: '', url: '', icon_type: 'iconset', icon_value: '', sort_order: 0, is_active: 1 };
  const [form, setForm] = useState<Social>(empty);

  const load = async () => {
    try {
      const r = await api.get('/socials', { headers });
      setRows(r.data);
      setMsg('');
    } catch (e: any) {
      setMsg(`Gagal memuat sosmed ${formatErr(e)}`);
    }
  };
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (form.id) await api.put(`/socials/${form.id}`, form, { headers });
      else await api.post('/socials', form, { headers });
      setForm(empty);
      await load();
    } catch (e: any) {
      setMsg(`Gagal simpan sosmed ${formatErr(e)}`);
    }
  };
  const edit = (r: Social) => setForm({ ...r });
  const del = async (id: number) => {
    if (!confirm('Hapus sosmed?')) return;
    try {
      await api.delete(`/socials/${id}`, { headers });
      await load();
    } catch (e: any) {
      setMsg(`Gagal hapus sosmed ${formatErr(e)}`);
    }
  };

  return (
    <>
      {msg && <p className="sb-msg">{msg}</p>}
      <div className="sb-table-wrap">
        <table className="sb-table">
          <thead>
            <tr>
              <th>Platform</th>
              <th>Handle</th>
              <th>URL</th>
              <th style={{ textAlign: 'center' }}>Urutan</th>
              <th style={{ textAlign: 'center' }}>Aktif</th>
              <th style={{ textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td style={{ textTransform: 'capitalize' }}>{r.platform}</td>
                <td>{r.handle}</td>
                <td className="sb-url">{r.url}</td>
                <td style={{ textAlign: 'center' }}>{r.sort_order}</td>
                <td style={{ textAlign: 'center' }}>{r.is_active ? <span className="sb-badge sb-badge--ok">✓</span> : '-'}</td>
                <td style={{ textAlign: 'center' }}>
                  <LinkAction onClick={() => edit(r)}>Edit</LinkAction>{' '}
                  <LinkAction danger onClick={() => del(r.id)}>Hapus</LinkAction>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 14 }}>Belum ada data</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="sb-card">
        <h3>{form.id ? `Edit #${form.id}` : 'Tambah Sosmed'}</h3>
        <form onSubmit={save}>
          <div className="sb-grid-3">
            <div className="sb-field">
              <label>Platform</label>
              <select className="sb-select" value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value as Social['platform'] })}>
                {['instagram', 'facebook', 'tiktok', 'x', 'youtube', 'linkedin', 'whatsapp', 'other'].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="sb-field">
              <label>URL</label>
              <input className="sb-input" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} required />
            </div>
          </div>
          <div className="sb-grid-2" style={{ marginTop: 8 }}>
            <div className="sb-field">
              <label>Urutan</label>
              <input className="sb-input" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: +e.target.value })} />
            </div>
            <div className="sb-field">
              <label>Aktif</label>
              <input type="checkbox" checked={!!form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked ? 1 : 0 })} />
            </div>
          </div>
          <div className="sb-spacer" />
          <button className="sb-btn sb-btn--primary" type="submit">{form.id ? 'Simpan' : 'Tambah'}</button>
          {!!form.id && <button className="sb-btn" type="button" style={{ marginLeft: 8 }} onClick={() => setForm(empty)}>Batal</button>}
        </form>
      </div>
    </>
  );
};

/* ================= Panel: Users (admin-only) ================= */
const USERS_LIST_PATH = '/users';
const USERS_CREATE_PATH = '/users';
const USERS_UPDATE_PATH = '/users';
const PanelUsers: React.FC = () => {
  const headers = useAuthHeader();
  const [rows, setRows] = useState<User[]>([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const empty: User = { id: 0, username: '', email: '', role: 'admin', password: '' };
  const [form, setForm] = useState<User>(empty);

  const errText = (e: any) => {
    const s = e?.response?.status;
    const m =
      e?.response?.data?.message ||
      e?.response?.data?.error ||
      e?.message ||
      'Unknown error';
    return `(${s ?? '??'}) ${m}`;
  };

  const load = async () => {
    setLoading(true);
    setMsg('');
    if (!USERS_LIST_PATH) {
      setRows([]);
      setLoading(false);
      return;
    }
    try {
      const r = await api.get(USERS_LIST_PATH, { headers });
      setRows(Array.isArray(r.data) ? r.data : []);
    } catch (e: any) {
      setMsg(`Gagal memuat users: ${errText(e)}`);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');

    const payload: any = {
      username: form.username,
      email: form.email,
    };
    if (!form.id && !form.password) {
      setMsg('Password wajib diisi untuk user baru.');
      return;
    }
    if (form.password) payload.password = form.password;
    if (form.role) payload.role = 'admin';

    try {
      if (form.id) {
        try {
          await api.put(`${USERS_UPDATE_PATH}/${form.id}`, payload, { headers: { ...headers, 'Content-Type': 'application/json' } });
        } catch (errAny: any) {
          if (errAny?.response?.status === 405) {
            await api.patch(`${USERS_UPDATE_PATH}/${form.id}`, payload, { headers: { ...headers, 'Content-Type': 'application/json' } });
          } else {
            throw errAny;
          }
        }
      } else {
        await api.post(USERS_CREATE_PATH, payload, { headers: { ...headers, 'Content-Type': 'application/json' } });
      }
      setForm(empty);
      await load();
    } catch (e: any) {
      setMsg(`Gagal simpan user: ${errText(e)}`);
      console.error('Save user failed:', e?.response?.data || e);
    }
  };

  const edit = (u: User) => setForm({ ...u, password: '' });

  const del = async (id: number) => {
    if (!confirm('Hapus user ini?')) return;
    try {
      await api.delete(`${USERS_UPDATE_PATH}/${id}`, { headers });
      await load();
    } catch (e: any) {
      setMsg(`Gagal hapus user: ${errText(e)}`);
    }
  };

  return (
    <>
      {msg && <p className="sb-msg">{msg}</p>}

      <div className="sb-table-wrap">
        <table className="sb-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: 14 }}>Memuat…</td></tr>
            ) : rows.length ? rows.map(u => (
              <tr key={u.id}>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td style={{ textAlign: 'center' }}>
                  <LinkAction onClick={() => edit(u)}>Edit</LinkAction>{' '}
                  <LinkAction danger onClick={() => del(u.id)}>Delete</LinkAction>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: 14 }}>{USERS_LIST_PATH ? 'No users found.' : 'List users endpoint tidak di-set (tetap bisa tambah user).'}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="sb-card">
        <h3>{form.id ? `Edit User #${form.id}` : 'Add New User'}</h3>
        <form onSubmit={save}>
          <div className="sb-grid-3">
            <div className="sb-field">
              <label>Username</label>
              <input className="sb-input" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
            </div>
            <div className="sb-field">
              <label>Email</label>
              <input className="sb-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="sb-field">
              <label>Role</label>
              <select className="sb-select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value as 'admin' | 'user' })}>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="sb-grid-3" style={{ marginTop: 8 }}>
            <div className="sb-field" style={{ gridColumn: '1 / -1' }}>
              <label>{form.id ? 'Password (kosongkan bila tidak diubah)' : 'Password'}</label>
              <input className="sb-input" type="password" value={form.password || ''} onChange={e => setForm({ ...form, password: e.target.value })} placeholder={form.id ? 'Biarkan kosong jika tidak ganti' : 'Minimal 6 karakter'} />
            </div>
          </div>

          <div className="sb-spacer" />
          <button className="sb-btn sb-btn--primary" type="submit">{form.id ? 'Save Changes' : 'Add User'}</button>
          {!!form.id && <button className="sb-btn" type="button" style={{ marginLeft: 8 }} onClick={() => setForm(empty)}>Cancel</button>}
        </form>
      </div>
    </>
  );
};

/* ================= Halaman utama ================= */
const SettingsPage: React.FC = () => {
  const [active, setActive] = useState<TabKey>('logo');
  return (
    <div className="sb-container">
      <UIStyles />
      <h1 className="sb-h1">Pengaturan Website</h1>
      <Tabs active={active} onChange={setActive} />
      {active === 'logo' && <PanelLogo />}
      {active === 'wa' && <PanelWhatsApp />}
      {active === 'services' && <PanelServices />}
      {active === 'emails' && <PanelEmails />}
      {active === 'addresses' && <PanelAddresses />}
      {active === 'socials' && <PanelSocials />}
      {active === 'users' && <PanelUsers />}
    </div>
  );
};

export default SettingsPage;

