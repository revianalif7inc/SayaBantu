import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MessageCircle, Phone, ArrowRight } from 'lucide-react';

const API_BASE = 'http://localhost:5000';

const normalizeWa = (raw: string) => {
  const d = (raw || '').replace(/\D/g, '');
  if (!d) return '';
  if (d.startsWith('62')) return d;
  if (d.startsWith('0')) return '62' + d.slice(1);
  if (d.startsWith('8')) return '62' + d;
  return d;
};

const CtaSection: React.FC = () => {
  const [waIntl, setWaIntl] = useState<string>('');

  useEffect(() => {
    const fetchPublic = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/public/site`);
        const raw = data?.whatsapp_number || '';
        setWaIntl(normalizeWa(raw));
      } catch (e) {
        console.error('Gagal mengambil /public/site:', e);
      }
    };
    fetchPublic();
  }, []);

  const defaultMsg = 'Halo, saya butuh bantuan segera';
  const hasPhone = Boolean(waIntl);
  const waHref = hasPhone
    ? `https://wa.me/${waIntl}?text=${encodeURIComponent(defaultMsg)}`
    : '#';
  const telHref = hasPhone ? `tel:+${waIntl}` : '#';
  const telLabel = hasPhone ? `Telepon langsung +${waIntl}` : 'Telepon langsung';

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-blue-700 to-green-600 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full transform -translate-x-48 -translate-y-48"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full transform translate-x-48 translate-y-48"></div>
      </div>

      <div className="relative max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Punya Kebutuhan Mendesak?</h2>
        <p className="text-xl text-blue-100 mb-8 leading-relaxed">
          Jangan tunggu lagi! Chat kami sekarang dan dapatkan solusi cepat untuk semua kebutuhan Anda. Tim profesional kami siap membantu 24/7.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-3">
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            aria-label="Hubungi via WhatsApp"
          >
            <MessageCircle className="w-6 h-6 mr-3" />
            Hubungi via WhatsApp
            <ArrowRight className="w-5 h-5 ml-2" />
          </a>

          <a
            href={telHref}
            className="inline-flex items-center bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 border border-white/20"
            aria-label={telLabel}
          >
            <Phone className="w-6 h-6 mr-3" />
            Atau Telepon Langsung
          </a>
        </div>

        {/* Paragraf "Nomor kami" dihapus */}

        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="text-2xl font-bold text-white mb-2">{'< 5 Menit'}</div>
            <div className="text-blue-100">Waktu Respon</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="text-2xl font-bold text-white mb-2">24/7</div>
            <div className="text-blue-100">Siap Melayani</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="text-2xl font-bold text-white mb-2">1000+</div>
            <div className="text-blue-100">Pelanggan Puas</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;