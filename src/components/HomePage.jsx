import React from 'react';
import Header from './Header';
import Hero from './Hero';
import Services from './Services';
import Honors from './Honors';
import Clients from './Clients';
import News from './News';
import Footer from './Footer';

export default function HomePage({ newsItems = [] }) {
  return (
    <div className="font-sans text-gray-900 bg-blue-100">
      <Header />
      <Hero />
      <Services />
      <Honors />
      <News items={newsItems} />
      <Clients />
      <Footer />
    </div>
  );
}
