import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { publicSupabase } from "@/integrations/supabase/publicClient";
import { useAuth } from "@/contexts/AuthContext";
import { CourseCard } from "@/components/CourseCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  GraduationCap, BookOpen, Shield, Search, ChevronRight,
  Star, Clock, Users, Award, Loader2
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
  content: string | null;
  resources: { title: string; url: string }[];
  sort_order: number;
  course_id: string | null;
}

type Tab = "courses" | "scouts" | "homeschool";

const LEVEL_BADGE = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-yellow-100 text-yellow-700",
  advanced: "bg-red-100 text-red-700",
};

export default function EducationPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("courses");
  const [courses, setCourses] = useState<Course[]>([]);
  const [programmes, setProgrammes] = useState<EducationProgramme[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAll();
  }, []);

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

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!user) return <Navigate to="/login" replace />;

  const scouts = programmes.filter(p => p.programme_type === "scouts");
  const homeschool = programmes.filter(p => p.programme_type === "homeschool");

  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  const tabs = [
    { id: "courses" as Tab, label: "Courses", icon: GraduationCap },
    { id: "scouts" as Tab, label: "Scouts & Guides", icon: Shield },
    { id: "homeschool" as Tab, label: "Home Schooling", icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center gap-3 mb-3">
            <GraduationCap className="w-8 h-8 text-yellow-400" />
            <h1 className="text-3xl sm:text-4xl font-bold">Education</h1>
          </div>
          <p className="text-blue-200 text-lg max-w-2xl">
            Preparedness courses, Scouts & Guides programmes, and structured home schooling resources — all in one place.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="flex gap-0 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-900 text-blue-900"
                    : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 py-8">

        {/* ── COURSES TAB ── */}
        {activeTab === "courses" && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">All Courses</h2>
                <p className="text-gray-500 text-sm mt-1">{filteredCourses.length} courses available</p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search courses..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No courses found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map(course => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SCOUTS & GUIDES TAB ── */}
        {activeTab === "scouts" && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Scouts & Guides Programme</h2>
              <p className="text-gray-500 text-sm mt-1">
                UK age-group structured preparedness training with digital badges
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : scouts.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No Scout & Guides content published yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {scouts.map(prog => (
                  <div key={prog.id} className="bg-white rounded-xl border border-gray-200 p-5 flex gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl">
                      {prog.badge_icon || "🏅"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900">{prog.title}</h3>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${LEVEL_BADGE[prog.level as keyof typeof LEVEL_BADGE] || LEVEL_BADGE.beginner}`}>
                          {prog.level}
                        </span>
                      </div>
                      <p className="text-xs text-blue-600 font-semibold mb-1.5">{prog.age_label} · Ages {prog.age_group}</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{prog.description}</p>
                      {prog.badge_name && (
                        <div className="flex items-center gap-1.5 mt-2">
                          <Award className="w-4 h-4 text-yellow-500" />
                          <span className="text-xs font-semibold text-yellow-700">{prog.badge_name}</span>
                        </div>
                      )}
                      {prog.course_id && (
                        <Link
                          to={`/courses/${prog.course_id}`}
                          className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-blue-900 hover:underline"
                        >
                          Start Course <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── HOME SCHOOLING TAB ── */}
        {activeTab === "homeschool" && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Home Schooling Programme</h2>
              <p className="text-gray-500 text-sm mt-1">
                UK Key Stage aligned preparedness education for home educators
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : homeschool.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No home schooling content published yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {homeschool.map(prog => (
                  <div key={prog.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{prog.badge_icon || "📚"}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${LEVEL_BADGE[prog.level as keyof typeof LEVEL_BADGE] || LEVEL_BADGE.beginner}`}>
                        {prog.age_label}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">{prog.title}</h3>
                    <p className="text-xs text-blue-600 font-semibold mb-2">Ages {prog.age_group}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{prog.description}</p>
                    {prog.resources && prog.resources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 mb-1.5">Resources:</p>
                        <div className="space-y-1">
                          {prog.resources.map((r, i) => (
                            <a key={i} href={r.url} target="_blank" rel="noreferrer"
                              className="flex items-center gap-1.5 text-xs text-blue-700 hover:underline">
                              <ChevronRight className="w-3 h-3" />{r.title}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    {prog.course_id && (
                      <Link
                        to={`/courses/${prog.course_id}`}
                        className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-blue-900 hover:underline"
                      >
                        Start Course <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
