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

  // Generate fading circles
  const fadingCircles = [
    { size: 300, x: "10%", y: "20%", delay: 0, duration: 8 },
    { size: 200, x: "80%", y: "30%", delay: 2, duration: 10 },
    { size: 250, x: "20%", y: "70%", delay: 4, duration: 9 },
    { size: 180, x: "70%", y: "60%", delay: 1, duration: 11 },
    { size: 220, x: "50%", y: "40%", delay: 3, duration: 7 },
    { size: 280, x: "90%", y: "80%", delay: 5, duration: 12 },
  ];

  return (
    <div className="bg-background text-text min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />

        {/* Fading Circles */}
        {fadingCircles.map((circle, i) => (
          <motion.div
            key={`circle-${i}`}
            className="absolute rounded-full"
            style={{
              width: circle.size,
              height: circle.size,
              left: circle.x,
              top: circle.y,
              background: `radial-gradient(circle, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05), transparent)`,
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3],
              x: [0, 30, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: circle.duration,
              delay: circle.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Additional glowing circles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`glow-${i}`}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 150 + 100,
              height: Math.random() * 150 + 100,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, ${
                i % 2 === 0
                  ? "rgba(99, 102, 241, 0.12)"
                  : "rgba(59, 130, 246, 0.12)"
              }, transparent)`,
              filter: "blur(40px)",
            }}
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              duration: Math.random() * 8 + 6,
              delay: Math.random() * 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Moving gradient orbs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 right-20 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-20 left-20 w-[600px] h-[600px] bg-accent/20 rounded-full blur-[100px]"
        />

        {/* Animated grid lines */}
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
              <motion.div
                whileHover={{ rotate: 180, scale: 1.1 }}
                transition={{ duration: 0.3 }}
                className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center shadow-[0_0_25px_rgba(59,130,246,0.4)]"
              >
                <Heart className="w-5 h-5 text-white" fill="currentColor" />
              </motion.div>
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
                  <motion.span
                    className="text-primary inline-block"
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{ duration: 5, repeat: Infinity }}
                    style={{
                      backgroundImage:
                        "linear-gradient(90deg, var(--color-primary), var(--color-accent), var(--color-primary))",
                      backgroundSize: "200% auto",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    Medicine Donations
                  </motion.span>
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
                  <motion.button
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => (window.location.href = "/auth")}
                    className="relative overflow-hidden bg-gradient-to-r from-primary to-accent text-white font-medium text-lg px-6 py-3 rounded-lg shadow-glow flex items-center justify-center gap-2 group"
                  >
                    <span className="relative z-10">Start Donating</span>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5 relative z-10" />
                    </motion.div>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-accent to-primary"
                      initial={{ x: "100%" }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.button>

                  <motion.button
                    whileHover={{
                      scale: 1.05,
                      borderColor: "var(--color-primary)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => (window.location.href = "/auth")}
                    className="border border-border text-text hover:bg-primary hover:text-white px-6 py-3 rounded-lg text-lg transition-all"
                  >
                    Request Help
                  </motion.button>
                </motion.div>

                <div className="space-y-3 pt-4">
                  {benefits.map((benefit, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + idx * 0.1, duration: 0.5 }}
                      whileHover={{ x: 10 }}
                      className="flex items-center gap-3 text-muted cursor-pointer"
                    >
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 360 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      </motion.div>
                      <span>{benefit}</span>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative perspective-1000"
          >
            <div className="relative">
              {/* Animated glow */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -inset-8 bg-gradient-to-r from-primary/30 to-accent/30 rounded-3xl blur-3xl"
              />

              <motion.img
                whileHover={{ scale: 1.02, rotateY: 5 }}
                transition={{ duration: 0.3 }}
                src={heroImage}
                alt="Medical donation illustration"
                loading="eager"
                className="relative z-10 w-full rounded-3xl shadow-2xl"
              />

              {/* Floating elements */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 bg-primary rounded-full"
                  style={{
                    top: `${20 + i * 30}%`,
                    right: `${-5 + i * 2}%`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    delay: i * 0.5,
                    repeat: Infinity,
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="bg-surface/50 backdrop-blur-sm border-y border-border py-16 relative overflow-hidden"
      >
        {/* Sliding line */}
        <motion.div
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 left-0 w-1/3 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
        />

        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: 0.6 + idx * 0.1,
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                }}
                whileHover={{ y: -10, scale: 1.05 }}
                className="text-center space-y-2 cursor-pointer"
              >
                <div className="flex justify-center">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center shadow-lg"
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </motion.div>
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6 + idx * 0.1 + 0.2, type: "spring" }}
                  className="text-3xl font-bold text-primary"
                >
                  {stat.value}
                </motion.div>
                <div className="text-sm text-muted">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
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
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.9 + idx * 0.1,
                  type: "spring",
                  stiffness: 100,
                }}
                whileHover={{
                  y: -15,
                  scale: 1.03,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                }}
                className="group bg-surface border border-border rounded-xl p-6 transition-all duration-300 cursor-pointer relative overflow-hidden"
              >
                {/* Animated background gradient on hover */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    background: `linear-gradient(135deg, transparent 0%, rgba(59, 130, 246, 0.05) 100%)`,
                  }}
                />

                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className={`w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center shadow-lg relative z-10`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </motion.div>

                <h3 className="text-lg font-semibold text-text mb-2 text-center relative z-10">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted text-center leading-relaxed relative z-10">
                  {feature.description}
                </p>

                {/* Corner accent */}
                <motion.div
                  className="absolute top-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    background:
                      "radial-gradient(circle at top right, rgba(59, 130, 246, 0.1), transparent)",
                  }}
                />
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Call to Action */}
      {!isAuthenticated && (
        <section className="w-full relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent" />

          {/* Animated lines */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-px bg-white/20"
              style={{
                width: "200%",
                top: `${30 + i * 20}%`,
                left: "-50%",
              }}
              animate={{
                x: ["0%", "50%"],
              }}
              transition={{
                duration: 10 + i * 2,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="relative max-w-4xl mx-auto px-6 py-20 text-center space-y-6"
          >
            <motion.h2
              animate={{
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="text-3xl md:text-4xl font-bold text-white"
            >
              Your Small Act Can Save Lives
            </motion.h2>
            <p className="text-white/90 text-lg max-w-2xl mx-auto">
              Donate unused medicines, masks, or medical tools — let's build a
              healthier world together.
            </p>
            <motion.button
              whileHover={{
                scale: 1.1,
                boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => (window.location.href = "/auth")}
              className="bg-white text-primary font-semibold px-8 py-4 rounded-lg inline-flex items-center gap-2 group"
            >
              <span>Join MediLink Now</span>
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            </motion.button>
          </motion.div>
        </section>
      )}

      <Footer />
    </div>
  );
}