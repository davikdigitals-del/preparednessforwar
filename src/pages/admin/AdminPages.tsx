import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";

export default function AdminPages() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Pages Management</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Page
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold mb-2">Static Pages</h3>
        <p className="text-gray-600 mb-4">
          Manage static pages like About, Legal, Privacy Policy, etc.
        </p>
        <p className="text-sm text-gray-500">
          Page editor coming soon
        </p>
      </div>
    </div>
  );
}
