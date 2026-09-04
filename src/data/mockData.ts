export interface NavSection {
  title: string;
  slug: string;
  color: string;
  categories: { title: string; slug: string }[];
  tools?: { title: string; slug: string }[];
}

export const navSections: NavSection[] = [
  {
    title: "Emergency News",
    slug: "emergency-news",
    color: "category-emergency",
    categories: [
      { title: "UK Alerts", slug: "uk-alerts" },
      { title: "NATO Updates", slug: "nato-updates" },
      { title: "Global Situation", slug: "global-situation" },
      { title: "Infrastructure Disruptions", slug: "infrastructure" },
    ],
    tools: [
      { title: "Breaking News", slug: "breaking" },
      { title: "Live Updates", slug: "live" },
    ],
  },
  {
    title: "Survival Guides",
    slug: "survival-guides",
    color: "category-survival",
    categories: [
      { title: "Emergency Planning", slug: "emergency-planning" },
      { title: "Evacuation & Shelter", slug: "evacuation-shelter" },
      { title: "Home Preparation", slug: "home-preparation" },
      { title: "Urban Survival", slug: "urban-survival" },
      { title: "Rural Survival", slug: "rural-survival" },
    ],
    tools: [
      { title: "72-Hour Kit Builder", slug: "kit-builder" },
      { title: "Evacuation Planner", slug: "evacuation-planner" },
    ],
  },
  {
    title: "Health & Wellness",
    slug: "health-wellness",
    color: "category-health",
    categories: [
      { title: "Child Safety", slug: "child-safety" },
      { title: "Adult Health", slug: "adults" },
      { title: "First Aid", slug: "first-aid" },
      { title: "Mental Health", slug: "mental-health" },
    ],
    tools: [
      { title: "Vaccination Tracker", slug: "vaccination-tracker" },
      { title: "First Aid Guide", slug: "first-aid-guide" },
    ],
  },
  {
    title: "Official Directives",
    slug: "directives",
    color: "category-directives",
    categories: [
      { title: "UK Ministry of Defence", slug: "uk-mod" },
      { title: "NATO Civil Preparedness", slug: "nato-civil" },
      { title: "EU Civil Protection", slug: "eu-civil" },
      { title: "Red Cross Guidance", slug: "red-cross" },
    ],
    tools: [
      { title: "Directive Archive", slug: "archive" },
      { title: "Country Guidance", slug: "by-country" },
    ],
  },
  {
    title: "Resources",
    slug: "resources",
    color: "category-resources",
    categories: [
      { title: "Checklists", slug: "checklists" },
      { title: "Templates", slug: "templates" },
      { title: "Schedules", slug: "schedules" },
      { title: "Downloads", slug: "downloads" },
    ],
    tools: [
      { title: "All Downloads", slug: "all-downloads" },
      { title: "Printable Packs", slug: "printable-packs" },
    ],
  },
  {
    title: "Education",
    slug: "education",
    color: "category-education",
    categories: [
      { title: "Courses", slug: "courses" },
      { title: "Training Programmes", slug: "training" },
      { title: "Workshops", slug: "workshops" },
    ],
    tools: [
      { title: "Browse All Courses", slug: "all-courses" },
      { title: "My Learning", slug: "my-courses" },
    ],
  },
  {
    title: "Podcast & Video",
    slug: "media",
    color: "category-resources",
    categories: [
      { title: "Podcasts", slug: "podcasts" },
      { title: "Videos", slug: "videos" },
      { title: "Documentaries", slug: "documentaries" },
      { title: "Interviews", slug: "interviews" },
    ],
    tools: [
      { title: "Media Hub", slug: "media-hub" },
      { title: "Latest Episodes", slug: "latest" },
    ],
  },
];

export interface Post {
  id: string;
  title: string;
  standfirst: string;
  section: string;
  category: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  image: string;
  tags: string[];
  viewCount: number;
  readTime: string;
  isPinned?: boolean;
}

// Empty array - no test posts
export const mockPosts: Post[] = [];

// Empty array - no test alerts
export const emergencyAlerts = [];

export interface Country {
  code: string;
  name: string;
  flag: string;
  continent: string;
}

// Risk levels for countries — single source of truth used by CountriesPage and AdminCountries sync
export const RISK_MAP: Record<string, "low" | "moderate" | "high" | "extreme"> = {
  US: "low", CA: "low", GB: "low", FR: "low", DE: "low",
  IT: "low", ES: "low", PT: "low", NL: "low", BE: "low",
  DK: "low", NO: "low", SE: "low", FI: "low", IS: "low",
  LU: "low", SI: "low", AT: "low", CH: "low", IE: "low",
  PL: "moderate", CZ: "moderate", SK: "moderate", HR: "moderate",
  RO: "moderate", BG: "moderate", GR: "moderate", AL: "moderate",
  ME: "moderate", MK: "moderate", RS: "moderate", BA: "moderate",
  LT: "high", LV: "high", EE: "high", TR: "high",
  UA: "high", MD: "moderate", GE: "moderate", AM: "moderate",
  IL: "high", IQ: "extreme", SY: "extreme", AF: "extreme",
  YE: "extreme", LY: "extreme", SS: "extreme", SO: "extreme",
  CF: "extreme", ML: "high", BF: "high", NE: "high",
  SD: "high", ET: "moderate", NG: "high", KP: "extreme",
  IR: "high", PK: "high", MM: "high",
};

// Countries that have a map on their detail page
export const MAP_COUNTRIES = new Set([
  "AL", "BE", "BG", "CA", "HR", "CZ", "DK", "EE", "FI", "FR",
  "DE", "GR", "HU", "IS", "IT", "LV", "LT", "LU", "ME", "NL",
  "MK", "NO", "PL", "PT", "RO", "SK", "SI", "ES", "SE", "TR",
  "GB", "US", "IE", "AU", "CH",
]);

// The 32 featured countries shown in the countries list
// (NATO members + Ireland, Australia, Switzerland)
export const natoCountries: Country[] = [
  { code: "AL", name: "Albania", flag: "🇦🇱", continent: "Europe" },
  { code: "BE", name: "Belgium", flag: "🇧🇪", continent: "Europe" },
  { code: "BG", name: "Bulgaria", flag: "🇧🇬", continent: "Europe" },
  { code: "CA", name: "Canada", flag: "🇨🇦", continent: "North America" },
  { code: "HR", name: "Croatia", flag: "🇭🇷", continent: "Europe" },
  { code: "CZ", name: "Czech Republic", flag: "🇨🇿", continent: "Europe" },
  { code: "DK", name: "Denmark", flag: "🇩🇰", continent: "Europe" },
  { code: "EE", name: "Estonia", flag: "🇪🇪", continent: "Europe" },
  { code: "FI", name: "Finland", flag: "🇫🇮", continent: "Europe" },
  { code: "FR", name: "France", flag: "🇫🇷", continent: "Europe" },
  { code: "DE", name: "Germany", flag: "🇩🇪", continent: "Europe" },
  { code: "GR", name: "Greece", flag: "🇬🇷", continent: "Europe" },
  { code: "HU", name: "Hungary", flag: "🇭🇺", continent: "Europe" },
  { code: "IS", name: "Iceland", flag: "🇮🇸", continent: "Europe" },
  { code: "IT", name: "Italy", flag: "🇮🇹", continent: "Europe" },
  { code: "LV", name: "Latvia", flag: "🇱🇻", continent: "Europe" },
  { code: "LT", name: "Lithuania", flag: "🇱🇹", continent: "Europe" },
  { code: "LU", name: "Luxembourg", flag: "🇱🇺", continent: "Europe" },
  { code: "ME", name: "Montenegro", flag: "🇲🇪", continent: "Europe" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱", continent: "Europe" },
  { code: "MK", name: "North Macedonia", flag: "🇲🇰", continent: "Europe" },
  { code: "NO", name: "Norway", flag: "🇳🇴", continent: "Europe" },
  { code: "PL", name: "Poland", flag: "🇵🇱", continent: "Europe" },
  { code: "PT", name: "Portugal", flag: "🇵🇹", continent: "Europe" },
  { code: "RO", name: "Romania", flag: "🇷🇴", continent: "Europe" },
  { code: "SK", name: "Slovakia", flag: "🇸🇰", continent: "Europe" },
  { code: "SI", name: "Slovenia", flag: "🇸🇮", continent: "Europe" },
  { code: "ES", name: "Spain", flag: "🇪🇸", continent: "Europe" },
  { code: "SE", name: "Sweden", flag: "🇸🇪", continent: "Europe" },
  { code: "TR", name: "Türkiye", flag: "🇹🇷", continent: "Europe" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", continent: "Europe" },
  { code: "US", name: "United States", flag: "🇺🇸", continent: "North America" },
  { code: "IE", name: "Ireland", flag: "🇮🇪", continent: "Europe" },
  { code: "AU", name: "Australia", flag: "🇦🇺", continent: "Oceania" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭", continent: "Europe" },
];

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  const time = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const day = date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  return `${time} · ${day}`;
}

export function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays}d ago`;
}

export function getSectionColor(slug: string): string {
  const section = navSections.find(s => s.slug === slug);
  return section?.color || "category-emergency";
}