import React from "react";
import { Heart, Twitter, Facebook, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full bg-[#0B0F1A] text-[var(--color-text)] border-t border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        {/* Brand Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)]">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-[var(--color-primary)]">MediLink</h2>
          </div>
          <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
            Connecting healthcare professionals worldwide for better patient care.
          </p>
          <div className="flex gap-3 mt-4">
            {[
              { Icon: Twitter, href: "#" },
              { Icon: Facebook, href: "#" },
              { Icon: Linkedin, href: "#" },
            ].map(({ Icon, href }, idx) => (
              <a
                key={idx}
                href={href}
                className="p-2 rounded-lg bg-[var(--color-surface)]/50 border border-[var(--color-border)] hover:bg-[var(--color-surface)] hover:text-[var(--color-primary)] transition"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {/* Platform */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-primary)] mb-3">
            Platform
          </h3>
          <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
            {["Listings", "Requests", "Chat", "Leaderboard"].map((item, idx) => (
              <li key={idx}>
                <a href="#" className="hover:text-[var(--color-primary)] transition">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-primary)] mb-3">
            Support
          </h3>
          <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
            {[
              "Help Center",
              "Safety",
              "Community Guidelines",
              "Privacy Policy",
            ].map((item, idx) => (
              <li key={idx}>
                <a href="#" className="hover:text-[var(--color-primary)] transition">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-primary)] mb-3">
            Contact
          </h3>
          <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
            <li>📧 support@medilink.com</li>
            <li>📞 +91 8081708199</li>
            <li>📍 Lucknow, UP</li>
          </ul>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-[var(--color-border)] text-center py-5 text-xs text-[var(--color-text-muted)]">
        © {new Date().getFullYear()}{" "}
        <span className="text-[var(--color-primary)] font-medium">MediLink</span>.
        All rights reserved. Built with care for healthcare professionals.
      </div>
    </footer>
  );
};

export default Footer;
