// src/components/MainLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import WhatsAppFloat from './WhatsAppFloat';

const MainLayout: React.FC = () => {
  return (
    <>
      <Header />
      <main style={{ minHeight: '60vh', paddingTop: '80px' }}>
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
};

export default MainLayout;
