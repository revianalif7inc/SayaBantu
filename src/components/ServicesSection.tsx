// src/components/ServicesSection.tsx
import React from "react";
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
  const [waNumber, setWaNumber] = React.useState<string>("6281234567890");
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Ambil daftar layanan aktif
        const svcRes = await fetch(`${API_BASE}/public/services`);
        const svcData: Service[] = await svcRes.json();
        if (mounted) setServices(svcData);

        // Ambil nomor WA untuk CTA
        const siteRes = await fetch(`${API_BASE}/public/site`);
        const siteData: SitePublic = await siteRes.json();
        if (mounted && siteData?.whatsapp_number) {
          // buang tanda + jika ada
          setWaNumber(String(siteData.whatsapp_number).replace(/^\+/, ""));
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

  const waHref = `https://wa.me/${waNumber}?text=Halo,%20saya%20butuh%20bantuan%20untuk%20...`;

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
          // Skeleton saat loading
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
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat Sekarang
              </a>
            </div>
          </div>
        )}

        {/* CTA bawah */}
        <div className="text-center">
          <div className="inline-flex items-center bg-blue-50 text-blue-700 px-6 py-3 rounded-full">
            <MessageCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">
              Tidak menemukan yang Anda cari? Hubungi kami dan kami akan carikan solusinya!
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
