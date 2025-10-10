import React from "react";
import axios from "axios";
import {
  Home, Truck, Wrench, UserCheck, Monitor, Palette,
  ShoppingBag, ShoppingCart, Car, Laptop, Camera,
  MessageCircle, Plus, type LucideIcon
} from "lucide-react";

/** ================== Tipe data dari backend ================== */
type Service = {
  id: number;
  name: string;
  slug?: string | null;
  summary?: string | null;
  icon_type?: "lucide" | "emoji" | "image"; // default: lucide
  icon_value?: string | null;               // ex. "home" | "truck" | "🙂" | "/uploads/x.png"
  icon_bg?: string | null;                  // ex. "#3b82f6"
  sort_order?: number;
  is_active?: number;
};

type SitePublic = {
  whatsapp_number?: string;
  whatsapp_message?: string | null;
};

const API_BASE = "http://localhost:5000";

/** ================== Peta nama-icon -> komponen lucide ================== */
const ICONS: Record<string, LucideIcon> = {
  home: Home,
  truck: Truck,
  wrench: Wrench,
  user: UserCheck,        // gunakan "user" di DB kalau mau UserCheck
  usercheck: UserCheck,   // alias tambahan
  monitor: Monitor,
  palette: Palette,
  shopping: ShoppingBag,  // bebas: "shopping" atau "shoppingbag"
  shoppingbag: ShoppingBag,
  shoppingcart: ShoppingCart,
  car: Car,
  laptop: Laptop,
  camera: Camera,
};

/** ================== Utils: samakan dengan Footer ================== */
const normalizeWa = (n: string) => {
  const d = (n || "").replace(/\D/g, "");
  if (!d) return "";
  if (d.startsWith("62")) return d;
  if (d.startsWith("0")) return "62" + d.slice(1);
  if (d.startsWith("8")) return "62" + d;
  return d;
};

/** ================== Icon renderer ================== */
const ServiceIcon: React.FC<{ svc: Service }> = ({ svc }) => {
  const bg = svc.icon_bg || "#3b82f6";
  const key = (svc.icon_value || "").toLowerCase();
  const Icon = ICONS[key] ?? Home;

  return (
    <div
      className="inline-flex p-3 rounded-xl text-white mb-4 group-hover:scale-110 transition-transform duration-300"
      style={{ background: bg }}
    >
      {svc.icon_type === "image" && svc.icon_value ? (
        <img
          src={svc.icon_value}
          width={32}
          height={32}
          alt=""
          className="object-contain"
        />
      ) : svc.icon_type === "emoji" && svc.icon_value ? (
        <span style={{ fontSize: 24, lineHeight: 1 }}>{svc.icon_value}</span>
      ) : (
        <Icon className="w-8 h-8" />
      )}
    </div>
  );
};

/** ================== Section utama (self-fetch) ================== */
const ServicesSection: React.FC = () => {
  const [services, setServices] = React.useState<Service[]>([]);
  const [waNumber, setWaNumber] = React.useState<string>("");
  const [waMessage, setWaMessage] = React.useState<string>("Halo, saya butuh bantuan");
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Ambil daftar layanan aktif
        const svcRes = await axios.get<Service[]>(`${API_BASE}/public/services`);
        if (mounted) setServices(svcRes.data || []);

        // Ambil nomor WA & pesan default (konsisten dengan Footer)
        const siteRes = await axios.get<SitePublic>(`${API_BASE}/public/site`);
        const siteData = siteRes.data || {};
        if (mounted) {
          setWaNumber(siteData.whatsapp_number || "");
          // gunakan ?? agar string kosong dari DB tetap dipakai (tidak override oleh default)
          setWaMessage(siteData.whatsapp_message ?? "Halo, saya butuh bantuan");
        }
      } catch (e) {
        console.error("Gagal memuat services/site:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const waIntl = normalizeWa(waNumber);
  const waHref = waIntl
    ? `https://wa.me/${waIntl}?text=${encodeURIComponent(waMessage)}`
    : "#";

  return (
    <section id="services" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Layanan{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
              Kami
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Berbagai layanan profesional untuk memenuhi semua kebutuhan Anda.
            Dari hal sederhana hingga yang kompleks, kami siap membantu!
          </p>
        </div>

        {/* Grid Layanan */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-40 rounded-2xl bg-white border border-gray-100 shadow animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {services.map((s) => (
              <div
                key={s.id}
                className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              >
                <ServiceIcon svc={s} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{s.name}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{s.summary}</p>
              </div>
            ))}

            {/* Kartu “Butuh Selain Ini?” */}
            <div className="group bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="inline-flex p-3 rounded-xl bg-white/20 backdrop-blur-sm mb-4 group-hover:scale-110 transition-transform duration-300">
                <Plus className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Butuh Selain Ini?</h3>
              <p className="text-white/90 text-sm leading-relaxed mb-4">
                Tanya kami langsung! Kami siap bantu kebutuhan lainnya.
              </p>
              <a
                href={waHref}
                className="inline-flex items-center text-white font-medium hover:text-yellow-200 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat Sekarang
              </a>
            </div>
          </div>
        )}

        {/* CTA bawah */}
        <div className="text-center">
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-blue-50 text-blue-700 px-6 py-3 rounded-full hover:bg-blue-100 transition-colors"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">
              Tidak menemukan yang Anda cari? Hubungi kami dan kami akan carikan solusinya!
            </span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
