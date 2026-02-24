"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { format } from "date-fns";
import { MapPin, Calendar, ExternalLink } from "lucide-react";

const EVENT_TYPES = [
  "All", "Exhibition", "Workshop", "Talk", "Fair", "Opening", "Online Show",
];

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("All");

  useEffect(() => {
    fetchEvents();
  }, [type]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (type !== "All") params.set("type", type.toLowerCase().replace(" ", "_"));
      const res = await fetch(`/api/events?${params}`);
      const data = await res.json();
      if (data.success) setEvents(data.data.events);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen px-6 py-12 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
        <p className="section-label mb-3">What's Happening</p>
        <h1 className="font-heading text-4xl md:text-6xl mb-8">Events & Exhibitions</h1>
      </motion.div>

      {/* Type filter */}
      <div className="flex flex-wrap gap-2 mb-12">
        {EVENT_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`px-4 py-2 text-sm transition-all duration-300 border ${
              type === t
                ? "border-accent text-accent bg-accent/5"
                : "border-border text-text-secondary hover:border-border-hover"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse border border-border p-8">
              <div className="h-4 bg-bg-secondary w-1/3 mb-6" />
              <div className="h-6 bg-bg-secondary w-3/4 mb-4" />
              <div className="h-3 bg-bg-secondary w-1/2" />
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-32">
          <p className="text-text-muted text-lg mb-4">No upcoming events</p>
          <p className="text-text-muted text-sm">
            <Link href="/dashboard/events" className="text-accent hover:text-accent-hover">
              Create an event
            </Link>{" "}
            to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event, i) => (
            <motion.div
              key={event._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={`/events/${event._id}`}
                className="group block border border-border p-8 transition-all duration-500 hover:border-accent/30 hover:bg-bg-elevated h-full"
              >
                <p className="font-mono text-xs text-accent mb-4 capitalize">
                  {event.type?.replace("_", " ")}
                </p>
                <h3 className="font-heading text-2xl mb-4 group-hover:text-accent transition-colors">
                  {event.title}
                </h3>
                <p className="text-text-secondary text-sm mb-6 line-clamp-2">
                  {event.description}
                </p>
                <div className="space-y-2 mt-auto">
                  <p className="flex items-center gap-2 text-text-muted text-sm">
                    <Calendar size={14} />
                    {event.startDate && format(new Date(event.startDate), "MMM d, yyyy")}
                    {event.endDate && ` — ${format(new Date(event.endDate), "MMM d, yyyy")}`}
                  </p>
                  {event.venue?.name && (
                    <p className="flex items-center gap-2 text-text-muted text-sm">
                      <MapPin size={14} />
                      {event.venue.name}{event.venue.city && `, ${event.venue.city}`}
                    </p>
                  )}
                  {event.isVirtual && (
                    <p className="flex items-center gap-2 text-text-muted text-sm">
                      <ExternalLink size={14} />
                      Virtual Event
                    </p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
