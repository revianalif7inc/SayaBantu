import React from 'react';
import { Clock, Users, Shield, DollarSign, Zap, Heart } from 'lucide-react';

const WhyChooseSection: React.FC = () => {
  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Fast Response",
      description: "Respon cepat via WhatsApp dalam hitungan menit. Tim kami siap 24/7 untuk kebutuhan mendesak.",
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Multi Service",
      description: "Satu platform untuk semua kebutuhan. Tidak perlu cari banyak vendor, kami bisa bantu semuanya.",
      gradient: "from-blue-500 to-indigo-500"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Amanah & Terpercaya",
      description: "Tim terverifikasi dengan track record yang baik. Kepuasan dan kepercayaan Anda adalah prioritas kami.",
      gradient: "from-green-500 to-teal-500"
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "Harga Terjangkau",
      description: "Tarif kompetitif dengan kualitas premium. Tidak ada biaya tersembunyi, semua transparan.",
      gradient: "from-purple-500 to-pink-500"
    }
  ];

  return (
    <section id="why-choose" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Kenapa Pilih <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">SayaBantu?</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Kami tidak hanya memberikan layanan, tapi juga pengalaman terbaik yang membuat hidup Anda lebih mudah.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group text-center p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.gradient} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Additional Benefits */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-3xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Keunggulan Lainnya
            </h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex items-start">
              <div className="bg-blue-100 p-2 rounded-lg mr-4 flex-shrink-0">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Fleksibel Waktu</h4>
                <p className="text-gray-600">Sesuaikan jadwal dengan kebutuhan Anda, termasuk weekend dan hari libur.</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-green-100 p-2 rounded-lg mr-4 flex-shrink-0">
                <Heart className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Pelayanan Ramah</h4>
                <p className="text-gray-600">Tim yang berpengalaman dan terlatih dengan attitude yang baik dan profesional.</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-purple-100 p-2 rounded-lg mr-4 flex-shrink-0">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Garansi Kepuasan</h4>
                <p className="text-gray-600">Jika tidak puas, kami akan perbaiki atau refund. Kepuasan Anda dijamin 100%.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;