import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Plus, Trash2, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Templates() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    content: "",
    category: "",
    platforms: "instagram",
  });

  const { data: templates, refetch } = trpc.templates.list.useQuery();
  const createMutation = trpc.templates.create.useMutation({
    onSuccess: () => {
      toast.success("Template created successfully!");
      setFormData({ name: "", content: "", category: "", platforms: "instagram" });
      setIsOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create template");
    },
  });

  const deleteMutation = trpc.templates.delete.useMutation({
    onSuccess: () => {
      toast.success("Template deleted");
      refetch();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.content) {
      toast.error("Please fill in all fields");
      return;
    }

    createMutation.mutate({
      name: formData.name,
      content: formData.content,
      category: formData.category || undefined,
      platforms: formData.platforms,
    });
  };

  const handleUseTemplate = (template: any) => {
    navigator.clipboard.writeText(template.content);
    toast.success("Template copied to clipboard!");
  };

  const categories = Array.from(new Set(templates?.map((t: any) => t.category).filter(Boolean) || []));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Content Templates</h1>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Template</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Product Launch"
                  />
                </div>

                <div>
                  <Label htmlFor="content">Template Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Enter your template content with placeholders like [PRODUCT_NAME], [DATE], etc."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g., Promotional"
                    />
                  </div>

                  <div>
                    <Label htmlFor="platforms">Default Platform</Label>
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
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Creating..." : "Create Template"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Templates Grid */}
        {!templates || templates.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600 mb-4">No templates yet. Create one to speed up your content creation!</p>
              <Button onClick={() => setIsOpen(true)}>Create Your First Template</Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {categories.length > 0 && (
              <div className="space-y-6">
                {categories.map((category: any) => (
                  <div key={category}>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 capitalize">{category}</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {templates
                        .filter((t: any) => t.category === category)
                        .map((template: any) => (
                          <Card key={template.id} className="flex flex-col">
                            <CardHeader>
                              <CardTitle className="text-base">{template.name}</CardTitle>
                              <CardDescription className="text-xs">
                                {template.platforms}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col">
                              <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">
                                {template.content}
                              </p>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 gap-1"
                                  onClick={() => handleUseTemplate(template)}
                                >
                                  <Copy className="w-4 h-4" />
                                  Copy
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => deleteMutation.mutate(template.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Uncategorized templates */}
            {templates.filter((t: any) => !t.category).length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Other Templates</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates
                    .filter((t: any) => !t.category)
                    .map((template: any) => (
                      <Card key={template.id} className="flex flex-col">
                        <CardHeader>
                          <CardTitle className="text-base">{template.name}</CardTitle>
                          <CardDescription className="text-xs">
                            {template.platforms}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col">
                          <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">
                            {template.content}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 gap-1"
                              onClick={() => handleUseTemplate(template)}
                            >
                              <Copy className="w-4 h-4" />
                              Copy
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteMutation.mutate(template.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
