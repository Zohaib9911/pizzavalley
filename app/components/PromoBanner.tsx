'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function PromoBanner() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef    = useRef<HTMLDivElement>(null);
  const imageRef   = useRef<HTMLDivElement>(null);
  const imgInner   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      /* Text children slide from left */
      gsap.fromTo(
        textRef.current ? Array.from(textRef.current.children) : [],
        { x: -65, autoAlpha: 0 },
        {
          x: 0, autoAlpha: 1, duration: 1.1, ease: 'power4.out', stagger: 0.13,
          scrollTrigger: { trigger: section, start: 'top 100%', once: true },
        },
      );

      /* Image slides from right */
      gsap.fromTo(
        imageRef.current,
        { x: 60, autoAlpha: 0 },
        {
          x: 0, autoAlpha: 1, duration: 1.2, ease: 'power4.out',
          scrollTrigger: { trigger: section, start: 'top 100%', once: true },
        },
      );

      /* Parallax on image inner */
      gsap.to(imgInner.current, {
        yPercent: -12,
        ease:     'none',
        scrollTrigger: {
          trigger: section,
          start:   'top bottom',
          end:     'bottom top',
          scrub:   1.2,
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative overflow-hidden" style={{ background: 'var(--c-dark)' }}>
      {/* Top accent line */}
      <div
        className="absolute top-0 inset-x-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, var(--c-accent), transparent)' }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col md:flex-row items-center" style={{ minHeight: '440px' }}>

          {/* Text */}
          <div ref={textRef} className="flex-1 py-8 md:py-20 md:pr-14 text-center md:text-left z-10">
            <p
              className="font-lato text-[10px] tracking-[0.45em] uppercase mb-4"
              style={{ color: 'var(--c-secondary)' }}
            >
              Visit Us
            </p>
            <h2
              className="font-anton uppercase leading-none mb-4"
              style={{ fontSize: 'clamp(2rem, 5.5vw, 6rem)', color: '#fff', lineHeight: 0.92 }}
            >
              Pizza Valley<br />&amp; Sweets Valley
            </h2>
            <div className="w-10 h-px mb-6 mx-auto md:mx-0" style={{ background: 'var(--c-secondary)' }} />
            <p
              className="font-lato text-sm leading-relaxed mb-10 max-w-xs mx-auto md:mx-0"
              style={{ color: 'rgba(251,245,231,0.55)' }}
            >
              Your favourite destination for fresh pizza, burgers, wraps and sweet treats.
              Free home delivery — taste the difference in every bite.
            </p>
            <Link
              href="/category/regular-pizza"
              className="cta-pill font-lato text-[11px] tracking-[0.3em] uppercase px-9 py-4"
              style={{ background: 'var(--c-accent)', color: 'var(--c-bg)' }}
            >
              Order Now
            </Link>
          </div>

          {/* Image */}
          <div ref={imageRef} className="flex-1 relative w-full overflow-hidden" style={{ height: 'clamp(260px,44vw,460px)' }}>
            <div ref={imgInner} className="absolute inset-0 scale-110">
              <Image
                src="/images/PizzaValley and sweet Valley.png"
                alt="Pizza Valley & Sweets Valley Store"
                fill
                sizes="(max-width:768px) 100vw, 50vw"
                className="object-contain object-center"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 inset-x-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, var(--c-accent), transparent)' }}
      />
    </section>
  );
}
