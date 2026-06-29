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
    slug: "health",
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
    title: "Essential Supplies",
    slug: "supplies",
    color: "category-supplies",
    categories: [
      { title: "Water", slug: "water" },
      { title: "Food & Rations", slug: "food-rations" },
      { title: "Medical & Medicines", slug: "medical" },
      { title: "Power & Light", slug: "power-light" },
      { title: "Communication & Safety", slug: "communication" },
      { title: "Clothing & Shelter", slug: "clothing-shelter" },
      { title: "Hygiene & Sanitation", slug: "hygiene" },
    ],
    tools: [
      { title: "Supply Calculator", slug: "calculator" },
      { title: "Shopping List Generator", slug: "shopping-list" },
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

export const natoCountries = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "PL", name: "Poland", flag: "🇵🇱" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "BE", name: "Belgium", flag: "🇧🇪" },
  { code: "TR", name: "Türkiye", flag: "🇹🇷" },
  { code: "GR", name: "Greece", flag: "🇬🇷" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "NO", name: "Norway", flag: "🇳🇴" },
  { code: "DK", name: "Denmark", flag: "🇩🇰" },
  { code: "CZ", name: "Czech Republic", flag: "🇨🇿" },
  { code: "RO", name: "Romania", flag: "🇷🇴" },
  { code: "BG", name: "Bulgaria", flag: "🇧🇬" },
  { code: "HR", name: "Croatia", flag: "🇭🇷" },
  { code: "SK", name: "Slovakia", flag: "🇸🇰" },
  { code: "SI", name: "Slovenia", flag: "🇸🇮" },
  { code: "LT", name: "Lithuania", flag: "🇱🇹" },
  { code: "LV", name: "Latvia", flag: "🇱🇻" },
  { code: "EE", name: "Estonia", flag: "🇪🇪" },
  { code: "AL", name: "Albania", flag: "🇦🇱" },
  { code: "ME", name: "Montenegro", flag: "🇲🇪" },
  { code: "MK", name: "North Macedonia", flag: "🇲🇰" },
  { code: "IS", name: "Iceland", flag: "🇮🇸" },
  { code: "LU", name: "Luxembourg", flag: "🇱🇺" },
  { code: "FI", name: "Finland", flag: "🇫🇮" },
  { code: "SE", name: "Sweden", flag: "🇸🇪" },
];

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
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