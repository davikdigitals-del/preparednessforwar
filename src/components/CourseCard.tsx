import { Link } from "react-router-dom";
import { Clock, Users, Star, BookOpen, Crown } from "lucide-react";
import type { Course } from "@/types/monetization";

interface CourseCardProps {
  course: Course;
  featured?: boolean;
}

export function CourseCard({ course, featured = false }: CourseCardProps) {
  return (
    <Link
      to={`/courses/${course.slug}`}
      className={`group block bg-white hover:shadow-xl transition-all duration-300 border-2 ${
        featured ? "border-blue-900" : "border-gray-200 hover:border-blue-900"
      } rounded-lg overflow-hidden`}
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-gray-100 overflow-hidden relative">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-700">
            <BookOpen className="w-16 h-16 text-white opacity-50" />
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {course.is_free ? (
            <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold uppercase rounded">
              FREE
            </span>
          ) : (
            <span className="px-3 py-1 bg-primary text-white text-xs font-bold uppercase rounded flex items-center gap-1">
              <Crown className="w-3 h-3" />
              PREMIUM
            </span>
          )}
          {featured && (
            <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-bold uppercase rounded flex items-center gap-1">
              <Crown className="w-3 h-3" />
              Featured
            </span>
          )}
        </div>

        {/* Level Badge */}
        <div className="absolute top-3 right-3">
          <span className="px-3 py-1 bg-white/90 backdrop-blur text-gray-900 text-xs font-semibold rounded capitalize">
            {course.level}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="font-display font-bold text-xl mb-2 line-clamp-2 group-hover:text-blue-900 transition-colors">
          {course.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {course.short_description || course.description}
        </p>

        {/* Instructor */}
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200">
          {course.instructor_image_url ? (
            <img
              src={course.instructor_image_url}
              alt={course.instructor_name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center text-white text-xs font-bold">
              {course.instructor_name.charAt(0)}
            </div>
          )}
          <span className="text-sm font-medium text-gray-700">{course.instructor_name}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            {/* Rating */}
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="font-semibold">{course.rating.toFixed(1)}</span>
              <span className="text-gray-400">({course.review_count})</span>
            </div>

            {/* Students */}
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{course.enrollment_count.toLocaleString()}</span>
            </div>
          </div>

          {/* Duration */}
          {course.duration_hours && course.duration_hours > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{course.duration_hours}h</span>
            </div>
          )}
        </div>

        {/* What You'll Learn Preview */}
        {course.what_you_learn && course.what_you_learn.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-700 mb-2">What you'll learn:</p>
            <ul className="space-y-1">
              {course.what_you_learn.slice(0, 2).map((item, index) => (
                <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span className="line-clamp-1">{item}</span>
                </li>
              ))}
              {course.what_you_learn.length > 2 && (
                <li className="text-xs text-blue-600 font-medium">
                  +{course.what_you_learn.length - 2} more...
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </Link>
  );
}
