// src/modules/landing/pages/LandingPage.jsx
import React from "react";
import { Button } from "../../../shared/components/ui/Button";
import {
  Heart,
  ArrowRight,
  Package,
  FileText,
  MessageCircle,
  Shield,
} from "lucide-react";
import heroImage from "../../../assets/hero-medilink.jpg";
import Footer from "../../../shared/components/layouts/Footer";

export function LandingPage() {
  const isAuthenticated = !!localStorage.getItem("accessToken");

  const features = [
    {
      icon: Package,
      title: "Donate Medical Supplies",
      description:
        "Easily list unused medicines, masks, or equipment to help NGOs, hospitals, and individuals in need.",
    },
    {
      icon: FileText,
      title: "Request Assistance",
      description:
        "Submit verified requests for essential items and receive quick responses from generous donors.",
    },
    {
      icon: MessageCircle,
      title: "Connect & Coordinate",
      description:
        "Use our secure communication tools to coordinate pickups and deliveries seamlessly.",
    },
    {
      icon: Shield,
      title: "Verified Donations",
      description:
        "Every donation and request is verified to ensure transparency and trust across the MediLink network.",
    },
  ];

  return (
    <div className="bg-background text-text min-h-screen flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-16 items-center">
        {/* Left Content */}
        <div className="flex flex-col items-start text-left space-y-6 animate-slide-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center shadow-[0_0_25px_rgba(59,130,246,0.4)]">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-primary">MediLink</h1>
          </div>

          <h2 className="text-5xl sm:text-6xl font-extrabold leading-tight">
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
          </h2>

          <p className="text-text-muted leading-relaxed max-w-lg text-base sm:text-lg">
            {isAuthenticated
              ? "Continue supporting your community by donating or fulfilling medical supply requests. Every contribution counts."
              : "Join MediLink — a trusted platform connecting donors and recipients of life-saving medical supplies, building healthier communities together."}
          </p>

          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Button
                onClick={() => (window.location.href = "/auth")}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-medium text-lg px-6 py-3 rounded-lg shadow-glow"
              >
                Start Donating <ArrowRight className="ml-2 w-5 h-5" />
              </Button>

              <Button
                onClick={() => (window.location.href = "/auth")}
                variant="outline"
                className="border border-primary text-primary hover:bg-primary hover:text-white px-6 py-3 rounded-lg text-lg transition-all"
              >
                Request Help
              </Button>
            </div>
          )}
        </div>

        {/* Right Image */}
        <div className="relative flex justify-center items-center animate-fade-in">
          <div className="absolute -inset-12 bg-primary/25 blur-[120px] rounded-full" />
          <img
            src={heroImage}
            alt="Medical donation illustration"
            className="relative z-10 w-[95%] max-w-2xl md:max-w-none lg:w-[650px] xl:w-[700px] rounded-3xl shadow-[0_0_50px_rgba(59,130,246,0.3)] object-cover hover:shadow-[0_0_80px_rgba(59,130,246,0.4)] transition-all"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full max-w-6xl mx-auto px-6 py-20 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <div
              key={idx}
              className="bg-surface border border-border rounded-xl text-center p-6 hover:-translate-y-2 hover:shadow-glow transition-transform duration-300"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-background flex items-center justify-center shadow-inner">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-text-muted">{feature.description}</p>
            </div>
          );
        })}
      </section>

      {/* Call to Action */}
      {!isAuthenticated && (
        <section className="w-full bg-gradient-to-r from-primary to-accent py-16 text-center shadow-[0_-10px_30px_rgba(59,130,246,0.2)]">
          <h2 className="text-3xl font-bold mb-4 text-white">
            Your Small Act Can Save Lives
          </h2>
          <p className="text-gray-200 mb-8">
            Donate unused medicines, masks, or medical tools — let’s build a
            healthier world together.
          </p>
          <Button
            onClick={() => (window.location.href = "/auth")}
            className="bg-white text-primary font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-all"
          >
            Join MediLink Now <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </section>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
