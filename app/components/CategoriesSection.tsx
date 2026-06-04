'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { categories } from '../data/categories';

/* brand words that rotate on even marquee rows */
const BRAND_WORDS = ['PIZZA VALLEY', 'SWEET VALLEY', 'BAHAWALPUR', 'YAZMAN', 'ORDER NOW'];

/* 5 alternating rows per card */
function buildRows(catName: string) {
  const nm = catName.toUpperCase();
  return [
    { text: nm,              rtl: false, speed: 8  },
    { text: BRAND_WORDS[0],  rtl: true,  speed: 10 },
    { text: nm,              rtl: false, speed: 9  },
    { text: BRAND_WORDS[1],  rtl: true,  speed: 11 },
    { text: nm,              rtl: false, speed: 8  },
  ];
}

export default function CategoriesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef    = useRef<HTMLDivElement>(null);
  const gridRef    = useRef<HTMLDivElement>(null);

  /* entrance animation via IntersectionObserver (reliable on all devices) */
  useEffect(() => {
    const head  = headRef.current;
    const cards = gridRef.current
      ? Array.from(gridRef.current.querySelectorAll<HTMLElement>('.cat-card-wrap'))
      : [];
    const targets = [head, ...cards].filter(Boolean);
    if (!targets.length) return;

    gsap.set(targets, { autoAlpha: 0, y: 40 });

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          gsap.to(targets, {
            autoAlpha: 1, y: 0,
            duration: 0.8, ease: 'power3.out', stagger: 0.05,
          });
          io.disconnect();
        }
      },
      { threshold: 0.03 },
    );
    if (sectionRef.current) io.observe(sectionRef.current);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-16 sm:py-24 px-4"
      style={{ background: 'var(--c-bg)' }}
    >
      {/*
       * Inject keyframes + card animations directly in the component.
       * This bypasses Tailwind CSS v4 processing and guarantees the
       * animations run regardless of class-scanning / purge behaviour.
       */}
      <style>{`
        @keyframes pv-ltr {
          from { transform: translateX(0%);   }
          to   { transform: translateX(-50%); }
        }
        @keyframes pv-rtl {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0%);   }
        }
        @keyframes pv-float {
          0%,100% { transform: translateY(0px);   }
          50%     { transform: translateY(-13px);  }
        }
        @keyframes pv-shimmer {
          to { transform: translateX(120%); }
        }

        .cat-card {
          position: relative;
          overflow: hidden;
          border-radius: 16px;
          background: #c8aa6b;
          box-shadow: 0 8px 30px rgba(0,0,0,.28);
          aspect-ratio: 3/4;
          cursor: pointer;
          transition: transform .38s cubic-bezier(.22,1,.36,1),
                      box-shadow  .38s ease;
        }
        .cat-card:hover {
          transform: translateY(-9px) scale(1.025);
          box-shadow: 0 26px 60px rgba(0,0,0,.46);
        }

        /* floating product image */
        .cat-img {
          animation: pv-float 3.6s ease-in-out infinite;
          will-change: transform;
        }
        .cat-card:hover .cat-img {
          animation-play-state: paused;
          transition: transform .4s ease;
          transform: translateY(-11px) scale(1.07);
        }

        /* shimmer on hover */
        /* background words: hidden by default, reveal on hover */
        .cat-words-wrap {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.45s ease, transform 0.5s cubic-bezier(.22,1,.36,1);
        }
        .cat-card:hover .cat-words-wrap {
          opacity: 1;
          transform: translateY(0);
        }

        .cat-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            118deg,
            transparent 30%,
            rgba(255,255,255,.22) 50%,
            transparent 70%
          );
          transform: translateX(-120%);
          pointer-events: none;
          z-index: 20;
        }
        .cat-card:hover::after {
          animation: pv-shimmer .65s cubic-bezier(.22,1,.36,1) forwards;
        }

        /* arrow button */
        .cat-arrow {
          transform: rotate(-45deg);
          transition: transform .3s ease, background .3s;
        }
        .cat-card:hover .cat-arrow {
          transform: rotate(0deg);
          background: #6b1414 !important;
        }
      `}</style>

      <div className="max-w-6xl mx-auto">

        {/* ── Heading ── */}
        <div ref={headRef} className="text-center mb-12 sm:mb-16">
          <p className="font-lato text-[10px] tracking-[0.5em] uppercase mb-2"
            style={{ color: 'var(--c-secondary)' }}>
            Explore the Menu
          </p>
          <h2 className="font-anton uppercase leading-none"
            style={{ fontSize: 'clamp(2.4rem,5vw,5rem)', color: 'var(--c-accent)' }}>
            Categories
          </h2>
          <div className="w-10 h-px mx-auto mt-4" style={{ background: 'var(--c-accent)' }} />
        </div>

        {/* ── 16-card grid ── */}
        <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {categories.map((cat) => {
            const rows = buildRows(cat.name);
            return (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="cat-card-wrap block group"
              >
                {/* ── Gold card ── */}
                <div className="cat-card">

                  {/* Animated marquee background text — hidden until hover */}
                  <div className="cat-words-wrap" style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-around',
                    overflow: 'hidden', pointerEvents: 'none', zIndex: 0,
                  }}>
                    {rows.map((row, ri) => (
                      <div
                        key={ri}
                        style={{
                          display:   'flex',
                          width:     'max-content',
                          whiteSpace: 'nowrap',
                          alignItems: 'center',
                          animation: `${row.rtl ? 'pv-rtl' : 'pv-ltr'} ${row.speed}s linear infinite`,
                          willChange: 'transform',
                        }}
                      >
                        {/* 4 copies for seamless -50% loop */}
                        {[0, 1, 2, 3].map((k) => (
                          <span
                            key={k}
                            style={{
                              fontFamily:    'var(--font-anton), Impact, sans-serif',
                              fontSize:      'clamp(1.1rem, 3.8vw, 2.8rem)',
                              fontWeight:    700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              lineHeight:    1.1,
                              color:         '#8b1c1c',
                              opacity:       0.78,
                              padding:       '0 0.7rem',
                              flexShrink:    0,
                            }}
                          >
                            {row.text}&nbsp;•&nbsp;
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>

                  {/* Floating category image — centered */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1,
                  }}>
                    <div
                      className="cat-img"
                      style={{ width: '75%', aspectRatio: '1/1', position: 'relative' }}
                    >
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        fill
                        sizes="(max-width:640px) 45vw, (max-width:1024px) 30vw, 22vw"
                        className="object-contain"
                        style={{ filter: 'drop-shadow(0 8px 18px rgba(0,0,0,.45))' }}
                      />
                    </div>
                  </div>

                </div>{/* /cat-card */}

                {/* Category name — OUTSIDE the card, below it */}
                <div className="flex items-center justify-between mt-3 px-1">
                  <span
                    className="font-anton uppercase leading-tight"
                    style={{
                      fontSize:      'clamp(0.7rem, 1.6vw, 0.92rem)',
                      color:         'var(--c-accent)',
                      letterSpacing: '0.07em',
                    }}
                  >
                    {cat.name}
                  </span>
                  {/* small arrow */}
                  <div
                    className="cat-arrow w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: 'var(--c-accent)' }}
                  >
                    <svg width="10" height="10" viewBox="0 0 14 14" fill="none"
                      stroke="white" strokeWidth="2.2" strokeLinecap="round">
                      <path d="M2 12L12 2M12 2H5M12 2v7"/>
                    </svg>
                  </div>
                </div>

              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
