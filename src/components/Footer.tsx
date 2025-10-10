import React, { useState, useEffect } from 'react';
import {
  Instagram, Facebook, Twitter, Youtube, Linkedin,
  Mail, MapPin, Clock, MessageCircle, LucideProps
} from 'lucide-react';
import axios from 'axios';
import { FaTiktok } from 'react-icons/fa';

type SocialLink = { id: number; platform: string; url: string; };
type Email = { id: number; label: string | null; email: string; is_primary: number; is_active: number; };
type Address = {
  id: number;
  label: string | null;
  address_line: string;
  city?: string | null;
  province?: string | null;
  postal_code?: string | null;
  maps_url?: string | null;
  is_primary: number;
  is_active: number;
};

const socialIcons: { [key: string]: React.FC<LucideProps> } = {
  instagram: Instagram,
  facebook: Facebook,
  x: Twitter,
  youtube: Youtube,
  linkedin: Linkedin,
  tiktok: FaTiktok,
};

const cdn = (u?: string) =>
  !u ? '' : u.startsWith('/uploads') ? `http://localhost:5000${u}` : u;

const normalizeWa = (n: string) => {
  const d = (n || '').replace(/\D/g, '');
  if (!d) return '';
  if (d.startsWith('62')) return d;
  if (d.startsWith('0')) return '62' + d.slice(1);
  if (d.startsWith('8')) return '62' + d;
  return d;
};

const mapHref = (a: Address) => {
  const manual = [a.address_line, a.city, a.province, a.postal_code]
    .filter(Boolean)
    .join(', ');
  return a.maps_url?.trim()
    ? a.maps_url
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(manual)}`;
};

const addrText = (a: Address) =>
  [a.address_line, a.city, a.province, a.postal_code].filter(Boolean).join(', ');

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [waNumber, setWaNumber] = useState<string>('');
  const [waMessage, setWaMessage] = useState<string>('Halo, saya butuh bantuan'); // default
  const [emails, setEmails] = useState<Email[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);

  useEffect(() => {
    const fetchPublic = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/public/site');
        setSocialLinks(data?.socials || []);
        setLogoUrl(cdn(data?.logo_url));
        setWaNumber(data?.whatsapp_number || '');
        // ✅ gunakan ?? agar string kosong tetap ditampilkan
        setWaMessage(data?.whatsapp_message ?? 'Halo, saya butuh bantuan');
        setEmails(data?.emails || []);
        setAddresses(data?.addresses || []);
      } catch (e) {
        console.error('Gagal mengambil data public site:', e);
      }
    };
    fetchPublic();
  }, []);

  const waIntl = normalizeWa(waNumber);
  const waHref = waIntl
    ? `https://wa.me/${waIntl}?text=${encodeURIComponent(waMessage)}`
    : '#';

  const emailsToShow = emails.slice(0, 2);
  const addressesToShow = addresses.slice(0, 2);

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo"
                className="h-12 md:h-14 object-contain mb-4"
              />
            ) : (
              <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white font-bold text-2xl px-4 py-3 rounded-lg inline-block mb-4">
                SayaBantu
              </div>
            )}
            <p className="text-gray-300 leading-relaxed mb-6 max-w-md">
              Platform jasa serabutan terpercaya yang siap membantu berbagai kebutuhan Anda.
              Dari hal sederhana hingga kompleks, kami selalu siap memberikan solusi terbaik.
            </p>

            {/* Social Media Icons */}
            <div className="flex space-x-4">
              {socialLinks.map((link) => {
                const IconComponent = socialIcons[link.platform.toLowerCase()];
                if (!IconComponent) return null;
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800 p-3 rounded-lg hover:bg-blue-600 transition-colors"
                    aria-label={link.platform}
                  >
                    <IconComponent className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Kontak */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Hubungi Kami</h3>
            <div className="space-y-4">
              {/* WhatsApp (dinamis) */}
              <a
                href={waHref}
                className="flex items-center text-gray-300 hover:text-green-400 transition-colors"
                aria-label="Chat via WhatsApp"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                <span>{waIntl ? `+${waIntl}` : '—'}</span>
              </a>

              {/* Emails */}
              {emailsToShow.length ? (
                emailsToShow.map((e) => (
                  <a
                    key={e.id}
                    href={`mailto:${e.email}`}
                    className="flex items-center text-gray-300 hover:text-blue-400 transition-colors"
                  >
                    <Mail className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span>{e.email}</span>
                  </a>
                ))
              ) : (
                <div className="flex items-center text-gray-300 opacity-60">
                  <Mail className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span>—</span>
                </div>
              )}

              {/* Alamat */}
              {addressesToShow.length ? (
                addressesToShow.map((a) => (
                  <a
                    key={a.id}
                    href={mapHref(a)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start text-gray-300 hover:text-blue-400 transition-colors"
                    aria-label="Buka di Peta"
                  >
                    <MapPin className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                    <span>{addrText(a)}</span>
                  </a>
                ))
              ) : (
                <div className="flex items-start text-gray-300 opacity-60">
                  <MapPin className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                  <span>—</span>
                </div>
              )}

              {/* Jam layanan */}
              <div className="flex items-center text-gray-300">
                <Clock className="w-5 h-5 mr-3 flex-shrink-0" />
                <span>24/7 Siap Melayani</span>
              </div>
            </div>
          </div>

          {/* Layanan Populer */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Layanan Populer</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Jasa Kebersihan</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Kurir & Antar Barang</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Perbaikan & Tukang</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Asisten Rumah Tangga</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Jasa Admin Online</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Desain & Digital</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 mt-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © {currentYear} SayaBantu. Semua hak cipta dilindungi undang-undang.
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Syarat & Ketentuan</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Kebijakan Privasi</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
