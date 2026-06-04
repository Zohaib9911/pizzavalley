'use client';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';

gsap.registerPlugin(ScrollTrigger);

export default function StickyShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef  = useRef<HTMLDivElement>(null);
  const imgRef     = useRef<HTMLDivElement>(null);
  const text1Ref   = useRef<HTMLDivElement>(null);
  const text2Ref   = useRef<HTMLDivElement>(null);
  const subRef     = useRef<HTMLParagraphElement>(null);
  const ctaRef     = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      /* Split headline text */
      const splits: SplitType[] = [];
      [text1Ref.current, text2Ref.current].forEach((el) => {
        if (!el) return;
        const s = new SplitType(el, { types: 'chars,words' });
        s.words?.forEach((w) => {
          const we = w as HTMLElement;
          we.style.overflow      = 'hidden';
          we.style.display       = 'inline-block';
          we.style.verticalAlign = 'bottom';
        });
        gsap.set(s.chars ?? [], { yPercent: 110 });
        splits.push(s);
      });

      /* Trigger animations when section enters view */
      splits.forEach((s, i) => {
        gsap.to(s.chars ?? [], {
          yPercent: 0,
          duration: 1.3,
          ease:     'power4.out',
          stagger:  { amount: 0.45 },
          delay:    i * 0.18,
          scrollTrigger: {
            trigger: sectionRef.current,
            start:   'top 80%',
            once:    true,
          },
        });
      });

      gsap.fromTo([subRef.current, ctaRef.current],
        { autoAlpha: 0, y: 20 },
        {
          autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.15,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true },
          delay: 0.5,
        },
      );

      /* Parallax image */
      gsap.to(imgRef.current, {
        yPercent: -15,
        ease:     'none',
        scrollTrigger: {
          trigger: section,
          start:   'top bottom',
          end:     'bottom top',
          scrub:   1.5,
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{ minHeight: '90svh', background: 'var(--c-dark)' }}
    >
      {/* Background image with parallax */}
      <div ref={imgRef} className="absolute inset-0 scale-110">
        <Image
          src="/newImages/ZibP5PPdc1huKr9r_STICKY_HOME.jpg"
          alt="Pizza Valley — Products"
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      {/* Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.6) 100%)' }}
      />

      {/* Content */}
      <div
        ref={stickyRef}
        className="relative z-10 h-full flex flex-col justify-center px-5 sm:px-16 py-14 sm:py-24"
        style={{ minHeight: '90svh' }}
      >
        <p
          className="font-lato text-[10px] tracking-[0.55em] uppercase mb-8"
          style={{ color: 'var(--c-secondary)' }}
        >
          Pizza Valley &nbsp;&#x2022;&nbsp; Fresh &amp; Delicious
        </p>

        <div
          ref={text1Ref}
          className="font-anton uppercase st-wrap leading-none mb-2"
          suppressHydrationWarning
          style={{ fontSize: 'clamp(38px, 9.5vw, 132px)', lineHeight: 0.88, color: '#fff' }}
        >
          Nueva
        </div>
        <div
          ref={text2Ref}
          className="font-anton uppercase st-wrap leading-none mb-8 sm:mb-10"
          suppressHydrationWarning
          style={{ fontSize: 'clamp(38px, 9.5vw, 132px)', lineHeight: 0.88, color: 'var(--c-secondary)' }}
        >
          Tradicion
        </div>

        <p
          ref={subRef}
          className="font-lato text-sm leading-relaxed max-w-md mb-8 sm:mb-10"
          style={{ color: 'rgba(251,245,231,0.65)' }}
        >
          Every bite crafted with love. Fresh ingredients, bold flavours — delivered
          straight to your door in Bahawalpur &amp; Yazman.
        </p>

        <Link
          ref={ctaRef}
          href="/category/regular-pizza"
          className="cta-pill font-lato text-[11px] tracking-[0.3em] uppercase px-9 py-4 self-start"
          style={{ background: 'var(--c-accent)', color: 'var(--c-bg)' }}
        >
          Explore Menu
        </Link>
      </div>
    </section>
  );
}
