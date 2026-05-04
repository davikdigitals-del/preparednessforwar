import { Button } from "@/components/ui/button";
import { Plus, Globe } from "lucide-react";

export default function AdminCountries() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Countries Management</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Country
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <Globe className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold mb-2">Country Profiles</h3>
        <p className="text-gray-600 mb-4">
          Manage country-specific content and information
        </p>
        <p className="text-sm text-gray-500">
          Country management interface coming soon
        </p>
      </div>
    </div>
  );
}
