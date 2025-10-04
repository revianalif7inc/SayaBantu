// src/components/WhatsAppFloat.tsx
import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

// Normalisasi ke format 62xxxxxxxxxx
const normalizeWa = (n: string) => {
  const d = (n || '').replace(/\D/g, '');
  if (!d) return '';
  if (d.startsWith('62')) return d;
  if (d.startsWith('0')) return '62' + d.slice(1);
  if (d.startsWith('8')) return '62' + d;
  return d;
};

type Props = {
  /** pesan default yang di-pre-fill ketika membuka WhatsApp */
  message?: string;
};

const WhatsAppFloat: React.FC<Props> = ({ message = 'Halo, saya tertarik dengan layanan SayaBantu' }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [waNumber, setWaNumber] = useState<string>(''); // raw dari API

  useEffect(() => {
    const showTimer = setTimeout(() => setShowTooltip(true), 3000);
    const hideTimer = setTimeout(() => setShowTooltip(false), 8000);
    return () => { clearTimeout(showTimer); clearTimeout(hideTimer); };
  }, []);

  // Ambil nomor WA publik
  useEffect(() => {
    const fetchPublic = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/public/site`);
        setWaNumber(data?.whatsapp_number || '');
      } catch (e) {
        console.error('Gagal mengambil public/site:', e);
      }
    };
    fetchPublic();
  }, []);

  const waIntl = normalizeWa(waNumber);
  const waHref = waIntl
    ? `https://wa.me/${waIntl}?text=${encodeURIComponent(message)}`
    : undefined;

  // Kalau nomor belum tersedia, tombol tetap tampil tapi dinonaktifkan agar UI konsisten
  const disabled = !waHref;

  const onClickIfDisabled: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    if (disabled) {
      e.preventDefault();
      alert('Nomor WhatsApp belum diset oleh admin.');
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        {showTooltip && (
          <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl p-3 mb-2 max-w-xs animate-bounce">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-800">Ada yang bisa kami bantu?</div>
                <div className="text-xs text-gray-600">Chat kami sekarang!</div>
              </div>
              <button onClick={() => setShowTooltip(false)} className="ml-2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="absolute bottom-0 right-6 translate-y-1/2 rotate-45 w-2 h-2 bg-white"></div>
          </div>
        )}

        <a
          href={waHref}
          onClick={onClickIfDisabled}
          className={[
            'relative flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300 transform group',
            disabled
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600 hover:shadow-xl hover:scale-110',
          ].join(' ')}
          aria-label="Chat via WhatsApp"
          aria-disabled={disabled}
          target={disabled ? undefined : '_blank'}
          rel={disabled ? undefined : 'noopener noreferrer'}
        >
          <MessageCircle className={['w-7 h-7', disabled ? 'text-white/70' : 'text-white group-hover:animate-pulse'].join(' ')} />
          {/* Ripple ditempel ke tombol agar posisinya benar */}
          {!disabled && <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-20" />}
        </a>
      </div>

      {showTooltip && <div className="fixed inset-0 bg-black/10 z-40 md:hidden" onClick={() => setShowTooltip(false)} />}
    </>
  );
};

export default WhatsAppFloat;
