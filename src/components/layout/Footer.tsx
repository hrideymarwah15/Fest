"use client";

import Link from "next/link";
import { Instagram, Twitter, Youtube, Mail, MapPin, Phone } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Youtube, href: "#", label: "YouTube" },
  ];

  const quickLinks = [
    { href: "/sports", label: "Sports Events" },
    { href: "/about", label: "About Fest" },
    { href: "/contact", label: "Contact Us" },
    { href: "/faq", label: "FAQs" },
  ];

  return (
    <footer className="bg-[var(--card-bg)] border-t border-[var(--card-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[var(--accent-primary)] rounded-lg flex items-center justify-center">
                <span className="font-display text-2xl text-white">R</span>
              </div>
              <div>
                <span className="font-display text-xl tracking-wide text-white block">
                  RISHIHOOD
                </span>
                <span className="text-xs text-[var(--text-muted)] uppercase tracking-widest">
                  Sports Fest 2026
                </span>
              </div>
            </div>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6">
              The biggest inter-college sports fest in Delhi NCR. Join us for an
              unforgettable experience of competition, camaraderie, and
              celebration.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:bg-[var(--accent-primary-dim)] transition-all"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display text-lg tracking-wide text-white mb-6">
              QUICK LINKS
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display text-lg tracking-wide text-white mb-6">
              CONTACT US
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[var(--accent-primary)] flex-shrink-0 mt-0.5" />
                <span className="text-[var(--text-secondary)] text-sm">
                  Rishihood University, Delhi-NCR
                  <br />
                  Sonipat, Haryana 131021
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[var(--accent-primary)]" />
                <a
                  href="tel:+919876543210"
                  className="text-[var(--text-secondary)] text-sm hover:text-[var(--accent-primary)] transition-colors"
                >
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[var(--accent-primary)]" />
                <a
                  href="mailto:sportsfest@rishihood.edu.in"
                  className="text-[var(--text-secondary)] text-sm hover:text-[var(--accent-primary)] transition-colors"
                >
                  sportsfest@rishihood.edu.in
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-display text-lg tracking-wide text-white mb-6">
              STAY UPDATED
            </h3>
            <p className="text-[var(--text-secondary)] text-sm mb-4">
              Subscribe to get the latest updates on events and registrations.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 bg-white/5 border border-[var(--card-border)] rounded-lg px-4 py-2 text-sm text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)]"
              />
              <button
                type="submit"
                className="bg-[var(--accent-primary)] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[var(--accent-primary-hover)] transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-[var(--card-border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[var(--text-muted)] text-sm">
            © {currentYear} Rishihood University. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="text-[var(--text-muted)] text-sm hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-[var(--text-muted)] text-sm hover:text-white transition-colors"
            >
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
