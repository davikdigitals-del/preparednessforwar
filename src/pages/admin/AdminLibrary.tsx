import { Button } from "@/components/ui/button";
import { Plus, BookOpen } from "lucide-react";

export default function AdminLibrary() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Library Management</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Resource
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold mb-2">Resource Library</h3>
        <p className="text-gray-600 mb-4">
          Manage downloadable resources, PDFs, and documents
        </p>
        <p className="text-sm text-gray-500">
          Library management interface coming soon
        </p>
      </div>
    </div>
  );
}
