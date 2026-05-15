export interface Location {
  id: string;
  name: string;
  category: string;
  walkMinutes: number;
  description: string;
  latitude: number;
  longitude: number;
}

// University of Lagos (UNILAG) - Akoka Campus
export const locations: Location[] = [
  {
    id: "library",
    name: "UNILAG Main Library",
    category: "Study",
    walkMinutes: 4,
    description: "Main library — 4 floors, silent zones on 3rd & 4th.",
    latitude: 6.5173,
    longitude: 3.3861
  },
  {
    id: "clinic",
    name: "UNILAG Medical Centre",
    category: "Health",
    walkMinutes: 6,
    description: "Campus health centre. Walk-ins until 5pm.",
    latitude: 6.5187,
    longitude: 3.3924
  },
  {
    id: "hall-a",
    name: "Main Auditorium",
    category: "Academic",
    walkMinutes: 3,
    description: "300-seat hall, near the main quad.",
    latitude: 6.5165,
    longitude: 3.3892
  },
  {
    id: "cafeteria",
    name: "New Cafeteria",
    category: "Food",
    walkMinutes: 5,
    description: "Open 7am–9pm. Hot meals until 8.",
    latitude: 6.5190,
    longitude: 3.3878
  },
  {
    id: "hostel-c",
    name: "Mariere Hostel",
    category: "Residence",
    walkMinutes: 9,
    description: "Residential block, west wing.",
    latitude: 6.5148,
    longitude: 3.3850
  },
];

// Default center of UNILAG campus
export const defaultCenter = {
  latitude: 6.5170,
  longitude: 3.3888
};