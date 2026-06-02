import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, GripVertical, ArrowLeft, Video, FileText, HelpCircle, Download, Upload, Link2, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/FileUpload";
import { Checkbox } from "@/components/ui/checkbox";
import type { Course, CourseModule, CourseLesson } from "@/types/monetization";

export default function AdminCourseBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<CourseModule | null>(null);
  const [editingLesson, setEditingLesson] = useState<CourseLesson | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string>("");
  const { toast } = useToast();

  // Bulk episode upload state (episode-type courses only)
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkModuleId, setBulkModuleId] = useState<string>("");
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkEpisodes, setBulkEpisodes] = useState<Array<{
    title: string;
    video_url: string;
    duration: string;
    is_preview: boolean;
  }>>([{ title: "", video_url: "", duration: "", is_preview: false }]);

  const [moduleFormData, setModuleFormData] = useState({
    title: "",
    description: "",
    is_published: true,
  });

  const [lessonFormData, setLessonFormData] = useState({
    title: "",
    description: "",
    content_type: "video" as "video" | "text" | "quiz" | "assignment" | "download",
    video_url: "",
    video_duration: 0,
    text_content: "",
    is_preview: false,
    is_published: true,
  });

  useEffect(() => {
    if (id) {
      fetchCourseData();
    }
  }, [id]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      
      const [courseResult, modulesResult] = await Promise.all([
        supabase.from("courses").select("*").eq("id", id).single(),
        supabase
          .from("course_modules")
          .select(`
            *,
            lessons:course_lessons(*)
          `)
          .eq("course_id", id)
          .order("order_index", { ascending: true }),
      ]);

      if (courseResult.error) throw courseResult.error;
      if (modulesResult.error) throw modulesResult.error;

      setCourse(courseResult.data);
      setModules(modulesResult.data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const moduleData = {
        ...moduleFormData,
        course_id: id,
        order_index: editingModule ? editingModule.order_index : modules.length,
      };

      if (editingModule) {
        const { error } = await supabase
          .from("course_modules")
          .update(moduleData)
          .eq("id", editingModule.id);

        if (error) throw error;
        toast({ title: "Success", description: "Module updated successfully" });
      } else {
        const { error } = await supabase
          .from("course_modules")
          .insert([moduleData]);

        if (error) throw error;
        toast({ title: "Success", description: "Module created successfully" });
      }

      setModuleDialogOpen(false);
      resetModuleForm();
      fetchCourseData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedModuleId) {
      toast({
        title: "Error",
        description: "Please select a module",
        variant: "destructive",
      });
      return;
    }

    try {
      const module = modules.find(m => m.id === selectedModuleId);
      const lessonData = {
        ...lessonFormData,
        module_id: selectedModuleId,
        course_id: id,
        order_index: editingLesson ? editingLesson.order_index : (module?.lessons?.length || 0),
      };

      if (editingLesson) {
        const { error } = await supabase
          .from("course_lessons")
          .update(lessonData)
          .eq("id", editingLesson.id);

        if (error) throw error;
        toast({ title: "Success", description: "Lesson updated successfully" });
      } else {
        const { error } = await supabase
          .from("course_lessons")
          .insert([lessonData]);

        if (error) throw error;
        toast({ title: "Success", description: "Lesson created successfully" });
      }

      setLessonDialogOpen(false);
      resetLessonForm();
      fetchCourseData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Delete this module and all its lessons?")) return;

    try {
      const { error } = await supabase
        .from("course_modules")
        .delete()
        .eq("id", moduleId);

      if (error) throw error;
      toast({ title: "Success", description: "Module deleted successfully" });
      fetchCourseData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Delete this lesson?")) return;

    try {
      const { error } = await supabase
        .from("course_lessons")
        .delete()
        .eq("id", lessonId);

      if (error) throw error;
      toast({ title: "Success", description: "Lesson deleted successfully" });
      fetchCourseData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetModuleForm = () => {
    setEditingModule(null);
    setModuleFormData({
      title: "",
      description: "",
      is_published: true,
    });
  };

  const resetLessonForm = () => {
    setEditingLesson(null);
    setSelectedModuleId("");
    setLessonFormData({
      title: "",
      description: "",
      content_type: "video",
      video_url: "",
      video_duration: 0,
      text_content: "",
      is_preview: false,
      is_published: true,
    });
  };

  // ── Bulk episode helpers ────────────────────────────────────────────────
  const addBulkRow = () =>
    setBulkEpisodes(prev => [...prev, { title: "", video_url: "", duration: "", is_preview: false }]);

  const removeBulkRow = (i: number) =>
    setBulkEpisodes(prev => prev.filter((_, idx) => idx !== i));

  const updateBulkRow = (i: number, field: string, value: string | boolean) =>
    setBulkEpisodes(prev => prev.map((ep, idx) => idx === i ? { ...ep, [field]: value } : ep));

  // Paste a block of URLs (one per line) and auto-create rows
  const handleBulkPaste = (raw: string) => {
    const lines = raw.split("\n").map(l => l.trim()).filter(Boolean);
    if (!lines.length) return;
    setBulkEpisodes(lines.map((url, i) => ({
      title: `Episode ${i + 1}`,
      video_url: url,
      duration: "",
      is_preview: false,
    })));
  };

  const handleBulkSave = async () => {
    if (!bulkModuleId) {
      toast({ title: "Select a module first", variant: "destructive" });
      return;
    }
    const valid = bulkEpisodes.filter(ep => ep.video_url.trim());
    if (!valid.length) {
      toast({ title: "Add at least one video URL", variant: "destructive" });
      return;
    }
    setBulkSaving(true);
    try {
      const module = modules.find(m => m.id === bulkModuleId);
      const existingCount = module?.lessons?.length || 0;
      const rows = valid.map((ep, i) => ({
        course_id: id,
        module_id: bulkModuleId,
        title: ep.title || `Episode ${existingCount + i + 1}`,
        content_type: "video" as const,
        video_url: ep.video_url.trim(),
        video_duration: parseInt(ep.duration) || 0,
        is_preview: ep.is_preview,
        is_published: true,
        order_index: existingCount + i,
      }));
      const { error } = await supabase.from("course_lessons").insert(rows);
      if (error) throw error;
      toast({ title: "Success", description: `${rows.length} episode${rows.length > 1 ? "s" : ""} added` });
      setBulkDialogOpen(false);
      setBulkEpisodes([{ title: "", video_url: "", duration: "", is_preview: false }]);
      setBulkModuleId("");
      fetchCourseData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setBulkSaving(false);
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="w-4 h-4" />;
      case "text": return <FileText className="w-4 h-4" />;
      case "quiz": return <HelpCircle className="w-4 h-4" />;
      case "download": return <Download className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Course not found</p>
        <Button onClick={() => navigate("/admin/courses")} className="mt-4">
          Back to Courses
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate("/admin/courses")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold">{course.title}</h1>
          <p className="text-muted-foreground mt-1">
            {course.course_type === 'episode' ? 'Episode Series Builder' : 'Course Curriculum Builder'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {course.course_type === 'episode' && (
            <Button
              variant="outline"
              onClick={() => {
                setBulkModuleId(modules[0]?.id || "");
                setBulkEpisodes([{ title: "", video_url: "", duration: "", is_preview: false }]);
                setBulkDialogOpen(true);
              }}
            >
              <Upload className="w-4 h-4 mr-2" />
              Add Episodes
            </Button>
          )}
          <Button onClick={() => { resetModuleForm(); setModuleDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Module
          </Button>
        </div>
      </div>

      {/* Course Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-muted-foreground">Total Modules</p>
          <p className="text-2xl font-bold">{modules.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-muted-foreground">Total Lessons</p>
          <p className="text-2xl font-bold">
            {modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-muted-foreground">Published Modules</p>
          <p className="text-2xl font-bold">{modules.filter(m => m.is_published).length}</p>
        </div>
      </div>

      {/* Modules & Lessons */}
      <div className="space-y-4">
        {modules.length === 0 ? (
          <div className="bg-white p-12 rounded-lg border text-center">
            <p className="text-gray-600 mb-4">No modules yet. Add your first module to get started.</p>
            <Button onClick={() => { resetModuleForm(); setModuleDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Module
            </Button>
          </div>
        ) : (
          modules.map((module, moduleIndex) => (
            <div key={module.id} className="bg-white rounded-lg border">
              <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GripVertical className="w-5 h-5 text-gray-400" />
                  <div>
                    <h3 className="font-semibold">
                      Module {moduleIndex + 1}: {module.title}
                    </h3>
                    {module.description && (
                      <p className="text-sm text-gray-600">{module.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!module.is_published && (
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Draft</span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingModule(module);
                      setModuleFormData({
                        title: module.title,
                        description: module.description || "",
                        is_published: module.is_published,
                      });
                      setModuleDialogOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteModule(module.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      resetLessonForm();
                      setSelectedModuleId(module.id);
                      setLessonDialogOpen(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Lesson
                  </Button>
                  {course.course_type === 'episode' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setBulkModuleId(module.id);
                        setBulkEpisodes([{ title: "", video_url: "", duration: "", is_preview: false }]);
                        setBulkDialogOpen(true);
                      }}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Bulk Add
                    </Button>
                  )}
                </div>
              </div>

              {/* Lessons */}
              <div className="divide-y">
                {module.lessons && module.lessons.length > 0 ? (
                  module.lessons.map((lesson, lessonIndex) => (
                    <div key={lesson.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                        {getContentIcon(lesson.content_type)}
                        <div>
                          <div className="font-medium">
                            Lesson {lessonIndex + 1}: {lesson.title}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="capitalize">{lesson.content_type}</span>
                            {lesson.video_duration && (
                              <span>• {lesson.video_duration} min</span>
                            )}
                            {lesson.is_preview && (
                              <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">Preview</span>
                            )}
                            {!lesson.is_published && (
                              <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">Draft</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingLesson(lesson);
                            setSelectedModuleId(module.id);
                            setLessonFormData({
                              title: lesson.title,
                              description: lesson.description || "",
                              content_type: lesson.content_type,
                              video_url: lesson.video_url || "",
                              video_duration: lesson.video_duration || 0,
                              text_content: lesson.text_content || "",
                              is_preview: lesson.is_preview,
                              is_published: lesson.is_published,
                            });
                            setLessonDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteLesson(lesson.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    No lessons in this module yet
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Module Dialog */}
      <Dialog open={moduleDialogOpen} onOpenChange={setModuleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingModule ? "Edit Module" : "Create New Module"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleModuleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="module_title">Module Title *</Label>
              <Input
                id="module_title"
                value={moduleFormData.title}
                onChange={(e) => setModuleFormData({ ...moduleFormData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="module_description">Description</Label>
              <Textarea
                id="module_description"
                value={moduleFormData.description}
                onChange={(e) => setModuleFormData({ ...moduleFormData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="module_published"
                checked={moduleFormData.is_published}
                onCheckedChange={(checked) => setModuleFormData({ ...moduleFormData, is_published: checked as boolean })}
              />
              <Label htmlFor="module_published">Published</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setModuleDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingModule ? "Update Module" : "Create Module"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Lesson Dialog */}
      <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{editingLesson ? "Edit Lesson" : "Create New Lesson"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLessonSubmit} className="space-y-4">
            {!editingLesson && (
              <div>
                <Label htmlFor="lesson_module">Module *</Label>
                <Select
                  value={selectedModuleId}
                  onValueChange={setSelectedModuleId}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select module" />
                  </SelectTrigger>
                  <SelectContent>
                    {modules.map((module, index) => (
                      <SelectItem key={module.id} value={module.id}>
                        Module {index + 1}: {module.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="lesson_title">Lesson Title *</Label>
              <Input
                id="lesson_title"
                value={lessonFormData.title}
                onChange={(e) => setLessonFormData({ ...lessonFormData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="lesson_description">Description</Label>
              <Textarea
                id="lesson_description"
                value={lessonFormData.description}
                onChange={(e) => setLessonFormData({ ...lessonFormData, description: e.target.value })}
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="content_type">Content Type *</Label>
              <Select
                value={lessonFormData.content_type}
                onValueChange={(value: any) => setLessonFormData({ ...lessonFormData, content_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="text">Text/Article</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="download">Downloadable Resource</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {lessonFormData.content_type === "video" && (
              <>
                <div>
                  <FileUpload
                    type="video"
                    currentUrl={lessonFormData.video_url}
                    onUrlChange={(url) => setLessonFormData({ ...lessonFormData, video_url: url })}
                    label="Video URL"
                  />
                </div>
                <div>
                  <Label htmlFor="video_duration">Duration (minutes)</Label>
                  <Input
                    id="video_duration"
                    type="number"
                    value={lessonFormData.video_duration}
                    onChange={(e) => setLessonFormData({ ...lessonFormData, video_duration: parseInt(e.target.value) })}
                  />
                </div>
              </>
            )}

            {lessonFormData.content_type === "text" && (
              <div>
                <Label htmlFor="text_content">Text Content</Label>
                <Textarea
                  id="text_content"
                  value={lessonFormData.text_content}
                  onChange={(e) => setLessonFormData({ ...lessonFormData, text_content: e.target.value })}
                  rows={8}
                />
              </div>
            )}

            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="lesson_preview"
                  checked={lessonFormData.is_preview}
                  onCheckedChange={(checked) => setLessonFormData({ ...lessonFormData, is_preview: checked as boolean })}
                />
                <Label htmlFor="lesson_preview">Free Preview</Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="lesson_published"
                  checked={lessonFormData.is_published}
                  onCheckedChange={(checked) => setLessonFormData({ ...lessonFormData, is_published: checked as boolean })}
                />
                <Label htmlFor="lesson_published">Published</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setLessonDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingLesson ? "Update Lesson" : "Create Lesson"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {/* Bulk Episode Upload Dialog */}
      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="w-5 h-5 text-purple-700" />
              Bulk Add Episodes
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Module selector */}
            <div>
              <Label>Module *</Label>
              <Select value={bulkModuleId} onValueChange={setBulkModuleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select module" />
                </SelectTrigger>
                <SelectContent>
                  {modules.map((m, i) => (
                    <SelectItem key={m.id} value={m.id}>
                      Module {i + 1}: {m.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Paste block */}
            <div className="bg-gray-50 border rounded-lg p-4">
              <Label className="text-sm font-semibold mb-2 block">
                Paste URLs (one per line) — auto-fills the table below
              </Label>
              <Textarea
                placeholder={"https://youtu.be/abc\nhttps://youtu.be/def\nhttps://youtu.be/ghi"}
                rows={4}
                className="font-mono text-xs"
                onChange={(e) => handleBulkPaste(e.target.value)}
              />
            </div>

            {/* Episode rows */}
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-500 px-1">
                <span className="col-span-4">Title</span>
                <span className="col-span-5">Video URL</span>
                <span className="col-span-1 text-center">Min</span>
                <span className="col-span-1 text-center">Free</span>
                <span className="col-span-1" />
              </div>

              {bulkEpisodes.map((ep, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center bg-white border rounded-lg px-2 py-2">
                  <Input
                    className="col-span-4 text-sm h-8"
                    placeholder={`Episode ${i + 1}`}
                    value={ep.title}
                    onChange={(e) => updateBulkRow(i, "title", e.target.value)}
                  />
                  <div className="col-span-5 flex items-center gap-1">
                    <Link2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <Input
                      className="text-sm h-8"
                      placeholder="https://..."
                      value={ep.video_url}
                      onChange={(e) => updateBulkRow(i, "video_url", e.target.value)}
                    />
                  </div>
                  <Input
                    className="col-span-1 text-sm h-8 text-center"
                    type="number"
                    placeholder="0"
                    value={ep.duration}
                    onChange={(e) => updateBulkRow(i, "duration", e.target.value)}
                  />
                  <div className="col-span-1 flex justify-center">
                    <Checkbox
                      checked={ep.is_preview}
                      onCheckedChange={(v) => updateBulkRow(i, "is_preview", v as boolean)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeBulkRow(i)}
                    className="col-span-1 flex justify-center text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <Button type="button" variant="outline" size="sm" onClick={addBulkRow} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Row
              </Button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <p className="text-xs text-gray-500">
                {bulkEpisodes.filter(e => e.video_url.trim()).length} episodes ready to save
              </p>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setBulkDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleBulkSave} disabled={bulkSaving}>
                  {bulkSaving ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                  ) : (
                    <><Upload className="w-4 h-4 mr-2" /> Save All Episodes</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
