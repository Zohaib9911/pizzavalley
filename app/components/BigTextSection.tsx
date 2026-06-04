'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';

gsap.registerPlugin(ScrollTrigger);

const LINES = [
  { text: 'TASTE',      note: 'Since 2019' },
  { text: 'THE',        note: null },
  { text: 'DIFFERENCE', note: 'Bahawalpur' },
];

export default function BigTextSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const linesRef   = useRef<HTMLDivElement>(null);
  const ctaRef     = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const lineEls = linesRef.current
        ? Array.from(linesRef.current.querySelectorAll<HTMLElement>('.bt-line'))
        : [];

      /* Split each line's main text into chars */
      const splits: SplitType[] = [];
      lineEls.forEach((el) => {
        const textEl = el.querySelector<HTMLElement>('.bt-word');
        if (!textEl) return;
        const s = new SplitType(textEl, { types: 'chars,words' });
        s.words?.forEach((w) => {
          const we = w as HTMLElement;
          we.style.overflow      = 'hidden';
          we.style.display       = 'inline-block';
          we.style.verticalAlign = 'bottom';
        });
        gsap.set(s.chars ?? [], { yPercent: 110 });
        splits.push(s);
      });

      /* Animate each line on scroll */
      lineEls.forEach((el, i) => {
        const textEl = el.querySelector<HTMLElement>('.bt-word');
        const noteEl = el.querySelector<HTMLElement>('.bt-note');
        const split  = splits[i];
        if (!textEl || !split) return;

        gsap.to(split.chars ?? [], {
          yPercent: 0,
          duration: 1.25,
          ease:     'power4.out',
          stagger:  { amount: 0.4 },
          scrollTrigger: {
            trigger: el,
            start:   'top 95%',
            once:    true,
          },
        });

        if (noteEl) {
          gsap.fromTo(noteEl,
            { autoAlpha: 0, x: -12 },
            {
              autoAlpha: 1, x: 0, duration: 0.9, ease: 'power3.out',
              scrollTrigger: { trigger: el, start: 'top 90%', once: true },
              delay: i * 0.1 + 0.4,
            },
          );
        }
      });

      /* CTA reveal */
      gsap.fromTo(ctaRef.current,
        { autoAlpha: 0, y: 28 },
        {
          autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: ctaRef.current, start: 'top 95%', once: true },
        },
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-12 sm:py-32 px-4 sm:px-8"
      style={{ background: 'var(--c-bg)' }}
    >
      <div className="max-w-7xl mx-auto">
        <div ref={linesRef}>
          {LINES.map((line, i) => (
            <div
              key={i}
              className="bt-line relative flex items-baseline gap-4 sm:gap-6"
              style={{
                borderTop: `1px solid rgba(58,48,40,0.12)`,
                paddingTop: 'clamp(0.6rem, 1.2vw, 1.4rem)',
                paddingBottom: 'clamp(0.6rem, 1.2vw, 1.4rem)',
                marginBottom: 0,
              }}
            >
              {/* Note badge */}
              {line.note && (
                <span
                  className="bt-note font-lato text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.4em] uppercase self-center shrink-0"
                  style={{ color: 'var(--c-secondary)', minWidth: '3rem', maxWidth: '5rem' }}
                >
                  {line.note}
                </span>
              )}
              {!line.note && (
                <span className="shrink-0" style={{ minWidth: '3rem' }} />
              )}

              {/* Giant text */}
              <span
                className="bt-word font-anton uppercase st-wrap leading-none"
                suppressHydrationWarning
                style={{
                  fontSize:   'clamp(3.8rem, 11.5vw, 14rem)',
                  lineHeight: 0.9,
                  color:      'var(--c-accent)',
                  display:    'block',
                  flex:       1,
                }}
              >
                {line.text}
              </span>
            </div>
          ))}

          {/* Final border */}
          <div style={{ borderTop: '1px solid rgba(58,48,40,0.12)' }} />
        </div>

        {/* CTA */}
        <div ref={ctaRef} className="mt-10 sm:mt-14 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <Link
            href="/category/regular-pizza"
            className="cta-pill font-lato text-[11px] tracking-[0.3em] uppercase px-9 py-4"
            style={{ background: 'var(--c-accent)', color: 'var(--c-bg)' }}
          >
            Order Online
          </Link>
          <p
            className="font-lato text-[11px] tracking-[0.25em] uppercase"
            style={{ color: 'rgba(58,48,40,0.45)' }}
          >
            Free delivery above Rs.&nbsp;1500
          </p>
        </div>
      </div>
    </section>
  );
}
