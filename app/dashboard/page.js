"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Image, Calendar, MessageSquare, BarChart3,
  Plus, ShoppingBag, Gavel, Users, Settings,
} from "lucide-react";

const QUICK_ACTIONS = [
  { label: "Upload Artwork", href: "/dashboard/artworks/new", icon: Plus, color: "text-accent" },
  { label: "My Artworks", href: "/dashboard/artworks", icon: Image, color: "text-text-primary" },
  { label: "Create Event", href: "/dashboard/events", icon: Calendar, color: "text-text-primary" },
  { label: "Messages", href: "/dashboard/messages", icon: MessageSquare, color: "text-text-primary" },
  { label: "Orders", href: "/dashboard/orders", icon: ShoppingBag, color: "text-text-primary" },
  { label: "Auctions", href: "/dashboard/auctions", icon: Gavel, color: "text-text-primary" },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3, color: "text-text-primary" },
  { label: "Settings", href: "/dashboard/settings", icon: Settings, color: "text-text-primary" },
];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen px-6 py-12 max-w-7xl mx-auto">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <p className="section-label mb-3">Dashboard</p>
        <h1 className="font-heading text-4xl md:text-5xl mb-2">
          Welcome back, {session.user.name?.split(" ")[0]}
        </h1>
        <p className="text-text-secondary">
          {session.user.role === "artist"
            ? "Manage your portfolio and connect with collectors"
            : "Discover and collect extraordinary art"}
        </p>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        {QUICK_ACTIONS.map((action, i) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={action.href}
                className="group flex flex-col items-center gap-3 p-6 border border-border hover:border-accent/30 hover:bg-bg-elevated transition-all duration-300 text-center"
              >
                <Icon size={24} className={`${action.color} group-hover:text-accent transition-colors`} />
                <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                  {action.label}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Stats placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {[
          { label: "Total Views", value: "—", sub: "Across all artworks" },
          { label: "Followers", value: "—", sub: "Growing your audience" },
          { label: "Sales", value: "—", sub: "This month" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            className="border border-border p-8"
          >
            <p className="font-mono text-xs text-text-muted uppercase tracking-wider mb-2">
              {stat.label}
            </p>
            <p className="font-display text-4xl text-accent mb-1">{stat.value}</p>
            <p className="text-text-muted text-sm">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity placeholder */}
      <div className="border border-border p-8">
        <h2 className="font-heading text-2xl mb-6">Recent Activity</h2>
        <p className="text-text-muted">
          Your activity will appear here as you start using Staff Arts.{" "}
          <Link href="/dashboard/artworks/new" className="text-accent hover:text-accent-hover">
            Upload your first artwork
          </Link>{" "}
          to get started.
        </p>
      </div>
    </div>
  );
}
