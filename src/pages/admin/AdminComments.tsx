import { Button } from "@/components/ui/button";
import { MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react";

export default function AdminComments() {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Comments Management</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <MessageSquare className="w-4 h-4 mr-2" />
            Total: 0
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Comments</span>
            <MessageSquare className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold">0</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Approved</span>
            <ThumbsUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold">0</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Pending Review</span>
            <ThumbsDown className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold">0</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold mb-2">Comment Moderation</h3>
        <p className="text-gray-600 mb-4">
          Review and moderate user comments
        </p>
        <p className="text-sm text-gray-500">
          No comments to review at this time
        </p>
      </div>
    </div>
  );
}
