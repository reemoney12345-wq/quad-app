import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { updatesAPI } from "@/lib/api";
import { useSocket } from "@/hooks/useSocket";
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
import { Check, Plus, MapPin, Clock } from "lucide-react";
import type { UpdateCategory } from "@/data/updates";

export const Route = createFileRoute("/updates")({
  component: UpdatesPage,
  head: () => ({
    meta: [
      { title: "Live Campus Updates — Quad" },
      {
        name: "description",
        content: "Real-time crowdsourced updates on queues, WiFi, crowds and more.",
      },
    ],
  }),
});

const categories: UpdateCategory[] = ["Crowd", "WiFi", "Queue", "Other"];

function UpdatesPage() {
  const queryClient = useQueryClient();
  const { onNewUpdate, onUpdateVerified } = useSocket();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    category: "Crowd" as UpdateCategory,
    location: "",
    message: "",
  });

  const { data: updates = [], isLoading } = useQuery({
    queryKey: ["updates"],
    queryFn: () => updatesAPI.getAll(),
  });

  // Listen for real-time updates
  useState(() => {
    const cleanup1 = onNewUpdate((data) => {
      queryClient.setQueryData(["updates"], (old: any) => [data, ...(old || [])]);
    });
    const cleanup2 = onUpdateVerified((data) => {
      queryClient.setQueryData(["updates"], (old: any) =>
        old?.map((u: any) =>
          u.id === data.updateId ? { ...u, confirmations: data.confirmations } : u
        )
      );
    });
    return () => {
      cleanup1?.();
      cleanup2?.();
    };
  });

  const createMutation = useMutation({
    mutationFn: updatesAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["updates"] });
    },
  });

  const verifyMutation = useMutation({
    mutationFn: updatesAPI.verify,
    onSuccess: (data, id) => {
      queryClient.setQueryData(["updates"], (old: any) =>
        old?.map((u: any) =>
          u.id === id ? { ...u, confirmations: data.confirmations } : u
        )
      );
    },
  });

  const post = () => {
    if (!form.location.trim() || !form.message.trim()) return;
    createMutation.mutate(form);
    setForm({ category: "Crowd", location: "", message: "" });
    setOpen(false);
  };

  return (
    <main className="mx-auto max-w-3xl px-6 pb-24 pt-16">
      <div className="flex items-end justify-between gap-4">
        <PageHeader
          eyebrow="Updates"
          title="Live from the quad."
          subtitle="What's happening on campus, posted by students like you."
        />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="mb-10 shrink-0">
              <Plus className="mr-1.5 h-4 w-4" /> Post update
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">
                Post an update
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
                  Category
                </label>
                <Select
                  value={form.category}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, category: v as UpdateCategory }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
                  Location
                </label>
                <Input
                  value={form.location}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, location: e.target.value }))
                  }
                  placeholder="e.g. Library, 2nd floor"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
                  What's going on?
                </label>
                <Textarea
                  rows={4}
                  value={form.message}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, message: e.target.value }))
                  }
                  placeholder="Short, helpful detail…"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={post} disabled={createMutation.isPending}>
                {createMutation.isPending ? "Posting..." : "Post"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-border bg-paper p-5"
            >
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="flex-1">
                  <div className="h-4 w-48 rounded bg-muted" />
                  <div className="mt-2 h-4 w-full rounded bg-muted" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <ul className="space-y-3">
          {updates.map((u: any) => (
            <li
              key={u.id}
              className="rounded-xl border border-border bg-paper p-5"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent font-serif text-lg text-ink">
                  {u.author
                    .split(" ")
                    .map((p: string) => p[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {u.author}
                    </span>
                    <span className="rounded-full border border-border bg-background px-2 py-0.5">
                      {u.category}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" strokeWidth={1.5} />
                      {u.location}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" strokeWidth={1.5} />
                      {u.minutesAgo === 0
                        ? "just now"
                        : `${u.minutesAgo} min ago`}
                    </span>
                  </div>
                  <p className="mt-2 leading-relaxed text-foreground">
                    {u.message}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <button
                      onClick={() => verifyMutation.mutate(u.id)}
                      disabled={verifyMutation.isPending}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                    >
                      <Check
                        className="h-3.5 w-3.5 text-success-foreground"
                        strokeWidth={2}
                      />
                      Confirm ·{" "}
                      <span className="text-muted-foreground">
                        {u.confirmations}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}