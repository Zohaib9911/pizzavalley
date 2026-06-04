const items = [
  'Pizza Valley',
  'Fresh Baked Daily',
  'Bahawalpur',
  'Yazman',
  'Free Delivery',
  'Order Online',
  'Since 2019',
  'Nueva Tradicion',
];

const repeated = [...items, ...items, ...items, ...items];

export default function MarqueeStrip() {
  return (
    <div
      className="overflow-hidden py-3 border-y"
      style={{
        background:   'var(--c-accent)',
        borderColor:  'var(--c-accent-dark)',
      }}
    >
      <div className="marquee-track flex gap-0 whitespace-nowrap">
        {repeated.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-5 font-lato text-[10px] tracking-[0.38em] uppercase px-6"
            style={{ color: 'var(--c-bg)' }}
          >
            {item}
            <span style={{ color: 'rgba(251,245,231,0.35)' }}>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
