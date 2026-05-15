import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { roomsAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Users, Plus } from "lucide-react";
import type { RoomStatus } from "@/data/rooms";

export const Route = createFileRoute("/rooms")({
  component: RoomsPage,
  head: () => ({
    meta: [
      { title: "Empty Rooms — Quad" },
      { name: "description", content: "Find available study rooms, halls and labs across campus." },
    ],
  }),
});

const statuses: { value: RoomStatus | "all"; label: string }[] = [
  { value: "all", label: "Any status" },
  { value: "available", label: "Available" },
  { value: "until", label: "Available until…" },
  { value: "occupied", label: "Occupied" },
];

const buildings = ["Block A", "Block B", "Arts Wing", "Science Block"];

function RoomsPage() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [building, setBuilding] = useState("all");
  const [status, setStatus] = useState<RoomStatus | "all">("all");
  const [minCap, setMinCap] = useState(0);
  const [postOpen, setPostOpen] = useState(false);
  const [roomForm, setRoomForm] = useState({
    name: "",
    building: "Block A",
    capacity: 30,
    status: "available" as RoomStatus,
    until: "",
  });
  const [error, setError] = useState("");

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ["rooms", building, status, minCap],
    queryFn: () =>
      roomsAPI.getAll({
        building: building !== "all" ? building : undefined,
        status: status !== "all" ? status : undefined,
        minCapacity: minCap > 0 ? minCap : undefined,
      }),
  });

  const postRoom = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("quad-token");
      const body: any = {
        name: roomForm.name,
        building: roomForm.building,
        capacity: roomForm.capacity,
        status: roomForm.status,
      };
      if (roomForm.status === "until") {
        body.until = roomForm.until;
      }
      return fetch("http://localhost:3001/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      }).then((r) => {
        if (!r.ok) throw new Error("Failed to post room");
        return r.json();
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      setPostOpen(false);
      setRoomForm({ name: "", building: "Block A", capacity: 30, status: "available", until: "" });
      setError("");
    },
    onError: (err: any) => {
      setError(err.message || "Failed to post room");
    },
  });

  const handlePost = () => {
    if (!isAuthenticated) {
      setError("Please log in to post a room");
      return;
    }
    if (!roomForm.name.trim()) {
      setError("Room name is required");
      return;
    }
    postRoom.mutate();
  };

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-16">
      <div className="flex items-end justify-between gap-4">
        <PageHeader
          eyebrow="Rooms"
          title="Empty rooms, right now."
          subtitle="Filter by building, capacity and availability to find a quiet spot."
        />
        <Dialog open={postOpen} onOpenChange={setPostOpen}>
          <DialogTrigger asChild>
            <Button className="mb-10 shrink-0">
              <Plus className="mr-1.5 h-4 w-4" /> Post a room
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">
                Post an available room
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
                  Room Name
                </label>
                <Input
                  value={roomForm.name}
                  onChange={(e) => setRoomForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Room 305"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
                  Building
                </label>
                <Select
                  value={roomForm.building}
                  onValueChange={(v) => setRoomForm((f) => ({ ...f, building: v }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {buildings.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
                  Capacity
                </label>
                <Input
                  type="number"
                  value={roomForm.capacity}
                  onChange={(e) =>
                    setRoomForm((f) => ({ ...f, capacity: parseInt(e.target.value) || 0 }))
                  }
                  placeholder="Capacity"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
                  Status
                </label>
                <Select
                  value={roomForm.status}
                  onValueChange={(v) =>
                    setRoomForm((f) => ({ ...f, status: v as RoomStatus }))
                  }
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="until">Available until...</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {roomForm.status === "until" && (
                <div>
                  <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
                    Until when?
                  </label>
                  <Input
                    value={roomForm.until}
                    onChange={(e) =>
                      setRoomForm((f) => ({ ...f, until: e.target.value }))
                    }
                    placeholder="e.g. 3:30 PM"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setPostOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handlePost} disabled={postRoom.isPending}>
                {postRoom.isPending ? "Posting..." : "Post"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-8 grid gap-4 rounded-xl border border-border bg-paper p-5 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
            Building
          </label>
          <Select value={building} onValueChange={setBuilding}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All buildings</SelectItem>
              {buildings.map((b) => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
            Status
          </label>
          <Select value={status} onValueChange={(v) => setStatus(v as RoomStatus | "all")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {statuses.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
            Min capacity: <span className="text-foreground">{minCap}</span>
          </label>
          <Slider
            value={[minCap]}
            onValueChange={([v]) => setMinCap(v)}
            min={0}
            max={200}
            step={10}
            className="mt-3"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-border bg-paper p-5"
            >
              <div className="h-6 w-32 rounded bg-muted" />
              <div className="mt-2 h-4 w-20 rounded bg-muted" />
              <div className="mt-6 h-4 w-24 rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-paper py-16 text-center text-sm text-muted-foreground">
          No rooms match these filters. Try adjusting or post a new room!
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((r: any) => (
            <div
              key={r.id}
              className="rounded-xl border border-border bg-paper p-5 transition-colors hover:bg-accent/40"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-serif text-2xl text-ink">{r.name}</h3>
                  <p className="text-sm text-muted-foreground">{r.building}</p>
                </div>
                <StatusBadge status={r.status} until={r.until} />
              </div>
              <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" strokeWidth={1.5} />
                Capacity {r.capacity}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function StatusBadge({ status, until }: { status: RoomStatus; until?: string }) {
  const map = {
    available: {
      label: "Available",
      cls: "bg-success/20 text-success-foreground border-success/40",
    },
    until: {
      label: `Until ${until}`,
      cls: "bg-warning/20 text-warning-foreground border-warning/40",
    },
    occupied: {
      label: "Occupied",
      cls: "bg-muted text-muted-foreground border-border",
    },
  } as const;
  const m = map[status];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${m.cls}`}
    >
      {m.label}
    </span>
  );
}