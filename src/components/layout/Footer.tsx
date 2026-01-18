"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Instagram, Twitter, Youtube, Mail, MapPin, Phone } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useAnimations";
import { containerVariants, itemVariants } from "@/lib/animations";

const Footer = () => {
  const { ref, isVisible } = useScrollAnimation();
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
    <footer ref={ref} className="bg-[var(--card-bg)] border-t border-[var(--card-border)] relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-30">
        <motion.div
          className="absolute top-0 left-0 w-full h-full"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear",
          }}
          style={{
            backgroundImage: "radial-gradient(circle at 50% 50%, rgba(96, 165, 250, 0.05) 0%, transparent 50%)",
            backgroundSize: "400px 400px",
          }}
        />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12"
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        >
          {/* Brand */}
          <motion.div variants={itemVariants}>
            <motion.div
              className="flex items-center gap-3 mb-6"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div
                className="w-12 h-12 bg-[var(--accent-primary)] rounded-lg flex items-center justify-center"
                whileHover={{
                  rotate: [0, -5, 5, 0],
                  scale: 1.1,
                }}
                transition={{ duration: 0.3 }}
              >
                <motion.span
                  className="font-display text-2xl text-white"
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  R
                </motion.span>
              </motion.div>
              <div>
                <span className="font-display text-xl tracking-wide text-white block">
                  RISHIHOOD
                </span>
                <span className="text-xs text-[var(--text-muted)] uppercase tracking-widest">
                  Sports Fest 2026
                </span>
              </div>
            </motion.div>
            <motion.p
              className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6"
              initial={{ opacity: 0 }}
              animate={isVisible ? { opacity: 1 } : {}}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              The biggest inter-college sports fest in Delhi NCR. Join us for an
              unforgettable experience of competition, camaraderie, and
              celebration.
            </motion.p>
            <motion.div
              className="flex gap-4"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 0.5,
                  },
                },
              }}
              initial="hidden"
              animate={isVisible ? "visible" : "hidden"}
            >
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:bg-[var(--accent-primary-dim)] transition-all"
                  variants={itemVariants}
                  whileHover={{
                    scale: 1.1,
                    rotate: 5,
                    boxShadow: "0 10px 25px rgba(96, 165, 250, 0.2)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </motion.div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <motion.h3
              className="font-display text-lg tracking-wide text-white mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              QUICK LINKS
            </motion.h3>
            <motion.ul
              className="space-y-3"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 0.4,
                  },
                },
              }}
              initial="hidden"
              animate={isVisible ? "visible" : "hidden"}
            >
              {quickLinks.map((link) => (
                <motion.li key={link.href} variants={itemVariants}>
                  <Link
                    href={link.href}
                    className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-all duration-300 text-sm group"
                  >
                    <motion.span
                      whileHover={{
                        x: 5,
                        textShadow: "0 0 8px rgba(96, 165, 250, 0.5)",
                      }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {link.label}
                    </motion.span>
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          {/* Contact */}
          <motion.div variants={itemVariants}>
            <motion.h3
              className="font-display text-lg tracking-wide text-white mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              CONTACT US
            </motion.h3>
            <motion.ul
              className="space-y-4"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.15,
                    delayChildren: 0.5,
                  },
                },
              }}
              initial="hidden"
              animate={isVisible ? "visible" : "hidden"}
            >
              <motion.li
                className="flex items-start gap-3"
                variants={itemVariants}
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <MapPin className="w-5 h-5 text-[var(--accent-primary)] flex-shrink-0 mt-0.5" />
                </motion.div>
                <span className="text-[var(--text-secondary)] text-sm">
                  Rishihood University, Delhi-NCR
                  <br />
                  Sonipat, Haryana 131021
                </span>
              </motion.li>
              <motion.li
                className="flex items-center gap-3"
                variants={itemVariants}
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Phone className="w-5 h-5 text-[var(--accent-primary)]" />
                </motion.div>
                <a
                  href="tel:+919876543210"
                  className="text-[var(--text-secondary)] text-sm hover:text-[var(--accent-primary)] transition-colors"
                >
                  +91 98765 43210
                </a>
              </motion.li>
              <motion.li
                className="flex items-center gap-3"
                variants={itemVariants}
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Mail className="w-5 h-5 text-[var(--accent-primary)]" />
                </motion.div>
                <a
                  href="mailto:sportsfest@rishihood.edu.in"
                  className="text-[var(--text-secondary)] text-sm hover:text-[var(--accent-primary)] transition-colors"
                >
                  sportsfest@rishihood.edu.in
                </a>
              </motion.li>
            </motion.ul>
          </motion.div>

          {/* Newsletter */}
          <motion.div variants={itemVariants}>
            <motion.h3
              className="font-display text-lg tracking-wide text-white mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              STAY UPDATED
            </motion.h3>
            <motion.p
              className="text-[var(--text-secondary)] text-sm mb-4"
              initial={{ opacity: 0 }}
              animate={isVisible ? { opacity: 1 } : {}}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              Subscribe to get the latest updates on events and registrations.
            </motion.p>
            <motion.form
              className="flex gap-2"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <motion.input
                type="email"
                placeholder="Your email"
                className="flex-1 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-4 py-2 text-sm text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] transition-all"
                whileFocus={{
                  scale: 1.02,
                  boxShadow: "0 0 0 2px rgba(96, 165, 250, 0.2)",
                }}
                transition={{ type: "spring", stiffness: 300 }}
              />
              <motion.button
                type="submit"
                className="bg-[var(--accent-primary)] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[var(--accent-primary-hover)] transition-all"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 5px 15px rgba(96, 165, 250, 0.3)",
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                Subscribe
              </motion.button>
            </motion.form>
          </motion.div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          className="mt-16 pt-8 border-t border-[var(--card-border)] flex flex-col sm:flex-row items-center justify-between gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <motion.p
            className="text-[var(--text-muted)] text-sm"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            © {currentYear} Rishihood University. All rights reserved.
          </motion.p>
          <motion.div
            className="flex gap-6"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 1,
                },
              },
            }}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
          >
            <motion.div variants={itemVariants}>
              <Link
                href="/privacy"
                className="text-[var(--text-muted)] text-sm hover:text-white transition-all duration-300"
              >
                <motion.span
                  whileHover={{
                    scale: 1.05,
                    textShadow: "0 0 8px rgba(255, 255, 255, 0.5)",
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  Privacy Policy
                </motion.span>
              </Link>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Link
                href="/terms"
                className="text-[var(--text-muted)] text-sm hover:text-white transition-all duration-300"
              >
                <motion.span
                  whileHover={{
                    scale: 1.05,
                    textShadow: "0 0 8px rgba(255, 255, 255, 0.5)",
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  Terms & Conditions
                </motion.span>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
