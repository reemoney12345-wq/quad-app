import { createFileRoute, Link } from "@tanstack/react-router";
import { Map, DoorOpen, Megaphone, Search } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Quad — Your campus, simplified" },
      { name: "description", content: "Find rooms, navigate campus, share live updates and recover lost items — all in one place." },
    ],
  }),
});

const features = [
  { to: "/map", title: "Campus Map", desc: "Find your way to the library, clinic, halls and more.", icon: Map },
  { to: "/rooms", title: "Empty Rooms", desc: "See which study rooms and halls are free right now.", icon: DoorOpen },
  { to: "/updates", title: "Live Updates", desc: "Crowdsourced campus conditions from fellow students.", icon: Megaphone },
  { to: "/lost-found", title: "Lost & Found", desc: "Reunite with what you lost — or return what you found.", icon: Search },
] as const;

function Index() {
  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-20">
      <section className="max-w-3xl">
        <p className="mb-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Quad · for students
        </p>
        <h1 className="font-serif text-6xl leading-[1.05] text-ink md:text-7xl">
          Your campus,
          <br />
          <em className="font-normal text-primary">quietly</em> simplified.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
          Quad is the small, calm app for the everyday details of campus life — finding a room,
          checking the queue, getting to class, and recovering what you misplaced.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            to="/map"
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Open the map
          </Link>
          <Link
            to="/rooms"
            className="rounded-md border border-border bg-paper px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Find a room
          </Link>
        </div>
      </section>

      <section className="mt-24 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-2">
        {features.map((f) => (
          <Link
            key={f.to}
            to={f.to}
            className="group flex flex-col gap-3 bg-paper p-8 transition-colors hover:bg-accent"
          >
            <f.icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
            <h2 className="font-serif text-3xl text-ink">{f.title}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            <span className="mt-2 text-sm text-primary opacity-0 transition-opacity group-hover:opacity-100">
              Open →
            </span>
          </Link>
        ))}
      </section>
    </main>
  );
}
