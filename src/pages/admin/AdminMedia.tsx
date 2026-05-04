import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Image, Video, File, Search } from "lucide-react";

export default function AdminMedia() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Media Library</h1>
        <Button>
          <Upload className="w-4 h-4 mr-2" />
          Upload Files
        </Button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search media..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <Image className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="font-semibold mb-2">Images</h3>
          <p className="text-sm text-gray-600">Upload and manage images</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <Video className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="font-semibold mb-2">Videos</h3>
          <p className="text-sm text-gray-600">Upload and manage videos</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <File className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="font-semibold mb-2">Documents</h3>
          <p className="text-sm text-gray-600">Upload and manage documents</p>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-600">Media library integration coming soon...</p>
        <p className="text-sm text-gray-500 mt-2">
          Connect to Supabase Storage for full media management
        </p>
      </div>
    </div>
  );
}
