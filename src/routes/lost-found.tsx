import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { itemsAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { Item } from "@/data/lostFound";
import { MapPin, Calendar, User, Plus, Camera, X } from "lucide-react";

export const Route = createFileRoute("/lost-found")({
  component: LostFoundPage,
  head: () => ({
    meta: [
      { title: "Lost & Found — Quad" },
      {
        name: "description",
        content: "Browse lost and found items posted by the campus community.",
      },
    ],
  }),
});

function LostFoundPage() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const [active, setActive] = useState<{
    kind: "found" | "contact";
    item: Item;
  } | null>(null);
  const [postOpen, setPostOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [itemForm, setItemForm] = useState({
    type: "lost" as "lost" | "found",
    name: "",
    location: "",
    date: "Today",
    note: "",
  });
  const [error, setError] = useState("");

  const { data: lostItems = [], isLoading: lostLoading } = useQuery({
    queryKey: ["items", "lost"],
    queryFn: () => itemsAPI.getAll("lost"),
  });

  const { data: foundItems = [], isLoading: foundLoading } = useQuery({
    queryKey: ["items", "found"],
    queryFn: () => itemsAPI.getAll("found"),
  });

  const postItem = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("type", itemForm.type);
      formData.append("name", itemForm.name);
      formData.append("location", itemForm.location);
      formData.append("date", itemForm.date);
      formData.append("reporter", user?.name || "Anonymous");
      if (itemForm.note) formData.append("note", itemForm.note);
      
      if (fileInputRef.current?.files?.[0]) {
        formData.append("image", fileInputRef.current.files[0]);
      }
      
      return itemsAPI.create(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      setPostOpen(false);
      setItemForm({ type: "lost", name: "", location: "", date: "Today", note: "" });
      setImagePreview(null);
      setError("");
    },
    onError: (err: any) => {
      setError(err.message || "Failed to post item");
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePost = () => {
    if (!isAuthenticated) {
      setError("Please log in to post an item");
      return;
    }
    if (!itemForm.name.trim() || !itemForm.location.trim()) {
      setError("Name and location are required");
      return;
    }
    postItem.mutate();
  };

  return (
    <main className="mx-auto max-w-5xl px-6 pb-24 pt-16">
      <div className="flex items-end justify-between gap-4">
        <PageHeader
          eyebrow="Lost & Found"
          title="Reunite with what's missing."
          subtitle="Browse items reported by the campus community, or share what you found."
        />
        <Dialog open={postOpen} onOpenChange={setPostOpen}>
          <DialogTrigger asChild>
            <Button className="mb-10 shrink-0">
              <Plus className="mr-1.5 h-4 w-4" /> Post item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">
                {itemForm.type === "lost" ? "Report lost item" : "Report found item"}
              </DialogTitle>
            </DialogHeader>
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-4 py-2">
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
                  Type
                </label>
                <Select
                  value={itemForm.type}
                  onValueChange={(v) =>
                    setItemForm((f) => ({ ...f, type: v as "lost" | "found" }))
                  }
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lost">Lost Item</SelectItem>
                    <SelectItem value="found">Found Item</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
                  Item Name
                </label>
                <Input
                  value={itemForm.name}
                  onChange={(e) => setItemForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Blue backpack"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
                  Location
                </label>
                <Input
                  value={itemForm.location}
                  onChange={(e) => setItemForm((f) => ({ ...f, location: e.target.value }))}
                  placeholder="e.g. Library, 3rd floor"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
                  Date
                </label>
                <Select
                  value={itemForm.date}
                  onValueChange={(v) => setItemForm((f) => ({ ...f, date: v }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Today">Today</SelectItem>
                    <SelectItem value="Yesterday">Yesterday</SelectItem>
                    <SelectItem value="2 days ago">2 days ago</SelectItem>
                    <SelectItem value="This week">This week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
                  Additional Note
                </label>
                <Textarea
                  rows={3}
                  value={itemForm.note}
                  onChange={(e) => setItemForm((f) => ({ ...f, note: e.target.value }))}
                  placeholder="Any distinguishing features..."
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
                  Photo (optional)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground hover:bg-accent/40"
                >
                  <Camera className="h-5 w-5" />
                  {imagePreview ? "Change photo" : "Add a photo"}
                </label>
                {imagePreview && (
                  <div className="relative mt-2 inline-block">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-24 w-24 rounded-md object-cover"
                    />
                    <button
                      onClick={() => {
                        setImagePreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="absolute -right-2 -top-2 rounded-full bg-destructive p-0.5 text-destructive-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setPostOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handlePost} disabled={postItem.isPending}>
                {postItem.isPending ? "Posting..." : "Post"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="lost" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="lost">Lost ({lostItems.length})</TabsTrigger>
          <TabsTrigger value="found">Found ({foundItems.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="lost">
          <Grid
            items={lostItems}
            isLoading={lostLoading}
            action="I found this"
            onAction={(item) => setActive({ kind: "found", item })}
          />
        </TabsContent>
        <TabsContent value="found">
          <Grid
            items={foundItems}
            isLoading={foundLoading}
            action="Contact finder"
            onAction={(item) => setActive({ kind: "contact", item })}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {active?.kind === "found"
                ? "Thanks for helping!"
                : "Get in touch"}
            </DialogTitle>
          </DialogHeader>
          <p className="py-2 text-sm text-muted-foreground">
            {active?.kind === "found"
              ? `We'll let ${active?.item.reporter} know about ${active?.item.name}. They'll reach out shortly.`
              : `${active?.item.reporter} reported ${active?.item.name}. We've shared your contact details with them.`}
          </p>
          <DialogFooter>
            <Button onClick={() => setActive(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function Grid({
  items,
  isLoading,
  action,
  onAction,
}: {
  items: Item[];
  isLoading: boolean;
  action: string;
  onAction: (i: Item) => void;
}) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-border bg-paper p-5"
          >
            <div className="h-6 w-32 rounded bg-muted" />
            <div className="mt-4 space-y-2">
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="h-4 w-20 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-paper py-16 text-center text-sm text-muted-foreground">
        No items posted yet. Be the first to post!
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => (
        <div
          key={it.id}
          className="flex flex-col rounded-xl border border-border bg-paper p-5"
        >
          {it.image && (
            <img
              src={it.image}
              alt={it.name}
              className="mb-3 h-40 w-full rounded-lg object-cover"
            />
          )}
          <h3 className="font-serif text-2xl text-ink">{it.name}</h3>
          {it.note && (
            <p className="mt-1 text-sm italic text-muted-foreground">
              {it.note}
            </p>
          )}
          <dl className="mt-4 space-y-1.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />
              {it.location}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5" strokeWidth={1.5} />
              {it.date}
            </div>
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5" strokeWidth={1.5} />
              {it.reporter}
            </div>
          </dl>
          <Button
            variant="outline"
            className="mt-5"
            onClick={() => onAction(it)}
          >
            {action}
          </Button>
        </div>
      ))}
    </div>
  );
}