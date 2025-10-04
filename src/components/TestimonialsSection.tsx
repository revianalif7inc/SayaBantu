import React from 'react';
import { Star, Quote } from 'lucide-react';

const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      name: "Sari Wijaya",
      role: "Ibu Rumah Tangga",
      content: "Butuh bantuan bersih-bersih mendadak sebelum keluarga datang, langsung datang dan cepat selesai. Hasilnya sangat memuaskan!",
      rating: 5,
      avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop"
    },
    {
      name: "Andi Pratama",
      role: "Karyawan Swasta",
      content: "Mereka bisa bantu apa aja, dari antar dokumen sampai install software. Recommended banget untuk yang sibuk seperti saya!",
      rating: 5,
      avatar: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop"
    },
    {
      name: "Maya Salsabila",
      role: "Pemilik UMKM",
      content: "Tim desain mereka sangat kreatif! Logo dan banner untuk toko online saya jadi lebih menarik. Harga juga terjangkau.",
      rating: 5,
      avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop"
    }
  ];

  return (
    <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-green-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Apa Kata <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">Pelanggan?</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Kepuasan pelanggan adalah prioritas utama kami. Berikut testimoni dari mereka yang sudah merasakan layanan SayaBantu.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative"
            >
              {/* Quote decoration */}
              <div className="absolute -top-4 -left-4 bg-gradient-to-r from-blue-500 to-green-500 p-3 rounded-full">
                <Quote className="w-6 h-6 text-white" />
              </div>
              
              {/* Rating */}
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-yellow-400 fill-current"
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-600 leading-relaxed mb-6 italic">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {testimonial.name}
                  </h4>
                  <p className="text-gray-500 text-sm">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA for more reviews */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center bg-white rounded-full px-6 py-3 shadow-md">
            <Star className="w-5 h-5 text-yellow-400 fill-current mr-2" />
            <span className="text-gray-700 font-medium mr-2">Rating 4.9/5 dari</span>
            <span className="font-bold text-blue-600">1000+ ulasan</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;