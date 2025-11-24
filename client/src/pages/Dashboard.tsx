import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { BarChart3, Calendar, Plus, Zap } from "lucide-react";
import { useLocation } from "wouter";
import { format } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  const { data: posts } = trpc.content.list.useQuery();
  const { data: templates } = trpc.templates.list.useQuery();
  const { data: subscription } = trpc.subscription.current.useQuery();

  const upcomingPosts = posts?.filter((p: any) => p.scheduledAt && new Date(p.scheduledAt) > new Date()).slice(0, 5) || [];
  const totalPosts = posts?.length || 0;
  const publishedPosts = posts?.filter((p: any) => p.status === "published").length || 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name || "Creator"}!</h1>
            <p className="text-gray-600 mt-2">
              You're on the <span className="font-semibold capitalize">{subscription?.plan || "free"}</span> plan
            </p>
          </div>
          <Button onClick={() => navigate("/calendar")} className="gap-2">
            <Plus className="w-4 h-4" />
            New Post
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{totalPosts}</div>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Published</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{publishedPosts}</div>
              <p className="text-xs text-gray-500 mt-1">Successfully posted</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Scheduled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{posts?.filter((p: any) => p.status === "scheduled").length || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Waiting to go live</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{templates?.length || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Ready to use</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="border-2 border-dashed cursor-pointer hover:border-blue-400 transition" onClick={() => navigate("/calendar")}>
            <CardHeader>
              <Calendar className="w-6 h-6 text-blue-600 mb-2" />
              <CardTitle>View Calendar</CardTitle>
              <CardDescription>See all your posts in calendar view</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-dashed cursor-pointer hover:border-purple-400 transition" onClick={() => navigate("/templates")}>
            <CardHeader>
              <Zap className="w-6 h-6 text-purple-600 mb-2" />
              <CardTitle>Browse Templates</CardTitle>
              <CardDescription>Speed up content creation</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-dashed cursor-pointer hover:border-green-400 transition" onClick={() => navigate("/pricing")}>
            <CardHeader>
              <BarChart3 className="w-6 h-6 text-green-600 mb-2" />
              <CardTitle>Upgrade Plan</CardTitle>
              <CardDescription>Unlock more features</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Upcoming Posts */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Posts</CardTitle>
            <CardDescription>Your next scheduled posts</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingPosts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No upcoming posts. Create one to get started!</p>
                <Button className="mt-4" onClick={() => navigate("/calendar")}>
                  Create Post
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingPosts.map((post: any) => (
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
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {post.scheduledAt ? format(new Date(post.scheduledAt), "MMM d") : "No date"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {post.scheduledAt ? format(new Date(post.scheduledAt), "h:mm a") : ""}
                      </p>
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
