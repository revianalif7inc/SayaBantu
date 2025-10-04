import React from 'react';
import { Target, Users, Clock, Award } from 'lucide-react';

const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Tentang <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">SayaBantu</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Kami adalah platform jasa serabutan terpercaya yang siap membantu berbagai kebutuhan Anda. 
            Dengan tim profesional dan berpengalaman, kami memberikan solusi cepat dan tepat.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Mengapa Kami Ada?
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Kami memahami bahwa hidup modern penuh dengan kesibukan. Terkadang Anda membutuhkan bantuan 
              untuk hal-hal yang tidak sempat dikerjakan atau membutuhkan keahlian khusus. 
              SayaBantu hadir sebagai solusi untuk semua kebutuhan tersebut.
            </p>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Dari kebutuhan rumah tangga hingga keperluan bisnis, kami siap memberikan layanan 
              berkualitas dengan harga terjangkau dan waktu yang fleksibel sesuai kebutuhan Anda.
            </p>

            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-lg mr-4">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Fokus pada Solusi</h4>
                  <p className="text-gray-600">Setiap masalah pasti ada solusinya, kami siap membantu menemukan jalan keluarnya.</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-green-100 p-2 rounded-lg mr-4">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Respon Cepat</h4>
                  <p className="text-gray-600">Tim kami selalu siap merespon kebutuhan Anda dengan cepat, kapan pun dibutuhkan.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Stats */}
          <div className="grid grid-cols-2 gap-8">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-3xl font-bold text-blue-600 mb-2">1000+</h4>
              <p className="text-gray-600 font-medium">Pelanggan Puas</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl">
              <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-3xl font-bold text-green-600 mb-2">50+</h4>
              <p className="text-gray-600 font-medium">Jenis Layanan</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl">
              <div className="bg-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-3xl font-bold text-orange-600 mb-2">24/7</h4>
              <p className="text-gray-600 font-medium">Siap Melayani</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl">
              <div className="bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-3xl font-bold text-purple-600 mb-2">99%</h4>
              <p className="text-gray-600 font-medium">Tingkat Kepuasan</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;