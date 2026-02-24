"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Search, SlidersHorizontal, Heart, Eye } from "lucide-react";

const MEDIUMS = [
  "All", "Painting", "Sculpture", "Photography", "Digital",
  "Mixed Media", "Print", "Textile", "Ceramic", "Installation",
];

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most Viewed" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
];

function ArtworkCard({ artwork, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
    >
      <Link href={`/artwork/${artwork._id}`} className="group block">
        <div className="artwork-card relative aspect-[3/4] bg-bg-secondary border border-border overflow-hidden mb-4">
          {artwork.primaryImage ? (
            <img
              src={artwork.primaryImage}
              alt={artwork.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-text-muted font-mono text-sm">No Image</span>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
              <div className="flex gap-3">
                <span className="flex items-center gap-1 text-xs text-white/80">
                  <Heart size={14} /> {artwork.likes?.length || 0}
                </span>
                <span className="flex items-center gap-1 text-xs text-white/80">
                  <Eye size={14} /> {artwork.views || 0}
                </span>
              </div>
              {artwork.pricing?.price > 0 && (
                <span className="font-mono text-sm text-white">
                  ${artwork.pricing.price.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* Status badge */}
          {artwork.status === "sold" && (
            <div className="absolute top-4 left-4 badge border-accent-red text-accent-red text-[10px]">
              Sold
            </div>
          )}
        </div>

        <h3 className="font-body font-medium text-sm group-hover:text-accent transition-colors truncate">
          {artwork.title}
        </h3>
        <p className="text-text-muted text-xs mt-1">
          {artwork.artistId?.displayName || "Unknown Artist"}
        </p>
        <p className="text-text-muted text-xs capitalize">{artwork.medium?.replace("_", " ")}</p>
      </Link>
    </motion.div>
  );
}

export default function ExplorePage() {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [medium, setMedium] = useState("All");
  const [sort, setSort] = useState("newest");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchArtworks();
  }, [medium, sort, page]);

  const fetchArtworks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "24",
        sort,
        status: "all",
      });
      if (medium !== "All") params.set("medium", medium.toLowerCase().replace(" ", "_"));
      if (search) params.set("search", search);

      const res = await fetch(`/api/artworks?${params}`);
      const data = await res.json();

      if (data.success) {
        setArtworks(data.data.artworks);
        setTotalPages(data.data.pages);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchArtworks();
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="px-6 pt-12 pb-8 max-w-[1800px] mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <p className="section-label mb-3">Discover</p>
          <h1 className="font-heading text-4xl md:text-6xl mb-8">Explore</h1>
        </motion.div>

        {/* Search */}
        <form onSubmit={handleSearch} className="relative max-w-xl mb-8">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search artworks, artists, styles..."
            className="input !pl-12"
          />
        </form>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {MEDIUMS.map((m) => (
            <button
              key={m}
              onClick={() => { setMedium(m); setPage(1); }}
              className={`px-4 py-2 text-sm transition-all duration-300 border ${
                medium === m
                  ? "border-accent text-accent bg-accent/5"
                  : "border-border text-text-secondary hover:border-border-hover hover:text-text-primary"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-3">
          <SlidersHorizontal size={14} className="text-text-muted" />
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="bg-transparent text-text-secondary text-sm border-none outline-none cursor-pointer"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value} className="bg-bg-secondary">
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Grid */}
      <section className="px-6 pb-24 max-w-[1800px] mx-auto">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-bg-secondary mb-4" />
                <div className="h-4 bg-bg-secondary w-3/4 mb-2" />
                <div className="h-3 bg-bg-secondary w-1/2" />
              </div>
            ))}
          </div>
        ) : artworks.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-text-muted text-lg mb-4">No artworks found</p>
            <p className="text-text-muted text-sm">
              Be the first to{" "}
              <Link href="/dashboard/artworks/new" className="text-accent hover:text-accent-hover">
                upload an artwork
              </Link>
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {artworks.map((artwork, i) => (
                <ArtworkCard key={artwork._id} artwork={artwork} index={i} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-16">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-10 h-10 font-mono text-sm transition-colors ${
                      p === page
                        ? "bg-accent text-bg-primary"
                        : "border border-border text-text-secondary hover:border-accent"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
