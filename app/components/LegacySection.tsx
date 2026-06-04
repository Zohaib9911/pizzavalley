'use client';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: 5,  suffix: '+',  label: 'Years of Excellence' },
  { value: 2,  suffix: '',   label: 'Branch Locations'    },
  { value: 10, suffix: 'K+', label: 'Happy Customers'     },
];

export default function LegacySection() {
  const sectionRef  = useRef<HTMLElement>(null);
  const textRef     = useRef<HTMLDivElement>(null);
  const statsRef    = useRef<HTMLDivElement>(null);
  const imageWrap   = useRef<HTMLDivElement>(null);
  const imageInner  = useRef<HTMLDivElement>(null);
  const counterRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      /* Text block reveal */
      gsap.fromTo(
        textRef.current ? Array.from(textRef.current.children) : [],
        { autoAlpha: 0, y: 42 },
        {
          autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.12,
          scrollTrigger: { trigger: textRef.current, start: 'top 100%', once: true },
        },
      );

      /* Stat counters */
      counterRefs.current.forEach((el, idx) => {
        if (!el) return;
        const obj = { val: 0 };
        gsap.to(obj, {
          val: stats[idx].value,
          duration: 2.4,
          ease: 'power2.out',
          scrollTrigger: { trigger: statsRef.current, start: 'top 100%', once: true },
          onUpdate() { el.textContent = Math.round(obj.val).toString(); },
        });
      });

      /* Stat cards reveal */
      gsap.fromTo(
        statsRef.current ? Array.from(statsRef.current.children) : [],
        { autoAlpha: 0, y: 38 },
        {
          autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.15,
          scrollTrigger: { trigger: statsRef.current, start: 'top 100%', once: true },
        },
      );

      /* Image parallax */
      gsap.to(imageInner.current, {
        yPercent: -12,
        ease: 'none',
        scrollTrigger: {
          trigger: imageWrap.current,
          start: 'top bottom',
          end:   'bottom top',
          scrub: 1.3,
        },
      });

      gsap.fromTo(
        imageWrap.current,
        { autoAlpha: 0, y: 45 },
        {
          autoAlpha: 1, y: 0, duration: 1.2, ease: 'power3.out',
          scrollTrigger: { trigger: imageWrap.current, start: 'top 100%', once: true },
        },
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-14 sm:py-28 px-4" style={{ background: 'var(--c-bg)' }}>
      <div className="max-w-6xl mx-auto">

        {/* Text */}
        <div ref={textRef} className="text-center mb-12">
          <p
            className="font-lato text-[10px] tracking-[0.45em] uppercase mb-3"
            style={{ color: 'var(--c-secondary)' }}
          >
            The Classic Baking Tradition
          </p>
          <h2
            className="font-anton uppercase leading-none mb-4"
            style={{ fontSize: 'clamp(2.2rem, 4.5vw, 5rem)', color: 'var(--c-accent)' }}
          >
            A Legacy of Taste
          </h2>
          <div className="w-10 h-px mx-auto mb-6" style={{ background: 'var(--c-accent)' }} />
          <p
            className="font-lato text-sm leading-relaxed max-w-3xl mx-auto mb-4"
            style={{ color: 'rgba(58,48,40,0.65)' }}
          >
            Pizza Valley is a culinary tradition that&apos;s a legacy of Pakistan, with a history of more
            than 5 years. The menu is exceedingly popular amongst Pakistanis, including celebrities,
            renowned business personalities and their families coming from all across the world. We
            believe in making the most delicious food to always delight our customers with quality
            and happiness.
          </p>
          <p
            className="font-lato text-sm font-medium tracking-widest"
            style={{ color: 'rgba(58,48,40,0.5)' }}
          >
            Bahawalpur &nbsp;|&nbsp; Yazman
          </p>
        </div>

        {/* Stats */}
        <div ref={statsRef} className="grid grid-cols-3 gap-3 sm:gap-8 mb-12 sm:mb-16 max-w-2xl mx-auto">
          {stats.map((s, i) => (
            <div key={s.label} className="text-center">
              <p
                className="font-anton leading-none mb-1"
                style={{ fontSize: 'clamp(2rem, 5.5vw, 5rem)', color: 'var(--c-accent)' }}
              >
                <span ref={(el) => { counterRefs.current[i] = el; }}>0</span>
                {s.suffix}
              </p>
              <p
                className="font-lato text-[9px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.28em] uppercase leading-tight"
                style={{ color: 'rgba(58,48,40,0.45)' }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Building image with parallax */}
        <div
          ref={imageWrap}
          className="relative w-full overflow-hidden"
          style={{ height: 'clamp(180px, 55vw, 420px)' }}
        >
          <div ref={imageInner} className="absolute inset-0 scale-110">
            <Image
              src="/images/PizzaValley and sweet Valley.png"
              alt="Pizza Valley"
              fill
              sizes="100vw"
              className="object-contain object-center"
            />
          </div>
          {/* Text overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-start pt-4 pointer-events-none">
            <span
              className="font-playfair italic font-bold drop-shadow-sm"
              style={{ fontSize: 'clamp(22px, 3.5vw, 46px)', color: 'var(--c-accent)' }}
            >
              Pizza Valley
            </span>
            <span
              className="font-lato text-[10px] tracking-[0.5em] uppercase mt-1"
              style={{ color: 'rgba(58,48,40,0.5)' }}
            >
              پیزا ویلی
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
