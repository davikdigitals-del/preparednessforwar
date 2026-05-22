export interface NavSection {
  title: string;
  slug: string;
  color: string;
  categories: { title: string; slug: string }[];
  tools?: { title: string; slug: string }[];
  featured?: { title: string; slug: string; image?: string }[];
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
    featured: [
      { title: "UK Emergency Preparedness Guidelines 2026", slug: "uk-guidelines-2026", image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&q=80" },
      { title: "Power Grid Disruption: Northern Europe", slug: "power-grid-europe", image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&q=80" },
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
    featured: [
      { title: "Build a 14-Day Emergency Water Supply", slug: "water-supply-guide", image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&q=80" },
      { title: "Urban Evacuation Routes: Exit Strategy", slug: "urban-evacuation", image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&q=80" },
    ],
  },
  {
    title: "Health & Vaccination",
    slug: "health",
    color: "category-health",
    categories: [
      { title: "Children", slug: "children" },
      { title: "Adults", slug: "adults" },
      { title: "Elderly", slug: "elderly" },
      { title: "First Aid", slug: "first-aid" },
      { title: "Mental Health", slug: "mental-health" },
    ],
    tools: [
      { title: "Vaccination Tracker", slug: "vaccination-tracker" },
      { title: "First Aid Guide", slug: "first-aid-guide" },
    ],
    featured: [
      { title: "Essential First Aid Skills Every Household Needs", slug: "first-aid-skills", image: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400&q=80" },
      { title: "Mental Health Resilience in Crisis", slug: "mental-health-crisis", image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80" },
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
    featured: [
      { title: "NATO Civil Preparedness Framework", slug: "nato-framework", image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=400&q=80" },
      { title: "Red Cross Winter Shelter Guidelines", slug: "red-cross-shelter", image: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=400&q=80" },
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
    featured: [
      { title: "Long-Term Food Storage Guide", slug: "food-storage", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80" },
      { title: "Emergency Communication Without Internet", slug: "offline-comms", image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80" },
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
    featured: [
      { title: "Printable Emergency Checklists", slug: "emergency-checklists", image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&q=80" },
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
    featured: [
      { title: "Emergency Preparedness Courses", slug: "preparedness-courses", image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&q=80" },
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
    featured: [
      { title: "Podcast: Preparing for Power Outages", slug: "power-outage-podcast", image: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&q=80" },
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

export const mockPosts: Post[] = [
  {
    id: "1",
    title: "UK Government Issues Updated Emergency Preparedness Guidelines for 2026",
    standfirst: "New comprehensive guidelines cover household preparedness, communication plans, and community resilience strategies across all regions.",
    section: "emergency-news",
    category: "uk-alerts",
    author: "Sarah Mitchell",
    publishedAt: "2026-02-27T08:00:00Z",
    image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80",
    tags: ["UK", "preparedness", "government", "guidelines"],
    viewCount: 1250,
    readTime: "6 min",
    isPinned: true,
  },
  {
    id: "2",
    title: "NATO Resilience Committee Announces New Civil Preparedness Framework",
    standfirst: "The framework establishes minimum preparedness standards for all member states, focusing on critical infrastructure protection.",
    section: "emergency-news",
    category: "nato-updates",
    author: "James Crawford",
    publishedAt: "2026-02-26T14:30:00Z",
    image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80",
    tags: ["NATO", "resilience", "framework", "infrastructure"],
    viewCount: 980,
    readTime: "8 min",
  },
  {
    id: "3",
    title: "How to Build a 14-Day Emergency Water Supply for Your Family",
    standfirst: "Step-by-step guide to calculating, storing, and rotating water supplies for families of all sizes.",
    section: "survival-guides",
    category: "home-preparation",
    author: "Dr. Emily Rogers",
    publishedAt: "2026-02-25T10:00:00Z",
    image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800&q=80",
    tags: ["water", "storage", "family", "guide"],
    viewCount: 2100,
    readTime: "12 min",
  },
  {
    id: "4",
    title: "Essential First Aid Skills Every Household Member Should Know",
    standfirst: "From CPR to wound management — the critical skills that could save lives during an emergency when professional help is delayed.",
    section: "health",
    category: "first-aid",
    author: "Dr. Mark Thompson",
    publishedAt: "2026-02-24T09:00:00Z",
    image: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=800&q=80",
    tags: ["first-aid", "CPR", "training", "essential"],
    viewCount: 1850,
    readTime: "10 min",
  },
  {
    id: "5",
    title: "Power Grid Disruption Reported Across Northern Europe",
    standfirst: "Multiple countries report intermittent power outages affecting critical services. Authorities urge calm and provide guidance.",
    section: "emergency-news",
    category: "infrastructure",
    author: "Anna Kowalski",
    publishedAt: "2026-02-27T06:15:00Z",
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80",
    tags: ["power", "grid", "Europe", "infrastructure", "breaking"],
    viewCount: 3200,
    readTime: "4 min",
  },
  {
    id: "6",
    title: "Urban Evacuation Routes: Planning Your Exit Strategy",
    standfirst: "Understanding how to identify, plan, and practise evacuation routes in dense urban environments.",
    section: "survival-guides",
    category: "urban-survival",
    author: "Captain David Hughes",
    publishedAt: "2026-02-23T11:00:00Z",
    image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80",
    tags: ["evacuation", "urban", "routes", "planning"],
    viewCount: 1450,
    readTime: "9 min",
  },
  {
    id: "7",
    title: "Red Cross Updates Emergency Shelter Guidelines for Winter",
    standfirst: "Revised guidelines address heating, insulation, and sanitation in temporary shelters during cold weather operations.",
    section: "directives",
    category: "red-cross",
    author: "Helena Voss",
    publishedAt: "2026-02-22T08:30:00Z",
    image: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&q=80",
    tags: ["Red Cross", "shelter", "winter", "guidelines"],
    viewCount: 890,
    readTime: "7 min",
  },
  {
    id: "8",
    title: "Complete Guide to Emergency Communication Without Internet",
    standfirst: "From ham radio to mesh networks — reliable communication methods when digital infrastructure fails.",
    section: "supplies",
    category: "communication",
    author: "Tom Barrett",
    publishedAt: "2026-02-21T13:00:00Z",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
    tags: ["communication", "radio", "mesh", "offline"],
    viewCount: 1670,
    readTime: "15 min",
  },
  {
    id: "9",
    title: "Mental Health Resilience: Preparing Your Mind for Crisis",
    standfirst: "Psychological preparedness is as important as physical. Strategies for managing stress, anxiety, and decision-making under pressure.",
    section: "health",
    category: "mental-health",
    author: "Dr. Rachel Green",
    publishedAt: "2026-02-20T10:00:00Z",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
    tags: ["mental-health", "resilience", "stress", "psychology"],
    viewCount: 2300,
    readTime: "11 min",
  },
  {
    id: "10",
    title: "Long-Term Food Storage: A Comprehensive Rations Guide",
    standfirst: "How to build, maintain, and rotate a food supply that can sustain your family for 30 days or more.",
    section: "supplies",
    category: "food-rations",
    author: "Lisa Chen",
    publishedAt: "2026-02-19T09:00:00Z",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
    tags: ["food", "storage", "rations", "long-term"],
    viewCount: 1920,
    readTime: "14 min",
  },
  {
    id: "11",
    title: "Emergency Preparedness Courses: What to Take and Why",
    standfirst: "A guide to the most valuable training programmes available for civilians across NATO member states.",
    section: "education",
    category: "courses",
    author: "Prof. Linda Marsh",
    publishedAt: "2026-02-17T11:00:00Z",
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80",
    tags: ["education", "training", "courses", "civilians"],
    viewCount: 1100,
    readTime: "7 min",
  },
  {
    id: "12",
    title: "What to Do If UK Emergency Broadcast Activates",
    standfirst: "Step-by-step instructions for responding to the UK's emergency alert system and what actions to take immediately.",
    section: "emergency-news",
    category: "uk-alerts",
    author: "Sarah Mitchell",
    publishedAt: "2026-02-16T14:00:00Z",
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&q=80",
    tags: ["UK", "emergency", "broadcast", "alert"],
    viewCount: 2800,
    readTime: "5 min",
  },
  {
    id: "13",
    title: "Creating a Family Emergency Plan in 72 Hours",
    standfirst: "A practical timeline for developing a comprehensive family emergency plan that covers all essential scenarios.",
    section: "survival-guides",
    category: "emergency-planning",
    author: "Captain David Hughes",
    publishedAt: "2026-02-15T09:30:00Z",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
    tags: ["planning", "family", "emergency", "72-hours"],
    viewCount: 1560,
    readTime: "10 min",
  },
  {
    id: "14",
    title: "Vaccination Boosters Explained in Simple Language",
    standfirst: "Understanding which vaccination boosters are recommended, when to get them, and why they matter for emergency preparedness.",
    section: "health",
    category: "adults",
    author: "Dr. Mark Thompson",
    publishedAt: "2026-02-14T10:15:00Z",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80",
    tags: ["vaccination", "health", "boosters", "adults"],
    viewCount: 1340,
    readTime: "8 min",
  },
  {
    id: "15",
    title: "UK Ministry of Defence Emergency Guidance Simplified",
    standfirst: "Breaking down the MOD's latest emergency guidance into clear, actionable steps for ordinary citizens.",
    section: "directives",
    category: "uk-mod",
    author: "James Crawford",
    publishedAt: "2026-02-13T08:00:00Z",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
    tags: ["MOD", "UK", "guidance", "defence"],
    viewCount: 1780,
    readTime: "9 min",
  },
  {
    id: "16",
    title: "Water Purification Methods for Emergency Situations",
    standfirst: "Comparing different water purification techniques and when to use each method during emergencies.",
    section: "supplies",
    category: "water",
    author: "Dr. Emily Rogers",
    publishedAt: "2026-02-12T11:00:00Z",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80",
    tags: ["water", "purification", "emergency", "survival"],
    viewCount: 2150,
    readTime: "11 min",
  },
  {
    id: "17",
    title: "Printable Emergency Checklists for Every Scenario",
    standfirst: "Download and print comprehensive checklists covering evacuation, shelter-in-place, and emergency supplies.",
    section: "resources",
    category: "checklists",
    author: "Lisa Chen",
    publishedAt: "2026-02-11T09:00:00Z",
    image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&q=80",
    tags: ["checklists", "printable", "resources", "download"],
    viewCount: 3100,
    readTime: "3 min",
  },
  {
    id: "18",
    title: "First Aid Training: Where to Start",
    standfirst: "A beginner's guide to first aid training courses, certifications, and essential skills to learn first.",
    section: "education",
    category: "training",
    author: "Prof. Linda Marsh",
    publishedAt: "2026-02-10T13:30:00Z",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
    tags: ["first-aid", "training", "education", "courses"],
    viewCount: 1420,
    readTime: "6 min",
  },
  {
    id: "19",
    title: "Emergency Podcast: Preparing for Power Outages",
    standfirst: "Listen to our latest podcast episode covering everything you need to know about preparing for extended power outages.",
    section: "media",
    category: "podcasts",
    author: "Tom Barrett",
    publishedAt: "2026-02-09T10:00:00Z",
    image: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&q=80",
    tags: ["podcast", "power", "outage", "preparedness"],
    viewCount: 890,
    readTime: "45 min",
  },
  {
    id: "20",
    title: "Global Situation Update: February 2026",
    standfirst: "Monthly roundup of global security developments and their implications for civilian preparedness.",
    section: "emergency-news",
    category: "global-situation",
    author: "Anna Kowalski",
    publishedAt: "2026-02-08T08:00:00Z",
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80",
    tags: ["global", "security", "update", "situation"],
    viewCount: 2450,
    readTime: "12 min",
  },
];

export const emergencyAlerts = [
  { id: "a1", text: "ALERT: Power disruptions reported across Northern Europe — stay informed", priority: "high" as const, timestamp: "2026-02-27T06:15:00Z" },
  { id: "a2", text: "UK Met Office: Severe weather warning for Scotland and Northern England", priority: "medium" as const, timestamp: "2026-02-27T05:00:00Z" },
  { id: "a3", text: "NATO Civil Readiness: Updated preparedness recommendations published", priority: "low" as const, timestamp: "2026-02-26T14:30:00Z" },
];

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
