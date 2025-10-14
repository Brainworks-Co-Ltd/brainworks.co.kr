import React from 'react';
import Image from 'next/image';
import client1 from '../assets/clients/client1.png';
import client2 from '../assets/clients/client2.jpg';
import client3 from '../assets/clients/client3.png';
import client4 from '../assets/clients/client4.png';
import client5 from '../assets/clients/client5.jpg';
import client6 from '../assets/clients/client6.jpg';
import client7 from '../assets/clients/client7.png';
import client8 from '../assets/clients/client8.jpg';

export default function Clients() {
  const logos = [
    { src: client1, alt: 'client1' },
    { src: client2, alt: 'client2' },
    { src: client3, alt: 'client3' },
    { src: client4, alt: 'client4' },
    { src: client5, alt: 'client5' },
    { src: client6, alt: 'client6' },
    { src: client7, alt: 'client7' },
    { src: client8, alt: 'client8' }
  ];

  return (
    <section id="clients" className="relative py-20 text-slate-900">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-200 via-white to-slate-200" aria-hidden="true" />
      <div className="relative container mx-auto px-4">
        <h2 className="mb-12 text-center text-4xl font-bold">Clients & Partners</h2>

        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/80 shadow-xl">
          <div
            className="flex"
            style={{
              animation: 'scroll 30s linear infinite',
              width: 'fit-content'
            }}
          >
            {[...logos, ...logos, ...logos, ...logos].map((logo, index) => (
              <div key={`logo-${index}`} className="flex-shrink-0 px-12 py-10">
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={120}
                  height={120}
                  className="h-24 w-auto transition-all duration-300 grayscale hover:scale-110 hover:grayscale-0"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
}
