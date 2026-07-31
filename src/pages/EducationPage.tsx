import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { publicSupabase } from "@/integrations/supabase/publicClient";
import { CourseCard } from "@/components/CourseCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  GraduationCap, BookOpen, Shield, Search, ChevronRight,
  Award, Loader2, Filter, Users, Star, Download, FileText,
  Lightbulb, Target, CheckCircle
} from "lucide-react";
import type { Course } from "@/types/monetization";

interface EducationProgramme {
  id: string;
  title: string;
  description: string;
  programme_type: "scouts" | "homeschool";
  age_group: string;
  age_label: string;
  level: string;
  badge_name: string | null;
  badge_icon: string | null;
  ks_key: string | null;
  content: string | null;
  topics: string[];
  activities: string[];
  subjects: string[];
  downloads: Array<{ title: string; url: string }>;
  resources: { title: string; url: string }[];
  sort_order: number;
  course_id: string | null;
}

type Tab = "courses" | "scouts" | "homeschool";

const LEVEL_BADGE: Record<string, string> = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-yellow-100 text-yellow-700",
  advanced: "bg-red-100 text-red-700",
};

const KS_COLOURS: Record<string, { bg: string; border: string; badge: string; text: string }> = {
  KS1: { bg: "bg-blue-50",   border: "border-blue-200",   badge: "bg-blue-100 text-blue-800",   text: "text-blue-700" },
  KS2: { bg: "bg-green-50",  border: "border-green-200",  badge: "bg-green-100 text-green-800",  text: "text-green-700" },
  KS3: { bg: "bg-yellow-50", border: "border-yellow-200", badge: "bg-yellow-100 text-yellow-800",text: "text-yellow-700" },
  KS4: { bg: "bg-red-50",    border: "border-red-200",    badge: "bg-red-100 text-red-800",      text: "text-red-700" },
};
const DEFAULT_KS_COLOUR = { bg: "bg-gray-50", border: "border-gray-200", badge: "bg-gray-100 text-gray-800", text: "text-gray-700" };

export default function EducationPage() {
  const [activeTab, setActiveTab] = useState<Tab>("courses");
  const [courses, setCourses] = useState<Course[]>([]);
  const [programmes, setProgrammes] = useState<EducationProgramme[]>([]);
  const [loading, setLoading] = useState(true);

  // Course filters
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Expanded homeschool card — uses programme ID
  const [expandedKS, setExpandedKS] = useState<string | null>(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [coursesRes, progRes] = await Promise.all([
        publicSupabase.from("courses").select("*").eq("is_published", true).order("created_at", { ascending: false }),
        publicSupabase.from("education_programmes").select("*").eq("is_published", true).order("sort_order"),
      ]);
      setCourses((coursesRes.data || []).map(c => ({ ...c, course_type: c.course_type || "course" })));
      setProgrammes(progRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const scouts = programmes.filter(p => p.programme_type === "scouts");
  const dbHomeschool = programmes.filter(p => p.programme_type === "homeschool");

  const featuredCourses = courses.filter(c => c.is_featured).slice(0, 3);

  const filteredCourses = courses
    .filter(c => {
      const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.description?.toLowerCase().includes(search.toLowerCase());
      const matchLevel = levelFilter === "all" || c.level === levelFilter;
      const matchPrice = priceFilter === "all" ||
        (priceFilter === "free" && c.is_free) ||
        (priceFilter === "paid" && !c.is_free);
      return matchSearch && matchLevel && matchPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "popular": return b.enrollment_count - a.enrollment_count;
        case "rating":  return b.rating - a.rating;
        case "price-low": return a.price - b.price;
        case "price-high": return b.price - a.price;
        default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const tabs = [
    { id: "courses"    as Tab, label: "Courses",        icon: GraduationCap },
    { id: "scouts"     as Tab, label: "Scouts & Guides", icon: Shield },
    { id: "homeschool" as Tab, label: "Home Schooling",  icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-8 sm:py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 flex-shrink-0" />
            <h1 className="text-2xl sm:text-4xl font-bold">Education</h1>
          </div>
          <p className="text-blue-200 text-sm sm:text-lg max-w-2xl leading-relaxed">
            Expert preparedness courses, Scouts &amp; Guides badge programmes, and UK Key Stage aligned home schooling resources — all in one place.
          </p>
          <div className="flex flex-wrap gap-3 sm:gap-6 mt-4 text-xs sm:text-sm text-blue-200">
            <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />{courses.length} Courses</span>
            <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />{scouts.length} Scout Programmes</span>
            <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />4 Key Stages</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="container mx-auto max-w-6xl px-2 sm:px-4">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors flex-shrink-0 ${
                  activeTab === tab.id
                    ? "border-blue-900 text-blue-900"
                    : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
                }`}
              >
                <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-3 sm:px-4 py-5 sm:py-8">

        {/* ── COURSES TAB ── */}
        {activeTab === "courses" && (
          <div>
            {/* Featured */}
            {featuredCourses.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <h2 className="text-xl font-bold">Featured Courses</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredCourses.map(c => <CourseCard key={c.id} course={c} featured />)}
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-5 mb-5 sm:mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="font-semibold text-sm">Filter Courses</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                <div className="relative sm:col-span-2 lg:col-span-1">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <Input placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
                </div>
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger><SelectValue placeholder="All Levels" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priceFilter} onValueChange={setPriceFilter}>
                  <SelectTrigger><SelectValue placeholder="All Prices" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="paid">Premium</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger><SelectValue placeholder="Sort By" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-5">
              Showing <span className="font-semibold text-gray-800">{filteredCourses.length}</span> course{filteredCourses.length !== 1 ? "s" : ""}
            </p>

            {loading ? (
              <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No courses match your filters.</p>
                <button onClick={() => { setSearch(""); setLevelFilter("all"); setPriceFilter("all"); }} className="mt-2 text-blue-600 text-sm hover:underline">Clear filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map(c => <CourseCard key={c.id} course={c} />)}
              </div>
            )}

            <div className="mt-10 sm:mt-12 bg-blue-900 rounded-xl p-5 sm:p-8 text-center text-white">
              <h3 className="text-xl sm:text-2xl font-bold mb-2">Unlock All Premium Courses</h3>
              <p className="text-blue-200 text-xs sm:text-sm mb-4 sm:mb-5 max-w-lg mx-auto">Subscribe for unlimited access to every course, resource, and preparedness guide on the platform.</p>
              <Link to="/subscribe" className="inline-block px-5 sm:px-7 py-2.5 sm:py-3 bg-white text-blue-900 font-bold text-sm rounded hover:bg-blue-50 transition-colors">View Membership Plans</Link>
            </div>
          </div>
        )}

        {/* ── SCOUTS & GUIDES TAB ── */}
        {activeTab === "scouts" && (
          <div>
            <div className="mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Scouts &amp; Guides Preparedness Programme</h2>
              <p className="text-gray-500 text-sm mt-1">
                UK age-group structured training with digital badge awards — from Squirrels to Explorers.
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : scouts.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No Scout &amp; Guides content published yet.</p>
                <p className="text-sm mt-1">Check back soon — programmes are being added.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {scouts.map(prog => (
                  <div key={prog.id} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 hover:shadow-md transition-shadow">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base">{prog.title}</h3>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${LEVEL_BADGE[prog.level] || LEVEL_BADGE.beginner}`}>
                        {prog.level}
                      </span>
                    </div>
                    <p className="text-xs text-blue-600 font-semibold mb-1.5">{prog.age_label} · Ages {prog.age_group}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{prog.description}</p>
                    {prog.badge_name && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <Award className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                        <span className="text-xs font-semibold text-yellow-700">{prog.badge_name}</span>
                      </div>
                    )}
                    {prog.course_id && (
                      <Link to={`/courses/${prog.course_id}`} className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-blue-900 hover:underline">
                        Start Course <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── HOME SCHOOLING TAB ── */}
        {activeTab === "homeschool" && (
          <div>
            {/* Intro banner */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 flex flex-col sm:flex-row gap-3 sm:gap-4 items-start">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-green-700" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Home Schooling Preparedness Curriculum</h2>
                <p className="text-gray-600 text-sm leading-relaxed max-w-2xl">
                  A structured, UK National Curriculum aligned programme covering personal safety, civil defence, global security, and survival science — from ages 5 to 16.
                </p>
                <div className="flex flex-wrap gap-2 sm:gap-3 mt-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-green-500" /> KS1–KS4 aligned</span>
                  <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-green-500" /> Downloadable resources</span>
                  <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-green-500" /> Practical activities</span>
                  <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-green-500" /> Cross-subject links</span>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : dbHomeschool.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No home schooling content published yet.</p>
                <p className="text-sm mt-1">An admin can add programmes from the Education panel.</p>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-5">
                {dbHomeschool.map(prog => {
                  const c = KS_COLOURS[prog.ks_key || ""] || DEFAULT_KS_COLOUR;
                  const isOpen = expandedKS === prog.id;
                  const hasDetail = (prog.topics?.length || 0) + (prog.activities?.length || 0) > 0;
                  return (
                    <div key={prog.id} className={`rounded-xl border-2 ${c.border} ${c.bg} overflow-hidden`}>
                      {/* Header */}
                      <button
                        onClick={() => hasDetail && setExpandedKS(isOpen ? null : prog.id)}
                        className={`w-full text-left p-3 sm:p-5 flex items-center gap-3 sm:gap-4 ${!hasDetail ? "cursor-default" : ""}`}
                      >
                        <span className="text-2xl sm:text-3xl leading-none flex-shrink-0">{prog.badge_icon || "📚"}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                            {prog.ks_key && (
                              <span className={`text-xs font-black px-2 py-0.5 rounded-full ${c.badge}`}>{prog.ks_key}</span>
                            )}
                            <span className="text-xs text-gray-500 font-medium">Ages {prog.age_group}</span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${LEVEL_BADGE[prog.level] || LEVEL_BADGE.beginner}`}>{prog.level}</span>
                          </div>
                          <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-snug">{prog.title}</h3>
                          <p className={`text-xs font-semibold ${c.text} mt-0.5 hidden sm:block`}>{prog.age_label}</p>
                        </div>
                        {hasDetail && (
                          <ChevronRight className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                        )}
                      </button>

                      {/* Expanded content */}
                      {isOpen && (
                        <div className="px-3 sm:px-5 pb-5 border-t border-white/60">
                          {prog.description && (
                            <p className="text-sm text-gray-700 leading-relaxed mt-4 mb-4">{prog.description}</p>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            {/* Topics */}
                            {prog.topics?.length > 0 && (
                              <div>
                                <div className="flex items-center gap-2 mb-3">
                                  <Target className={`w-4 h-4 ${c.text}`} />
                                  <span className="text-sm font-bold text-gray-800">Topics Covered</span>
                                </div>
                                <ul className="space-y-2">
                                  {prog.topics.map((t, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                      {t}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            <div className="space-y-4 sm:space-y-5">
                              {/* Activities */}
                              {prog.activities?.length > 0 && (
                                <div>
                                  <div className="flex items-center gap-2 mb-3">
                                    <Lightbulb className={`w-4 h-4 ${c.text}`} />
                                    <span className="text-sm font-bold text-gray-800">Practical Activities</span>
                                  </div>
                                  <ul className="space-y-2">
                                    {prog.activities.map((a, i) => (
                                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                        <span className={`w-5 h-5 rounded-full ${c.badge} flex items-center justify-center text-xs font-bold flex-shrink-0`}>{i + 1}</span>
                                        {a}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Subjects */}
                              {prog.subjects?.length > 0 && (
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <BookOpen className={`w-4 h-4 ${c.text}`} />
                                    <span className="text-sm font-bold text-gray-800">Subject Links</span>
                                  </div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {prog.subjects.map(s => (
                                      <span key={s} className="text-xs px-2 py-1 bg-white border border-gray-200 rounded text-gray-600">{s}</span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Downloads */}
                              {prog.downloads?.length > 0 && (
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Download className={`w-4 h-4 ${c.text}`} />
                                    <span className="text-sm font-bold text-gray-800">Free Downloads</span>
                                  </div>
                                  <div className="space-y-1.5">
                                    {prog.downloads.map((d, i) => (
                                      <a key={i} href={d.url} className="flex items-center gap-2 text-sm text-blue-700 hover:underline">
                                        <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                                        {d.title}
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Resources */}
                              {prog.resources?.length > 0 && (
                                <div className="pt-2 border-t border-gray-100">
                                  {prog.resources.map((r, i) => (
                                    <a key={i} href={r.url} target="_blank" rel="noreferrer"
                                      className="flex items-center gap-1.5 text-xs text-blue-700 hover:underline mb-1">
                                      <ChevronRight className="w-3 h-3" />{r.title}
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {prog.course_id && (
                            <Link to={`/courses/${prog.course_id}`} className="inline-flex items-center gap-1 mt-4 text-sm font-semibold text-blue-900 hover:underline">
                              Start Related Course <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
