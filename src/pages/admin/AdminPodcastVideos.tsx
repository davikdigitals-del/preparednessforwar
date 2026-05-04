import { Button } from "@/components/ui/button";
import { Plus, Video } from "lucide-react";

export default function AdminPodcastVideos() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Videos & Podcasts</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Media
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <Video className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold mb-2">Video & Podcast Management</h3>
        <p className="text-gray-600 mb-4">
          Manage your video content and podcast episodes
        </p>
        <p className="text-sm text-gray-500">
          Full media management interface coming soon
        </p>
      </div>
    </div>
  );
}
