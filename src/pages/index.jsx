import React from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import Clients from '@/components/Clients';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';
import BidNoticePopup from '@/components/BidNoticePopup';
import { getLatestNews } from '@/lib/news';
import { getActivePopups } from '@/data/popups';

export default function Home({ newsItems, popups }) {
  return (
    <div className="min-h-screen">
      <Header />
      <BidNoticePopup popups={popups} />
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
  const popups = getActivePopups();

  return {
    props: {
      newsItems,
      popups,
    },
  };
}
