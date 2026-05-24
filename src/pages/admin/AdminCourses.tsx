import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Search, BookOpen, Users, Star, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/FileUpload";
import { Checkbox } from "@/components/ui/checkbox";
import { natoCountries } from "@/data/mockData";
import type { Course, CourseFormData } from "@/types/monetization";

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const [formData, setFormData] = useState<CourseFormData>({
    title: "",
    slug: "",
    description: "",
    short_description: "",
    instructor_name: "",
    instructor_bio: "",
    instructor_image_url: "",
    thumbnail_url: "",
    preview_video_url: "",
    price: 0,
    currency: "GBP",
    is_free: false,
    level: "beginner",
    duration_hours: 0,
    language: "en",
    what_you_learn: [],
    requirements: [],
    is_published: false,
    is_featured: false,
    country_codes: [],
  });

  const [whatYouLearnInput, setWhatYouLearnInput] = useState("");
  const [requirementsInput, setRequirementsInput] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCourses(data || []);
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

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const slug = formData.slug || generateSlug(formData.title);
      
      const courseData = {
        ...formData,
        slug,
        what_you_learn: formData.what_you_learn.filter(Boolean),
        requirements: formData.requirements.filter(Boolean),
      };

      if (editingCourse) {
        const { error } = await supabase
          .from("courses")
          .update(courseData)
          .eq("id", editingCourse.id);

        if (error) throw error;
        toast({ title: "Success", description: "Course updated successfully" });
      } else {
        const { error } = await supabase
          .from("courses")
          .insert([courseData]);

        if (error) throw error;
        toast({ title: "Success", description: "Course created successfully" });
      }

      setDialogOpen(false);
      resetForm();
      fetchCourses();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      slug: course.slug,
      description: course.description || "",
      short_description: course.short_description || "",
      instructor_name: course.instructor_name,
      instructor_bio: course.instructor_bio || "",
      instructor_image_url: course.instructor_image_url || "",
      thumbnail_url: course.thumbnail_url || "",
      preview_video_url: course.preview_video_url || "",
      price: course.price,
      currency: course.currency,
      is_free: course.is_free,
      level: course.level,
      duration_hours: course.duration_hours || 0,
      language: course.language,
      what_you_learn: course.what_you_learn || [],
      requirements: course.requirements || [],
      is_published: course.is_published,
      is_featured: course.is_featured,
      country_codes: course.country_codes || [],
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course? This will also delete all modules, lessons, and enrollments.")) return;

    try {
      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Success", description: "Course deleted successfully" });
      fetchCourses();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEditingCourse(null);
    setFormData({
      title: "",
      slug: "",
      description: "",
      short_description: "",
      instructor_name: "",
      instructor_bio: "",
      instructor_image_url: "",
      thumbnail_url: "",
      preview_video_url: "",
      price: 0,
      currency: "GBP",
      is_free: false,
      level: "beginner",
      duration_hours: 0,
      language: "en",
      what_you_learn: [],
      requirements: [],
      is_published: false,
      is_featured: false,
      country_codes: [],
    });
    setWhatYouLearnInput("");
    setRequirementsInput("");
  };

  const addWhatYouLearn = () => {
    if (whatYouLearnInput.trim()) {
      setFormData({
        ...formData,
        what_you_learn: [...formData.what_you_learn, whatYouLearnInput.trim()],
      });
      setWhatYouLearnInput("");
    }
  };

  const removeWhatYouLearn = (index: number) => {
    setFormData({
      ...formData,
      what_you_learn: formData.what_you_learn.filter((_, i) => i !== index),
    });
  };

  const addRequirement = () => {
    if (requirementsInput.trim()) {
      setFormData({
        ...formData,
        requirements: [...formData.requirements, requirementsInput.trim()],
      });
      setRequirementsInput("");
    }
  };

  const removeRequirement = (index: number) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter((_, i) => i !== index),
    });
  };

  const toggleCountry = (countryCode: string) => {
    setFormData(prev => ({
      ...prev,
      country_codes: prev.country_codes?.includes(countryCode)
        ? prev.country_codes.filter(c => c !== countryCode)
        : [...(prev.country_codes || []), countryCode]
    }));
  };

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Courses Management</h1>
          <p className="text-muted-foreground mt-1">Create and manage online training courses</p>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          New Course
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Courses</p>
              <p className="text-2xl font-bold">{courses.length}</p>
            </div>
            <BookOpen className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Published</p>
              <p className="text-2xl font-bold">{courses.filter(c => c.is_published).length}</p>
            </div>
            <Star className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Students</p>
              <p className="text-2xl font-bold">{courses.reduce((sum, c) => sum + c.enrollment_count, 0)}</p>
            </div>
            <Users className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Rating</p>
              <p className="text-2xl font-bold">
                {courses.length > 0 
                  ? (courses.reduce((sum, c) => sum + c.rating, 0) / courses.length).toFixed(1)
                  : "0.0"}
              </p>
            </div>
            <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Instructor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Students</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">Loading...</td>
                </tr>
              ) : filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No courses found. Click "New Course" to create your first course.
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {course.thumbnail_url && (
                          <img src={course.thumbnail_url} alt={course.title} className="w-16 h-12 object-cover rounded" />
                        )}
                        <div>
                          <div className="font-medium">{course.title}</div>
                          <div className="text-sm text-gray-500">{course.level}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{course.instructor_name}</td>
                    <td className="px-6 py-4 text-sm">
                      {course.is_free ? (
                        <span className="text-green-600 font-semibold">FREE</span>
                      ) : (
                        <span className="font-semibold">£{course.price}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">{course.enrollment_count}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        {course.rating.toFixed(1)} ({course.review_count})
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {course.is_published ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Published</span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Draft</span>
                        )}
                        {course.is_featured && (
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Featured</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(course)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(course.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCourse ? "Edit Course" : "Create New Course"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Basic Information</h3>
              
              <div>
                <Label htmlFor="title">Course Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="auto-generated-from-title"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty to auto-generate from title</p>
              </div>

              <div>
                <Label htmlFor="short_description">Short Description *</Label>
                <Textarea
                  id="short_description"
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  rows={2}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Full Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                  required
                />
              </div>
            </div>

            {/* Instructor */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold text-lg">Instructor Information</h3>
              
              <div>
                <Label htmlFor="instructor_name">Instructor Name *</Label>
                <Input
                  id="instructor_name"
                  value={formData.instructor_name}
                  onChange={(e) => setFormData({ ...formData, instructor_name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="instructor_bio">Instructor Bio</Label>
                <Textarea
                  id="instructor_bio"
                  value={formData.instructor_bio}
                  onChange={(e) => setFormData({ ...formData, instructor_bio: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <FileUpload
                  type="image"
                  currentUrl={formData.instructor_image_url}
                  onUrlChange={(url) => setFormData({ ...formData, instructor_image_url: url })}
                  label="Instructor Photo"
                />
              </div>
            </div>

            {/* Media */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold text-lg">Course Media</h3>
              
              <div>
                <FileUpload
                  type="image"
                  currentUrl={formData.thumbnail_url}
                  onUrlChange={(url) => setFormData({ ...formData, thumbnail_url: url })}
                  label="Course Thumbnail"
                />
              </div>

              <div>
                <FileUpload
                  type="video"
                  currentUrl={formData.preview_video_url}
                  onUrlChange={(url) => setFormData({ ...formData, preview_video_url: url })}
                  label="Preview Video (Optional)"
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold text-lg">Pricing</h3>
              
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_free"
                  checked={formData.is_free}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_free: checked as boolean })}
                />
                <Label htmlFor="is_free">This is a free course</Label>
              </div>

              {!formData.is_free && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      required={!formData.is_free}
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value) => setFormData({ ...formData, currency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GBP">USD ($)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            {/* Course Details */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold text-lg">Course Details</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="level">Level</Label>
                  <Select
                    value={formData.level}
                    onValueChange={(value: any) => setFormData({ ...formData, level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="all">All Levels</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="duration_hours">Duration (hours)</Label>
                  <Input
                    id="duration_hours"
                    type="number"
                    value={formData.duration_hours}
                    onChange={(e) => setFormData({ ...formData, duration_hours: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="language">Language</Label>
                <Select
                  value={formData.language}
                  onValueChange={(value) => setFormData({ ...formData, language: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* What You'll Learn */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold text-lg">What Students Will Learn</h3>
              
              <div className="flex gap-2">
                <Input
                  value={whatYouLearnInput}
                  onChange={(e) => setWhatYouLearnInput(e.target.value)}
                  placeholder="Add a learning outcome"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addWhatYouLearn())}
                />
                <Button type="button" onClick={addWhatYouLearn}>Add</Button>
              </div>

              {formData.what_you_learn.length > 0 && (
                <ul className="space-y-2">
                  {formData.what_you_learn.map((item, index) => (
                    <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span>✓ {item}</span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeWhatYouLearn(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Requirements */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold text-lg">Requirements</h3>
              
              <div className="flex gap-2">
                <Input
                  value={requirementsInput}
                  onChange={(e) => setRequirementsInput(e.target.value)}
                  placeholder="Add a requirement"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                />
                <Button type="button" onClick={addRequirement}>Add</Button>
              </div>

              {formData.requirements.length > 0 && (
                <ul className="space-y-2">
                  {formData.requirements.map((item, index) => (
                    <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span>• {item}</span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeRequirement(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Geographic Targeting */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold text-lg">Available Countries</h3>
              <div className="border rounded-lg p-4 max-h-48 overflow-y-auto bg-gray-50">
                <div className="grid grid-cols-2 gap-2">
                  {natoCountries.map((country) => (
                    <div key={country.code} className="flex items-center space-x-2">
                      <Checkbox
                        id={`country-${country.code}`}
                        checked={formData.country_codes?.includes(country.code)}
                        onCheckedChange={() => toggleCountry(country.code)}
                      />
                      <label htmlFor={`country-${country.code}`} className="text-sm cursor-pointer">
                        {country.flag} {country.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-500">Leave empty to make available in all countries</p>
            </div>

            {/* Status */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold text-lg">Status</h3>
              
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="is_published"
                    checked={formData.is_published}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked as boolean })}
                  />
                  <Label htmlFor="is_published">Published</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked as boolean })}
                  />
                  <Label htmlFor="is_featured">Featured</Label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 border-t pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingCourse ? "Update Course" : "Create Course"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
