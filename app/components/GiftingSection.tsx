'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const giftItems = [
  { name: 'Anniversary Cake', image: '/gifts/Anniversary cake.webp' },
  { name: 'Birthday Cake',    image: '/gifts/Birthday cake.jpg'      },
  { name: 'Customized Cake',  image: '/gifts/Customized cake.webp'   },
];

export default function GiftingSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const cardsRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headingRef.current ? Array.from(headingRef.current.children) : [],
        { autoAlpha: 0, y: 36 },
        {
          autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.12,
          scrollTrigger: { trigger: headingRef.current, start: 'top 100%', once: true },
        },
      );

      const cards = cardsRef.current
        ? Array.from(cardsRef.current.querySelectorAll<HTMLElement>('a'))
        : [];
      gsap.fromTo(
        cards,
        { autoAlpha: 0, y: 65, rotation: 2 },
        {
          autoAlpha: 1, y: 0, rotation: 0, duration: 1, ease: 'power3.out', stagger: 0.18,
          scrollTrigger: { trigger: cardsRef.current, start: 'top 100%', once: true },
        },
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-12 sm:py-28 px-4" style={{ background: 'var(--c-bg)' }}>
      <div className="max-w-6xl mx-auto">

        {/* Heading */}
        <div ref={headingRef} className="text-center mb-14">
          <p
            className="font-lato text-[10px] tracking-[0.5em] uppercase mb-3"
            style={{ color: 'var(--c-secondary)' }}
          >
            Perfect for Every Occasion
          </p>
          <h2
            className="font-anton uppercase leading-none mb-4"
            style={{ fontSize: 'clamp(2.4rem, 5vw, 5.5rem)', color: 'var(--c-accent)' }}
          >
            Gifting
          </h2>
          <div className="w-10 h-px mx-auto mb-6" style={{ background: 'var(--c-accent)' }} />
          <p
            className="font-lato text-sm leading-relaxed max-w-2xl mx-auto"
            style={{ color: 'rgba(58,48,40,0.65)' }}
          >
            Our gifting collection is thoughtfully crafted to bring joy and a smile to your face.
            Whether it&apos;s a birthday, anniversary, or your special day, a gift from Pizza Valley
            is a wonderful way to express your care for your loved one.
          </p>
        </div>

        {/* Cards */}
        <div ref={cardsRef} className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6">
          {giftItems.map((item) => (
            <Link key={item.name} href="#" className="group block">
              <div className="relative w-full aspect-[3/4] sm:aspect-square overflow-hidden mb-3" style={{ borderRadius: '3px' }}>
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(max-width:640px) 90vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: 'rgba(139,28,28,0.18)' }}
                />
              </div>
              <p
                className="text-center font-lato text-[11px] tracking-[0.28em] uppercase font-semibold transition-colors duration-300"
                style={{ color: 'var(--c-placeholder)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--c-accent)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--c-placeholder)'; }}
              >
                {item.name}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
