import Link from "next/link";

const categoryLinks = [
  { label: "Regular Pizza",   slug: "regular-pizza"   },
  { label: "Special Pizza",   slug: "special-pizza"   },
  { label: "Burger",          slug: "burger"          },
  { label: "Sandwich",        slug: "sandwich"        },
  { label: "Roll",            slug: "roll"            },
  { label: "Wraps",           slug: "wraps"           },
  { label: "Cakes",           slug: "cakes"           },
  { label: "Pastries",        slug: "pastries"        },
  { label: "Wings",           slug: "wings"           },
  { label: "Fries",           slug: "fries"           },
];

const companyLinks = [
  { label: "About Us",         href: "/about"    },
  { label: "Our Branches",     href: "/branches" },
  { label: "Order Online",     href: "/category/regular-pizza" },
  { label: "My Account",       href: "/account"  },
  { label: "My Orders",        href: "/orders"   },
];

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeLinecap="round" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

const SOCIAL_URL = "https://www.facebook.com/pizzavalleysweetvalley";

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "#e8e3d5" }}>
      <div style={{ maxWidth: "1600px", margin: "auto", padding: "0 25px" }}>

        {/* ── Main columns ── */}
        <div className="py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">

            {/* Brand blurb */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="font-playfair italic font-bold text-[#8b1c1c] text-2xl mb-2 block">
                Pizza Valley
              </Link>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                Bahawalpur &amp; Yazman&apos;s favourite destination for fresh pizza, burgers, wraps, cakes and sweets. Free delivery above Rs. 1,500.
              </p>
              <p className="text-xs text-gray-700 font-semibold">📞 <a href="tel:+923005558706" className="hover:text-[#8b1c1c]">03005558706</a></p>
            </div>

            {/* Categories */}
            <div>
              <h3 className="font-bold text-base text-black mb-5 font-playfair">Menu</h3>
              <ul className="space-y-2.5">
                {categoryLinks.map(({ label, slug }) => (
                  <li key={slug}>
                    <Link href={`/category/${slug}`} className="text-black text-sm hover:text-[#8b1c1c] hover:underline transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-bold text-base text-black mb-5 font-playfair">Company</h3>
              <ul className="space-y-2.5">
                {companyLinks.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="text-black text-sm hover:text-[#8b1c1c] hover:underline transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Branches */}
            <div>
              <h3 className="font-bold text-base text-black mb-5 font-playfair">Find Us</h3>
              <div className="space-y-4 text-sm text-gray-700">
                <div>
                  <p className="font-semibold text-black">Bahawalpur Branch</p>
                  <p className="text-xs leading-relaxed">Bahawalpur, Punjab, Pakistan</p>
                  <a href="https://maps.app.goo.gl/anaMrdi3oKDKBo2c9" target="_blank" rel="noopener noreferrer"
                    className="text-[11px] text-[#8b1c1c] hover:underline">Get Directions →</a>
                </div>
                <div>
                  <p className="font-semibold text-black">Yazman Branch</p>
                  <p className="text-xs leading-relaxed">Yazman, Punjab, Pakistan</p>
                  <a href="https://maps.app.goo.gl/DgEp31vVL9d6ScqC7" target="_blank" rel="noopener noreferrer"
                    className="text-[11px] text-[#8b1c1c] hover:underline">Get Directions →</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-gray-300 py-6 flex flex-col items-center sm:flex-row sm:items-center justify-between gap-3">
          {/* Social icons */}
          <div className="flex items-center gap-3">
            <a href={SOCIAL_URL} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
              className="flex items-center justify-center w-10 h-10 border border-gray-500 text-black hover:bg-[#8b1c1c] hover:text-white hover:border-[#8b1c1c] transition-colors">
              <FacebookIcon />
            </a>
            <a href={SOCIAL_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
              className="flex items-center justify-center w-10 h-10 border border-gray-500 text-black hover:bg-[#8b1c1c] hover:text-white hover:border-[#8b1c1c] transition-colors">
              <InstagramIcon />
            </a>
            <a href="https://wa.me/923005558706" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
              className="flex items-center justify-center w-10 h-10 border border-gray-500 text-black hover:bg-[#25d366] hover:text-white hover:border-[#25d366] transition-colors">
              <WhatsAppIcon />
            </a>
          </div>

          {/* Copyright */}
          <p className="text-xs sm:text-sm text-black text-center sm:text-right">
            © 2026 Pizza Valley. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
