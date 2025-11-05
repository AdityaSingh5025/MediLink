import React from "react";
import { motion } from "framer-motion";
import {
  Heart,
  Twitter,
  Facebook,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  ArrowRight,
  Send,
} from "lucide-react";

const Footer = () => {
  const footerLinks = {
    Platform: [
      { name: "Listings", href: "/listings" },
      { name: "Requests", href: "/requests" },
      { name: "Chat", href: "/chat" },
      { name: "Leaderboard", href: "/leaderboard" },
    ],
    Support: [
      { name: "Help Center", href: "#" },
      { name: "Safety", href: "#" },
      { name: "Community Guidelines", href: "#" },
      { name: "Privacy Policy", href: "#" },
    ],
    Company: [
      { name: "About Us", href: "#" },
      { name: "Careers", href: "#" },
      { name: "Press", href: "#" },
      { name: "Blog", href: "#" },
    ],
  };

  const socialLinks = [
    { Icon: Twitter, href: "#", color: "hover:text-blue-400", name: "Twitter" },
    {
      Icon: Facebook,
      href: "#",
      color: "hover:text-blue-600",
      name: "Facebook",
    },
    {
      Icon: Linkedin,
      href: "#",
      color: "hover:text-blue-500",
      name: "LinkedIn",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <footer className="w-full bg-surface border-t border-border relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10"
        >
          {/* Brand Section */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 space-y-4"
          >
            <div className="flex items-center gap-2">
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(59, 130, 246, 0.3)",
                    "0 0 30px rgba(59, 130, 246, 0.5)",
                    "0 0 20px rgba(59, 130, 246, 0.3)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center"
              >
                <Heart className="w-5 h-5 text-white" fill="currentColor" />
              </motion.div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                MediLink
              </h2>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              Connecting healthcare professionals and donors worldwide for
              better patient care and community health. Together, we save lives.
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map(({ Icon, href, color, name }, idx) => (
                <motion.a
                  key={name}
                  href={href}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, type: "spring" }}
                  whileHover={{ scale: 1.1, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-3 rounded-lg bg-background border border-border ${color} transition-all duration-300`}
                  aria-label={name}
                >
                  <Icon size={18} />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([title, links], idx) => (
            <motion.div key={title} variants={itemVariants}>
              <h3 className="text-sm font-semibold text-text mb-4">{title}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <motion.a
                      href={link.href}
                      whileHover={{ x: 5 }}
                      className="text-sm text-muted hover:text-primary transition-all duration-200 flex items-center gap-2 group"
                    >
                      <motion.span
                        initial={{ width: 0 }}
                        whileHover={{ width: 8 }}
                        className="h-px bg-primary"
                      />
                      {link.name}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 pt-8 border-t border-border"
        >
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-lg font-semibold text-text mb-2">
                Stay Updated
              </h3>
              <p className="text-sm text-muted">
                Get the latest updates on donations and community impact.
              </p>
            </div>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-text placeholder-muted focus:border-primary focus:outline-none transition-all"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
              >
                <Send size={18} />
                Subscribe
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-8 pt-8 border-t border-border"
        >
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: Mail,
                text: "support@medilink.com",
                href: "mailto:support@medilink.com",
              },
              {
                icon: Phone,
                text: "+91 8081708199",
                href: "tel:+918081708199",
              },
              { icon: MapPin, text: "Lucknow, UP, India", href: "#" },
            ].map((item, idx) => (
              <motion.a
                key={idx}
                href={item.href}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                whileHover={{ x: 5 }}
                className="flex items-center gap-3 text-muted hover:text-primary transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center group-hover:border-primary transition-all">
                  <item.icon size={18} />
                </div>
                <span className="text-sm">{item.text}</span>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-border bg-background/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              © {new Date().getFullYear()}{" "}
              <span className="text-primary font-semibold">MediLink</span>. All
              rights reserved.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex items-center gap-2 text-xs"
            >
              <span>Made with</span>
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                }}
              >
                <Heart className="w-4 h-4 text-red-500" fill="currentColor" />
              </motion.div>
              <span>for healthcare professionals</span>
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
