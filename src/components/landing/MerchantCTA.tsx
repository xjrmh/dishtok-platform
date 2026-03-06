"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { AnimatedSection } from "@/components/shared/AnimatedSection";

export function MerchantCTA() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-theme-panel-strong py-16 md:py-20"
    >
      {/* Decorative circles */}
      <div className="absolute -left-20 top-20 h-80 w-80 rounded-full bg-theme-primary/10 blur-3xl" />
      <div className="absolute -right-20 bottom-20 h-80 w-80 rounded-full bg-theme-accent/20 blur-3xl" />

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <AnimatedSection>
          <h2 className="mb-5 font-serif text-4xl font-bold text-white md:text-5xl">
            Ready to modernize your restaurant&apos;s digital first impression?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-lg text-white/60">
            Join the waitlist for AI-lite restaurant transformations built on a
            reliable framework, not one-off generated layouts.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          {submitted ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <CheckCircle2 className="w-16 h-16 text-green-400" />
              <p className="text-white text-xl font-semibold">
                You&apos;re on the list!
              </p>
              <p className="text-white/60">
                We&apos;ll reach out when early access opens.
              </p>
            </motion.div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full flex-1 rounded-xl border border-white/20 bg-white/10 px-5 py-3.5 text-white outline-none transition-colors placeholder:text-white/40 focus:border-theme-accent/60"
              />
              <Button
                type="submit"
                className="w-full rounded-xl bg-theme-accent px-6 py-3.5 font-semibold text-theme-accent-foreground hover:bg-theme-accent/90 sm:w-auto"
              >
                Sign Up
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          )}
        </AnimatedSection>

        <AnimatedSection delay={0.3}>
          <p className="mt-6 text-white/30 text-xs">
            No credit card required. Cancel anytime.
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
}
