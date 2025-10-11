import React from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import Clients from '@/components/Clients';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';
import { getLatestNews } from '@/lib/news';

export default function Home({ newsItems }) {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Services />
      <Clients />
      <CTA />
      <Footer />
    </div>
  );
} 

export async function getStaticProps() {
  const newsItems = getLatestNews(3);

  return {
    props: {
      newsItems,
    },
  };
}
