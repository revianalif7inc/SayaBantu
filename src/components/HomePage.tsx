// src/components/HomePage.tsx
import React from 'react';

import HeroSection from './HeroSection';
import AboutSection from './AboutSection';
import ServicesSection from './ServicesSection';
import WhyChooseSection from './WhyChooseSection';
import TestimonialsSection from './TestimonialsSection';
import CtaSection from './CtaSection';

const HomePage: React.FC = () => {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <ServicesSection /> {/* tidak butuh props */}
      <WhyChooseSection />
      <TestimonialsSection />
      <CtaSection />
    </>
  );
};

export default HomePage;
