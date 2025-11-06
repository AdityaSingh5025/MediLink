import React from "react";
import { motion } from "framer-motion";
import {
  Heart,
  ArrowRight,
  Package,
  FileText,
  MessageCircle,
  Shield,
  Users,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import heroImage from "../../../assets/hero-medi.png";
import Footer from "../../../shared/components/layouts/Footer";

export function LandingPage() {
  const isAuthenticated = !!localStorage.getItem("accessToken");

  // Detect mobile device
  const isMobile = window.innerWidth <= 768;

  const features = [
    {
      icon: Package,
      title: "Donate Medical Supplies",
      description:
        "Easily list unused medicines, masks, or equipment to help NGOs, hospitals, and individuals in need.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: FileText,
      title: "Request Assistance",
      description:
        "Submit verified requests for essential items and receive quick responses from generous donors.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: MessageCircle,
      title: "Connect & Coordinate",
      description:
        "Use our secure communication tools to coordinate pickups and deliveries seamlessly.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Shield,
      title: "Verified Donations",
      description:
        "Every donation and request is verified to ensure transparency and trust across the MediLink network.",
      color: "from-orange-500 to-red-500",
    },
  ];

  const stats = [
    { icon: Users, value: "10K+", label: "Active Users" },
    { icon: Package, value: "50K+", label: "Donations Made" },
    { icon: Heart, value: "99%", label: "Satisfaction Rate" },
    { icon: TrendingUp, value: "24/7", label: "Support Available" },
  ];

  const benefits = [
    "Save lives by donating unused medical supplies",
    "Connect directly with verified recipients",
    "Track your donation impact in real-time",
    "Join a community of healthcare heroes",
  ];

  return (
    <div className="bg-background text-text min-h-screen relative overflow-hidden">
      {/* Simplified Background - Static on mobile, animated on desktop */}
      <div className="fixed inset-0 -z-10">
        {/* Simple gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        
        {/* Only add light effects on desktop */}
        {!isMobile && (
          <>
            {/* Single subtle orb instead of multiple */}
            <div className="absolute top-20 right-20 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[60px]" />
            <div className="absolute bottom-20 left-20 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[60px]" />
          </>
        )}

        {/* Grid pattern - static */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.02]">
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="text-primary"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto px-6 py-24 relative">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3 mb-2"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center shadow-lg">
                <Heart className="w-5 h-5 text-white" fill="currentColor" />
              </div>
              <h1 className="text-4xl font-bold text-primary">MediLink</h1>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl font-extrabold leading-tight"
            >
              {isAuthenticated ? (
                <>
                  Welcome back to <span className="text-primary">MediLink</span>
                </>
              ) : (
                <>
                  Bridging Hope Through{" "}
                  <span className="text-primary">Medicine Donations</span>
                </>
              )}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-muted leading-relaxed max-w-lg text-base sm:text-lg"
            >
              {isAuthenticated
                ? "Continue supporting your community by donating or fulfilling medical supply requests. Every contribution counts."
                : "Join MediLink — a trusted platform connecting donors and recipients of life-saving medical supplies, building healthier communities together."}
            </motion.p>

            {!isAuthenticated && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex flex-col sm:flex-row gap-4 mt-4"
                >
                  <button
                    onClick={() => (window.location.href = "/auth")}
                    className="bg-gradient-to-r from-primary to-accent text-white font-medium text-lg px-6 py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 hover:shadow-xl transition-shadow"
                  >
                    <span>Start Donating</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => (window.location.href = "/auth")}
                    className="border border-border text-text hover:bg-primary hover:text-white px-6 py-3 rounded-lg text-lg transition-all"
                  >
                    Request Help
                  </button>
                </motion.div>

                <div className="space-y-3 pt-4">
                  {benefits.map((benefit, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + idx * 0.1, duration: 0.5 }}
                      className="flex items-center gap-3 text-muted"
                    >
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>{benefit}</span>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Right Image - Simplified animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative">
              {/* Simple static glow instead of animated */}
              {!isMobile && (
                <div className="absolute -inset-8 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-2xl" />
              )}
              
              <img
                src={heroImage}
                alt="Medical donation illustration"
                loading="eager"
                className="relative z-10 w-full rounded-3xl shadow-2xl"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section - Simplified */}
      <section className="bg-surface/50 backdrop-blur-sm border-y border-border py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + idx * 0.1 }}
                className="text-center space-y-2"
              >
                <div className="flex justify-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="text-sm text-muted">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Reduced hover effects on mobile */}
      <section className="w-full max-w-6xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-3xl md:text-4xl font-bold">
            Why Choose <span className="text-primary">MediLink</span>?
          </h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            Our platform makes it easy and secure to donate or request medical
            supplies
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + idx * 0.1 }}
                className="group bg-surface border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div
                  className={`w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center shadow-lg`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-lg font-semibold text-text mb-2 text-center">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted text-center leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Call to Action - Simplified */}
      {!isAuthenticated && (
        <section className="w-full relative bg-gradient-to-br from-primary via-primary to-accent">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="relative max-w-4xl mx-auto px-6 py-20 text-center space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Your Small Act Can Save Lives
            </h2>
            <p className="text-white/90 text-lg max-w-2xl mx-auto">
              Donate unused medicines, masks, or medical tools — let's build a
              healthier world together.
            </p>
            <button
              onClick={() => (window.location.href = "/auth")}
              className="bg-white text-primary font-semibold px-8 py-4 rounded-lg inline-flex items-center gap-2 hover:shadow-lg transition-shadow"
            >
              <span>Join MediLink Now</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </section>
      )}

      <Footer />
    </div>
  );
}