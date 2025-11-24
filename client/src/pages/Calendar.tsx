import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    platforms: "instagram",
    scheduledAt: "",
  });

  const { data: posts, refetch } = trpc.content.list.useQuery({ month: currentDate });
  const createMutation = trpc.content.create.useMutation({
    onSuccess: () => {
      toast.success("Post created successfully!");
      setFormData({ title: "", content: "", platforms: "instagram", scheduledAt: "" });
      setIsOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create post");
    },
  });

  const deleteMutation = trpc.content.delete.useMutation({
    onSuccess: () => {
      toast.success("Post deleted");
      refetch();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast.error("Please fill in all fields");
      return;
    }

    createMutation.mutate({
      title: formData.title,
      content: formData.content,
      platforms: formData.platforms,
      scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt) : undefined,
    });
  };

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const postsMap = new Map();
  posts?.forEach((post: any) => {
    if (post.scheduledAt) {
      const dateKey = format(new Date(post.scheduledAt), "yyyy-MM-dd");
      if (!postsMap.has(dateKey)) {
        postsMap.set(dateKey, []);
      }
      postsMap.get(dateKey).push(post);
    }
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Content Calendar</h1>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Post</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Post Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Summer Sale Announcement"
                  />
                </div>

                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Write your post content here..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="platforms">Platforms</Label>
                    <select
                      id="platforms"
                      value={formData.platforms}
                      onChange={(e) => setFormData({ ...formData, platforms: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="instagram">Instagram</option>
                      <option value="facebook">Facebook</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="twitter">Twitter</option>
                      <option value="instagram,facebook">Instagram & Facebook</option>
                      <option value="instagram,linkedin">Instagram & LinkedIn</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="scheduledAt">Schedule Date & Time</Label>
                    <Input
                      id="scheduledAt"
                      type="datetime-local"
                      value={formData.scheduledAt}
                      onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Creating..." : "Create Post"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
            >
              Next
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-7 gap-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                <div key={day} className="text-center font-semibold text-gray-600 py-2">
                  {day}
                </div>
              ))}

              {daysInMonth.map(day => {
                const dateKey = format(day, "yyyy-MM-dd");
                const dayPosts = postsMap.get(dateKey) || [];
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isToday = isSameDay(day, new Date());

                return (
                  <div
                    key={dateKey}
                    className={`min-h-24 p-2 border rounded-lg ${
                      isCurrentMonth ? "bg-white" : "bg-gray-50"
                    } ${isToday ? "border-blue-500 border-2" : "border-gray-200"}`}
                  >
                    <p className={`text-sm font-semibold mb-1 ${isCurrentMonth ? "text-gray-900" : "text-gray-400"}`}>
                      {format(day, "d")}
                    </p>
                    <div className="space-y-1">
                      {dayPosts.slice(0, 2).map((post: any) => (
                        <div
                          key={post.id}
                          className="text-xs bg-blue-100 text-blue-700 p-1 rounded truncate cursor-pointer hover:bg-blue-200"
                          title={post.title}
                        >
                          {post.title}
                        </div>
                      ))}
                      {dayPosts.length > 2 && (
                        <p className="text-xs text-gray-500">+{dayPosts.length - 2} more</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Posts List */}
        <Card>
          <CardHeader>
            <CardTitle>All Posts</CardTitle>
            <CardDescription>Manage your scheduled and draft posts</CardDescription>
          </CardHeader>
          <CardContent>
            {!posts || posts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No posts yet. Create one to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post: any) => (
                  <div key={post.id} className="flex items-start justify-between border-b pb-4 last:border-0">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{post.title}</h4>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{post.content}</p>
                      <div className="flex gap-2 mt-2">
                        {post.platforms.split(",").map((platform: string) => (
                          <span key={platform} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {platform.trim()}
                          </span>
                        ))}
                        <span className={`text-xs px-2 py-1 rounded ${
                          post.status === "draft" ? "bg-gray-100 text-gray-700" :
                          post.status === "scheduled" ? "bg-yellow-100 text-yellow-700" :
                          post.status === "published" ? "bg-green-100 text-green-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {post.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(post.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
