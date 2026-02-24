"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Palette, Eye, Building2 } from "lucide-react";

const ROLES = [
  { id: "artist", label: "Artist", desc: "Showcase and sell your work", icon: Palette },
  { id: "collector", label: "Collector", desc: "Discover and collect art", icon: Eye },
  { id: "gallery", label: "Gallery", desc: "Curate and exhibit", icon: Building2 },
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("artist");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, displayName, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      // Auto sign in
      const signInRes = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (signInRes?.error) {
        setError("Account created but sign in failed. Please log in.");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl mb-3">Join Staff Arts</h1>
          <p className="text-text-secondary">
            {step === 1 ? "How will you use Staff Arts?" : "Create your account"}
          </p>
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            {ROLES.map((r) => {
              const Icon = r.icon;
              return (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={`w-full flex items-center gap-5 p-6 border transition-all duration-300 text-left ${
                    role === r.id
                      ? "border-accent bg-accent/5"
                      : "border-border hover:border-border-hover"
                  }`}
                >
                  <Icon size={24} className={role === r.id ? "text-accent" : "text-text-muted"} />
                  <div>
                    <p className="font-body font-medium">{r.label}</p>
                    <p className="text-text-muted text-sm">{r.desc}</p>
                  </div>
                </button>
              );
            })}
            <button onClick={() => setStep(2)} className="w-full btn-primary mt-6">
              Continue
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-error/10 border border-error/20 text-error text-sm px-4 py-3">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm text-text-secondary mb-2">Full Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="input"
                placeholder="Your name"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="Min 8 characters"
                minLength={8}
                required
              />
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">
                Back
              </button>
              <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-50">
                {loading ? "Creating..." : "Create Account"}
              </button>
            </div>
          </form>
        )}

        <p className="text-center text-text-muted text-sm mt-8">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:text-accent-hover transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
