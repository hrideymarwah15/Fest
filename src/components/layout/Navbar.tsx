"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";
import { Menu, X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui";
import { useAuth } from "@/components/providers/AuthProvider";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/sports", label: "Sports" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  const navItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--card-border)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo - Enhanced with animations */}
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div
              className="w-10 h-10 bg-[var(--accent-primary)] rounded-lg flex items-center justify-center cursor-pointer"
              whileHover={{
                rotate: [0, -5, 5, 0],
                scale: 1.1,
              }}
              transition={{ duration: 0.3 }}
            >
              <motion.span
                className="font-display text-xl text-white"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                R
              </motion.span>
            </motion.div>
            <motion.div
              className="hidden sm:block"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <motion.span
                className="font-display text-xl tracking-wide text-white"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                RISHIHOOD
              </motion.span>
              <motion.span
                className="block text-[10px] text-[var(--text-muted)] uppercase tracking-widest"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                Sports Fest 2026
              </motion.span>
            </motion.div>
          </motion.div>

          {/* Desktop Navigation - Hidden when logged in */}
          {!user && (
            <motion.div
              className="hidden md:flex items-center gap-8"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 0.3,
                  },
                },
              }}
              initial="hidden"
              animate="visible"
            >
              {navLinks.map((link) => (
                <motion.div key={link.href} variants={navItemVariants}>
                  <Link
                    href={link.href}
                    className={`text-sm font-medium uppercase tracking-wide transition-all duration-300 ${pathname === link.href
                      ? "text-[var(--accent-primary)]"
                      : "text-[var(--text-secondary)] hover:text-white"
                      }`}
                  >
                    <motion.span
                      whileHover={{
                        scale: 1.05,
                        textShadow: "0 0 8px rgba(96, 165, 250, 0.5)",
                      }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {link.label}
                    </motion.span>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Auth Buttons */}
          <motion.div
            className="hidden md:flex items-center gap-4"
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
            animate="visible"
          >
            {user ? (
              <div className="flex items-center gap-4">
                {user.role === "ADMIN" && (
                  <motion.div variants={navItemVariants}>
                    <Link href="/admin">
                      <Button variant="ghost" size="sm">
                        Admin
                      </Button>
                    </Link>
                  </motion.div>
                )}
                <motion.div variants={navItemVariants}>
                  <Link href="/profile">
                    <Button variant="ghost" size="sm">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Button>
                  </Link>
                </motion.div>
                <motion.div variants={navItemVariants}>
                  <Link href="/dashboard">
                    <Button variant="secondary" size="sm">
                      Dashboard
                    </Button>
                  </Link>
                </motion.div>
                <motion.div variants={navItemVariants}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </motion.div>
              </div>
            ) : (
              <>
                <motion.div variants={navItemVariants}>
                  <Link href="/auth/signin">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                </motion.div>
                <motion.div variants={navItemVariants}>
                  <Link href="/sports">
                    <Button size="sm">Register Now</Button>
                  </Link>
                </motion.div>
              </>
            )}
          </motion.div>

          {/* Mobile Menu Button */}
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-white"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={{
            height: isOpen ? "auto" : 0,
            opacity: isOpen ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="md:hidden overflow-hidden"
        >
          <motion.div
            className="py-4 space-y-4"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            initial="hidden"
            animate={isOpen ? "visible" : "hidden"}
          >
            {/* Navigation Links - Hidden when logged in */}
            {!user && (
              <>
                {navLinks.map((link) => (
                  <motion.div key={link.href} variants={navItemVariants}>
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="block text-sm font-medium text-[var(--text-secondary)] hover:text-white transition-colors uppercase tracking-wide"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </>
            )}
            <motion.div
              className="pt-4 border-t border-[var(--card-border)] space-y-3"
              variants={navItemVariants}
            >
              {user ? (
                <>
                  {pathname === "/dashboard" ? (
                    <Button variant="secondary" size="sm" className="w-full cursor-default" disabled>
                      Profile
                    </Button>
                  ) : (
                    <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                      <Button variant="secondary" size="sm" className="w-full">
                        Profile
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth/signin" onClick={() => setIsOpen(false)}>
                    <Button variant="secondary" size="sm" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/sports" onClick={() => setIsOpen(false)}>
                    <Button size="sm" className="w-full">
                      Register Now
                    </Button>
                  </Link>
                </>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
