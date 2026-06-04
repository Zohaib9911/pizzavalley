'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const CARDS = [
  {
    image:   '/newImages/ZibD_vPdc1huKr6f_home-card-lata.jpg',
    eyebrow: 'Explore',
    title:   ['Fresh', 'Crafted'],
    cta:     'View Menu',
    href:    '/category/regular-pizza',
  },
  {
    image:   '/newImages/ZibEAvPdc1huKr6g_home-card-pimiento.jpg',
    eyebrow: 'Deals',
    title:   ['Best', 'Offers'],
    cta:     'See Deals',
    href:    '/category/pizza-deals',
  },
  {
    image:   '/newImages/ZibEBvPdc1huKr6i_home-card-vetro.jpg',
    eyebrow: 'Desserts',
    title:   ['Sweet', 'Valley'],
    cta:     'Order Now',
    href:    '/category/cakes',
  },
];

export default function FeatureCards() {
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    const cards = Array.from(row.querySelectorAll<HTMLElement>('.fc-card'));
    if (!cards.length) return;

    /*
     * Use IntersectionObserver (not ScrollTrigger) as the trigger.
     * This fires reliably on every device — desktop wheel, mobile touch,
     * reduced-motion, regardless of Lenis state.
     */
    gsap.set(cards, { autoAlpha: 0, y: 55 });

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          gsap.to(cards, {
            autoAlpha: 1,
            y: 0,
            duration: 1.1,
            ease: 'power4.out',
            stagger: 0.14,
          });
          observer.disconnect();
        }
      },
      { threshold: 0.05 },
    );

    observer.observe(row);
    return () => observer.disconnect();
  }, []);

  return (
    <section style={{ background: 'var(--c-dark)' }}>
      {/*
       * flex-col on mobile  → cards stack vertically, each full width
       * md:flex-row desktop → cards sit side by side, equal width
       * NO inline flex style on cards to avoid flex-basis overriding height
       */}
      <div ref={rowRef} className="flex flex-col md:flex-row">
        {CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            /*
             * w-full ensures 100% width in mobile column layout.
             * md:flex-1 gives equal columns on desktop.
             * Explicit height is NOT overridden by flex-basis here
             * because we use w-full + height (not flex shorthand).
             */
            className="fc-card group relative overflow-hidden block w-full md:flex-1"
            style={{ height: 'clamp(220px, 48svh, 640px)' }}
          >
            {/* Background image */}
            <Image
              src={card.image}
              alt={card.title.join(' ')}
              fill
              sizes="(max-width:768px) 100vw, 34vw"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />

            {/* Dark gradient */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.06) 100%)',
              }}
            />

            {/* Red hover tint */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ background: 'rgba(139,28,28,0.16)' }}
            />

            {/* Text content */}
            <div className="absolute bottom-0 left-0 p-6 sm:p-8 md:p-9 z-10">
              <p
                className="font-lato text-[10px] tracking-[0.45em] uppercase mb-2"
                style={{ color: 'var(--c-secondary)' }}
              >
                {card.eyebrow}
              </p>
              <h3
                className="font-anton text-white uppercase leading-none mb-4"
                style={{ fontSize: 'clamp(2rem, 5vw, 3.8rem)', lineHeight: 0.9 }}
              >
                {card.title.map((line, i) => (
                  <span key={i} className="block">{line}</span>
                ))}
              </h3>
              <span
                className="inline-flex items-center gap-2 font-lato text-[11px] tracking-[0.3em] uppercase"
                style={{ color: 'rgba(255,255,255,0.65)' }}
              >
                <span className="group-hover:text-[var(--c-secondary)] transition-colors duration-300">
                  {card.cta}
                </span>
                <span className="group-hover:translate-x-1.5 transition-transform duration-300">→</span>
              </span>
            </div>

            {/* Gold border on hover */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ border: '1.5px solid var(--c-secondary)' }}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
