"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, CheckCircle2, Clock, Users } from "lucide-react";
import { format } from "date-fns";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { toast } from "sonner";

const timeSlots = [
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM",
  "2:00 PM", "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM",
  "7:30 PM", "8:00 PM", "8:30 PM", "9:00 PM", "9:30 PM",
];

interface ReservationFormProps {
  restaurantSlug: string;
  title?: string;
  description?: string;
}

export function ReservationForm({
  restaurantSlug,
  title = "Make a Reservation",
  description = "Reserve your table for an unforgettable dining experience",
}: ReservationFormProps) {
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");
  const [partySize, setPartySize] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time || !partySize || !name || !email || !phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          partySize: parseInt(partySize),
          date: format(date, "yyyy-MM-dd"),
          time,
          specialRequests: specialRequests || undefined,
          restaurantSlug,
        }),
      });

      if (!res.ok) throw new Error("Failed to create reservation");
      setSubmitted(true);
      toast.success("Reservation confirmed!");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="reservations" className="py-16 bg-white">
      <div className="mx-auto max-w-3xl px-6">
        <AnimatedSection className="text-center mb-10">
          <h2 className="mb-3 font-serif text-4xl font-bold text-theme-ink">
            {title}
          </h2>
          <p className="text-muted-foreground">{description}</p>
        </AnimatedSection>

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-4" />
              <h3 className="mb-2 font-serif text-2xl font-bold text-theme-ink">
                Reservation Confirmed!
              </h3>
              <p className="text-muted-foreground mb-2">
                {name}, your table for {partySize} on{" "}
                {date && format(date, "MMMM d, yyyy")} at {time} is confirmed.
              </p>
              <p className="text-sm text-muted-foreground">
                A confirmation email has been sent to {email}.
              </p>
              <Button
                onClick={() => setSubmitted(false)}
                variant="outline"
                className="mt-6"
              >
                Make Another Reservation
              </Button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleSubmit}
              className="space-y-6 rounded-[2rem] bg-theme-panel p-8 shadow-[0_18px_50px_rgba(42,31,27,0.05)]"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Date */}
                <div>
                  <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-theme-ink">
                    <CalendarDays className="h-4 w-4 text-theme-primary" />
                    Date
                  </label>
                  <Popover>
                    <PopoverTrigger
                      className="w-full justify-start rounded-md border border-theme-border bg-white px-3 py-2 text-left text-sm font-normal hover:bg-theme-surface"
                    >
                      {date ? format(date, "MMM d, yyyy") : "Select date"}
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(d) => d < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Time */}
                <div>
                  <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-theme-ink">
                    <Clock className="h-4 w-4 text-theme-primary" />
                    Time
                  </label>
                  <Select value={time} onValueChange={(v) => setTime(v ?? "")}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Party Size */}
                <div>
                  <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-theme-ink">
                    <Users className="h-4 w-4 text-theme-primary" />
                    Party Size
                  </label>
                  <Select value={partySize} onValueChange={(v) => setPartySize(v ?? "")}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Guests" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n} {n === 1 ? "Guest" : "Guests"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="Full Name *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-white"
                />
                <Input
                  type="email"
                  placeholder="Email *"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white"
                />
                <Input
                  type="tel"
                  placeholder="Phone *"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="bg-white"
                />
              </div>

              <textarea
                placeholder="Special requests or dietary requirements (optional)"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className="h-20 w-full resize-none rounded-lg border border-theme-border bg-white p-3 text-sm focus:border-theme-border-strong focus:outline-none"
              />

              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-theme-primary py-6 text-base font-semibold text-theme-primary-foreground hover:bg-theme-primary/90"
              >
                {loading ? "Confirming..." : "Book Now"}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
