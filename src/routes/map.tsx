import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { defaultCenter, type Location } from "@/data/locations";
import {
  Footprints, MapPin, Navigation, Layers, Star, Share2,
  Satellite, Map as MapIcon, Trash2, LocateFixed
} from "lucide-react";
import {
  MapContainer, TileLayer, Marker, Popup, useMap,
  Polyline, ZoomControl
} from "react-leaflet";
import L from "leaflet";
import { locationsAPI } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Fix Leaflet default marker icon
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const SelectedIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [30, 48],
  iconAnchor: [15, 48],
  className: "selected-marker",
});

const BookmarkIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  className: "bookmark-marker",
});

const YouAreHereIcon = L.icon({
  iconUrl: "data:image/svg+xml;base64," + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="oklch(0.22 0.012 60)" width="24" height="24">
      <circle cx="12" cy="12" r="8" fill="oklch(0.22 0.012 60)"/>
      <circle cx="12" cy="12" r="3" fill="white"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

interface GeocodingResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  category?: string;
}

type MapStyle = "light" | "satellite" | "streets";

const tileLayers: Record<MapStyle, { url: string; attribution: string }> = {
  light: {
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CartoDB</a>',
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  },
  streets: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
};

export const Route = createFileRoute("/map")({
  component: MapPage,
  head: () => ({
    meta: [
      { title: "Campus Map — Quad" },
      { name: "description", content: "Search and navigate to any location with walking estimates." },
    ],
  }),
});

function MapPage() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Location | null>(null);
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [walkTime, setWalkTime] = useState<number>(0);
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [campusLocations, setCampusLocations] = useState<Location[]>([]);
  const [mapStyle, setMapStyle] = useState<MapStyle>("light");
  const [bookmarks, setBookmarks] = useState<Location[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("quad-bookmarks");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Geolocation
  const locateUser = useCallback(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          setUserLocation({ lat: defaultCenter.latitude, lng: defaultCenter.longitude });
        }
      );
    }
  }, []);

  useEffect(() => {
    locateUser();
  }, [locateUser]);

  // Fetch campus locations
  useEffect(() => {
    locationsAPI.getAll().then(setCampusLocations).catch(console.error);
  }, []);

  // Save bookmarks to localStorage
  useEffect(() => {
    localStorage.setItem("quad-bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Search locations worldwide
  const searchLocations = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => searchLocations(query), 300);
    return () => clearTimeout(timer);
  }, [query, searchLocations]);

  // Walking route
  useEffect(() => {
    if (!selected || !userLocation) return;
    const fetchRoute = async () => {
      try {
        const from = `${userLocation.lng},${userLocation.lat}`;
        const to = `${selected.longitude},${selected.latitude}`;
        const url = `https://router.project-osrm.org/route/v1/walking/${from};${to}?overview=full&geometries=geojson`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.routes?.[0]) {
          const coords = data.routes[0].geometry.coordinates.map(
            (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
          );
          setRouteCoords(coords);
          setWalkTime(Math.round(data.routes[0].duration / 60));
        }
      } catch {
        if (selected) {
          setRouteCoords([[userLocation.lat, userLocation.lng], [selected.latitude, selected.longitude]]);
          setWalkTime(selected.walkMinutes || 5);
        }
      }
    };
    fetchRoute();
  }, [selected, userLocation]);

  const handleSelectResult = (result: GeocodingResult) => {
    const location: Location = {
      id: result.place_id?.toString() || Math.random().toString(),
      name: result.display_name.split(",")[0],
      category: "Search Result",
      walkMinutes: 0,
      description: result.display_name,
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
    };
    setSelected(location);
    setSearchResults([]);
    setQuery(location.name);
  };

  const toggleBookmark = (location: Location) => {
    setBookmarks((prev) => {
      const exists = prev.find((b) => b.id === location.id);
      if (exists) return prev.filter((b) => b.id !== location.id);
      return [...prev, location];
    });
  };

  const shareLocation = async (location: Location) => {
    const url = `https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}#map=17/${location.latitude}/${location.longitude}`;
    if (navigator.share) {
      await navigator.share({ title: location.name, text: location.description, url });
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  const isBookmarked = (location: Location) => bookmarks.some((b) => b.id === location.id);

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-16">
      <PageHeader
        eyebrow="Map"
        title="Find your way."
        subtitle="Search any location worldwide and get walking directions."
      />

      <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
        <div className="space-y-3">
          <div className="relative">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search anywhere in the world…"
              className="h-11 bg-paper pr-10"
            />
            {isSearching && (
              <div className="absolute right-3 top-3">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            )}
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-paper">
              {searchResults.map((result) => (
                <li key={result.place_id}>
                  <button
                    onClick={() => handleSelectResult(result)}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm hover:bg-accent/60"
                  >
                    <MapPin className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.5} />
                    <span className="truncate text-foreground">{result.display_name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Bookmarks */}
          {bookmarks.length > 0 && (
            <div className="rounded-lg border border-border bg-paper p-4">
              <p className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <Star className="h-3.5 w-3.5" /> Bookmarks
              </p>
              <ul className="space-y-1">
                {bookmarks.map((b) => (
                  <li key={b.id}>
                    <button
                      onClick={() => { setSelected(b); setQuery(b.name); }}
                      className="flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm hover:bg-accent/60"
                    >
                      <span className="truncate text-foreground">{b.name}</span>
                      <Trash2
                        className="ml-2 h-3.5 w-3.5 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={(e) => { e.stopPropagation(); toggleBookmark(b); }}
                      />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Campus Locations */}
          <div className="rounded-lg border border-border bg-paper p-4">
            <p className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">
              Campus Locations
            </p>
            <ul className="space-y-1">
              {campusLocations.map((l) => (
                <li key={l.id}>
                  <button
                    onClick={() => { setSelected(l); setQuery(l.name); }}
                    className={`flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm transition-colors ${
                      selected?.id === l.id ? "bg-accent" : "hover:bg-accent/60"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-primary" strokeWidth={1.5} />
                      <span className="text-foreground">{l.name}</span>
                    </span>
                    <span className="text-xs text-muted-foreground">{l.walkMinutes} min</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Selected Location Info */}
          {selected && (
            <div className="rounded-lg border border-border bg-paper p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {selected.category}
              </p>
              <div className="flex items-start justify-between">
                <h3 className="mt-1 font-serif text-2xl text-ink">{selected.name}</h3>
                <div className="flex gap-1">
                  <button onClick={() => toggleBookmark(selected)} className="p-1">
                    <Star
                      className={`h-4 w-4 ${isBookmarked(selected) ? "fill-warning text-warning" : "text-muted-foreground"}`}
                    />
                  </button>
                  <button onClick={() => shareLocation(selected)} className="p-1">
                    <Share2 className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {selected.description}
              </p>
              {walkTime > 0 && (
                <div className="mt-4 flex items-center gap-2 text-sm text-primary">
                  <Footprints className="h-4 w-4" strokeWidth={1.5} />
                  About {walkTime} min walk
                </div>
              )}
            </div>
          )}
        </div>

        {/* Map Container */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border">
          {userLocation && (
            <MapContainer
              center={[userLocation.lat, userLocation.lng]}
              zoom={15}
              className="h-full w-full"
              zoomControl={false}
            >
              <TileLayer
                key={mapStyle}
                attribution={tileLayers[mapStyle].attribution}
                url={tileLayers[mapStyle].url}
              />
              <ZoomControl position="bottomright" />

              {/* You Are Here */}
              <Marker position={[userLocation.lat, userLocation.lng]} icon={YouAreHereIcon}>
                <Popup>You are here</Popup>
              </Marker>

              {/* Campus Markers */}
              {campusLocations.map((l) => (
                <Marker
                  key={l.id}
                  position={[l.latitude, l.longitude]}
                  icon={isBookmarked(l) ? BookmarkIcon : selected?.id === l.id ? SelectedIcon : DefaultIcon}
                  eventHandlers={{ click: () => setSelected(l) }}
                >
                  <Popup>
                    <div className="p-1">
                      <p className="font-medium text-xs">{l.name}</p>
                      <p className="text-xs text-muted-foreground">{l.walkMinutes} min walk</p>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Search Result Marker */}
              {selected && !campusLocations.find((l) => l.id === selected.id) && (
                <Marker position={[selected.latitude, selected.longitude]} icon={SelectedIcon}>
                  <Popup>{selected.name}</Popup>
                </Marker>
              )}

              {/* Walking Route */}
              {routeCoords.length > 0 && (
                <Polyline
                  positions={routeCoords}
                  color="oklch(0.55 0.13 38)"
                  weight={3}
                  opacity={0.8}
                  dashArray="10 6"
                />
              )}

              {/* Map Controls Overlay */}
              <div className="absolute left-3 top-3 z-[1000] flex flex-col gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="secondary" className="h-9 w-9 shadow-md">
                      <Layers className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" side="right">
                    <DropdownMenuItem onClick={() => setMapStyle("light")}>
                      <MapIcon className="mr-2 h-4 w-4" /> Light
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setMapStyle("satellite")}>
                      <Satellite className="mr-2 h-4 w-4" /> Satellite
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setMapStyle("streets")}>
                      <Navigation className="mr-2 h-4 w-4" /> Streets
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-9 w-9 shadow-md"
                  onClick={locateUser}
                >
                  <LocateFixed className="h-4 w-4" />
                </Button>
              </div>

              {/* Mapillary Street View Link */}
              {selected && (
                <div className="absolute bottom-3 right-3 z-[1000]">
                  <a
                    href={`https://www.mapillary.com/app/?lat=${selected.latitude}&lng=${selected.longitude}&z=17`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md bg-paper px-3 py-1.5 text-xs font-medium shadow-md hover:bg-accent"
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    Street View
                  </a>
                </div>
              )}

              <MapController selected={selected} userLocation={userLocation} />
            </MapContainer>
          )}
        </div>
      </div>
    </main>
  );
}

function MapController({
  selected,
  userLocation,
}: {
  selected: Location | null;
  userLocation: { lat: number; lng: number } | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (selected) {
      map.flyTo([selected.latitude, selected.longitude], 17, { duration: 1.5 });
    }
  }, [selected, map]);

  return null;
}