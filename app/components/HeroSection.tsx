'use client';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { gsap } from 'gsap';
import SplitType from 'split-type';

export default function HeroSection() {
  const sectionRef  = useRef<HTMLElement>(null);
  const imgRef      = useRef<HTMLDivElement>(null);
  const badgeRef    = useRef<HTMLDivElement>(null);
  const titleRef    = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef      = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const title = titleRef.current;
    if (!title) return;

    /* ── Split title into chars ── */
    const split = new SplitType(title, { types: 'chars,words' });
    const chars = split.chars ?? [];

    split.words?.forEach((w) => {
      const el = w as HTMLElement;
      el.style.overflow      = 'hidden';
      el.style.display       = 'inline-block';
      el.style.verticalAlign = 'bottom';
    });

    /* ── Initial states ── */
    gsap.set(chars, { yPercent: 115 });
    gsap.set([badgeRef.current, subtitleRef.current], { autoAlpha: 0, y: 20 });
    gsap.set(ctaRef.current ? Array.from(ctaRef.current.children) : [], { autoAlpha: 0, y: 20 });

    /* Ken Burns on image */
    gsap.from(imgRef.current, { scale: 1.1, duration: 3, ease: 'power2.out' });

    /* ── Entrance timeline ── */
    const tl = gsap.timeline({ delay: 0.25, defaults: { ease: 'power4.out' } });

    tl.to(badgeRef.current, { autoAlpha: 1, y: 0, duration: 1 })
      .to(chars, {
        yPercent: 0,
        duration: 1.3,
        stagger:  { amount: 0.55, from: 'start' },
      }, '-=0.5')
      .to(subtitleRef.current, { autoAlpha: 1, y: 0, duration: 1 }, '-=0.6')
      .to(
        ctaRef.current ? Array.from(ctaRef.current.children) : [],
        { autoAlpha: 1, y: 0, stagger: 0.13, duration: 0.85 },
        '-=0.65',
      );

    return () => { split.revert(); };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{ height: '100svh', minHeight: '640px', background: 'var(--c-dark)' }}
    >
      {/* ── Background image ── */}
      <div ref={imgRef} className="absolute inset-0">
        <Image
          src="/newImages/ZibGt_Pdc1huKr7R_HERO_HOME.jpg"
          alt="Pizza Valley — Fresh Food Bahawalpur"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      {/* ── Gradient vignette ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.82) 100%)' }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 sm:px-8">

        {/* ── Location badge — prominent pill ── */}
        <div
          ref={badgeRef}
          className="flex items-center gap-1.5 sm:gap-3 mb-6 sm:mb-8 px-3 sm:px-5 py-2"
          style={{
            border:      '1.5px solid var(--c-secondary)',
            borderRadius: '999px',
            background:  'rgba(201,148,26,0.12)',
            backdropFilter: 'blur(6px)',
            outline:     'none',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--c-secondary)' }} />
          <span
            className="font-lato uppercase"
            style={{ fontSize: 'clamp(9px, 1.2vw, 13px)', color: 'var(--c-secondary)', fontWeight: 600, letterSpacing: '0.18em' }}
          >
            Bahawalpur
          </span>
          <span style={{ color: 'rgba(201,148,26,0.45)', fontSize: '9px' }}>✦</span>
          <span
            className="font-lato uppercase"
            style={{ fontSize: 'clamp(9px, 1.2vw, 13px)', color: 'var(--c-secondary)', fontWeight: 600, letterSpacing: '0.18em' }}
          >
            Yazman
          </span>
          <span style={{ color: 'rgba(201,148,26,0.45)', fontSize: '9px' }}>✦</span>
          <span
            className="font-lato uppercase hidden sm:inline"
            style={{ fontSize: 'clamp(9px, 1.2vw, 13px)', color: 'var(--c-secondary)', fontWeight: 600, letterSpacing: '0.18em' }}
          >
            Est. 2019
          </span>
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--c-secondary)' }} />
        </div>

        {/* ── Main title ── */}
        <h1
          ref={titleRef}
          className="font-anton text-white uppercase leading-none mb-6 sm:mb-8 st-wrap"
          suppressHydrationWarning
          style={{ fontSize: 'clamp(52px, 13.5vw, 192px)', lineHeight: 0.88 }}
        >
          Pizza Valley
        </h1>

        {/* ── Gold divider ── */}
        <div
          className="mx-auto mb-5 sm:mb-7"
          style={{ width: '4.5rem', height: '2px', background: 'var(--c-secondary)', borderRadius: '2px', opacity: 0.85 }}
        />

        {/* ── Subtitle ── */}
        <p
          ref={subtitleRef}
          className="font-playfair italic mb-8 sm:mb-12 px-4"
          style={{ fontSize: 'clamp(14px, 2vw, 24px)', color: 'rgba(251,245,231,0.88)' }}
        >
          A Legacy of Taste &amp; Tradition
        </p>

        {/* ── CTAs ── */}
        <div ref={ctaRef} className="flex flex-wrap gap-3 sm:gap-4 justify-center">
          <Link
            href="/category/regular-pizza"
            className="cta-pill font-lato text-[11px] tracking-[0.3em] uppercase px-7 sm:px-9 py-3.5 sm:py-4"
            style={{ background: 'var(--c-accent)', color: 'var(--c-bg)' }}
          >
            Order Now
          </Link>
          <Link
            href="/about"
            className="font-lato text-[11px] tracking-[0.3em] uppercase px-7 sm:px-9 py-3.5 sm:py-4 border text-white transition-all duration-500"
            style={{ borderColor: 'rgba(255,255,255,0.4)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            Our Story
          </Link>
        </div>
      </div>
    </section>
  );
}
