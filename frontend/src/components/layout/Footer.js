import Link from 'next/link';
import { Github, Twitter, Instagram, Linkedin, Mail } from 'lucide-react';

const LINKS = {
  Shop: [
    { label: 'All Products', href: '/shop' },
    { label: 'Electronics', href: '/shop?category=Electronics' },
    { label: 'Clothing', href: '/shop?category=Clothing' },
    { label: 'Home & Garden', href: '/shop?category=Home+%26+Garden' },
    { label: 'New Arrivals', href: '/shop?sort=newest' },
  ],
  Account: [
    { label: 'Login', href: '/auth/login' },
    { label: 'Register', href: '/auth/register' },
    { label: 'My Orders', href: '/orders' },
    { label: 'Wishlist', href: '/wishlist' },
    { label: 'Settings', href: '/account' },
  ],
  Support: [
    { label: 'FAQ', href: '#' },
    { label: 'Shipping Info', href: '#' },
    { label: 'Returns', href: '#' },
    { label: 'Contact Us', href: '#' },
    { label: 'Privacy Policy', href: '#' },
  ],
};

const SOCIALS = [
  { Icon: Github, href: 'https://github.com', label: 'GitHub' },
  { Icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { Icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { Icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 mt-auto">
      <div className="page-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center text-white text-sm font-black">N</div>
              <span className="text-white">Nexa<span className="text-primary-400">Store</span></span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-6 max-w-xs">
              Your destination for premium products at great prices. Quality, convenience, and outstanding service — all in one place.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
              <Mail className="w-4 h-4 shrink-0" />
              <span>support@nexastore.com</span>
            </div>
            <div className="flex gap-3">
              {SOCIALS.map(({ Icon, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  className="w-9 h-9 bg-gray-800 hover:bg-primary-600 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">{title}</h3>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="text-sm text-gray-400 hover:text-white transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} NexaStore. All rights reserved.</p>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span>Powered by</span>
            <span className="text-primary-400 font-semibold">Next.js + MongoDB</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
