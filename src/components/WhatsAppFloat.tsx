import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

type ContactInfo = {
  number: string;
  message: string;
};

// Fungsi normalisasi nomor WhatsApp
const normalizeWa = (n: string): string => {
  const d = (n || '').replace(/\D/g, '');
  if (!d) return '';
  if (d.startsWith('62')) return d;
  if (d.startsWith('0')) return '62' + d.slice(1);
  if (d.startsWith('8')) return '62' + d;
  return d;
};

const WhatsAppFloat: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);

  // Tooltip otomatis muncul lalu hilang
  useEffect(() => {
    const showTimer = setTimeout(() => setShowTooltip(true), 3000);
    const hideTimer = setTimeout(() => setShowTooltip(false), 8000);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  // Ambil data WhatsApp dari API
  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/public/site`);
        if (data?.whatsapp_number) {
          setContactInfo({
            number: data.whatsapp_number,
            // hanya fallback jika null atau undefined
            message:
              data.whatsapp_message ?? 'Halo, saya butuh bantuan.',
          });
        }
      } catch (error) {
        console.error('Gagal mengambil data kontak WhatsApp:', error);
      }
    };

    fetchContactInfo();
  }, []);

  if (!contactInfo) return null;

  const waIntl = normalizeWa(contactInfo.number);
  const waHref = `https://wa.me/${waIntl}?text=${encodeURIComponent(contactInfo.message)}`;

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute bottom-16 right-0 mb-2 w-max max-w-xs animate-bounce rounded-lg bg-white p-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-800">
                  Ada yang bisa kami bantu?
                </div>
                <div className="text-xs text-gray-600">Chat kami sekarang!</div>
              </div>
              <button
                onClick={() => setShowTooltip(false)}
                className="ml-2 text-gray-400 hover:text-gray-600"
                aria-label="Tutup tooltip"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="absolute bottom-0 right-6 h-2 w-2 translate-y-1/2 rotate-45 bg-white"></div>
          </div>
        )}

        {/* Tombol utama */}
        <a
          href={waHref}
          className="group relative flex h-14 w-14 transform items-center justify-center rounded-full bg-green-500 shadow-lg transition-all duration-300 hover:scale-110 hover:bg-green-600 hover:shadow-xl"
          aria-label="Chat via WhatsApp"
          target="_blank"
          rel="noopener noreferrer"
        >
          <MessageCircle className="h-7 w-7 text-white group-hover:animate-pulse" />
          <span className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-20" />
        </a>
      </div>

      {/* Overlay saat tooltip tampil di mobile */}
      {showTooltip && (
        <div
          className="fixed inset-0 z-40 bg-black/10 md:hidden"
          onClick={() => setShowTooltip(false)}
        />
      )}
    </>
  );
};

export default WhatsAppFloat;
