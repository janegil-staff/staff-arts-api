import { clsx } from "clsx";

export function cn(...inputs) {
  return clsx(inputs);
}

export function formatPrice(cents, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 604800) return `${Math.floor(s / 86400)}d`;
  return formatDate(date);
}

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function truncate(str, max = 100) {
  if (str.length <= max) return str;
  return str.slice(0, max).trimEnd() + "…";
}

export function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function pluralize(count, singular, plural) {
  return `${count} ${count === 1 ? singular : (plural || singular + "s")}`;
}

export function generateId(length = 12) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Create API response
 */
export function apiResponse(data, status = 200) {
  return Response.json({ success: true, data }, { status });
}

export function apiError(message, status = 400) {
  return Response.json({ success: false, error: message }, { status });
}

/**
 * Pagination helper
 */
export function parsePagination(searchParams) {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}
