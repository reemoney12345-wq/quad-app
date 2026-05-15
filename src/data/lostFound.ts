export interface Item {
  id: string;
  name: string;
  location: string;
  date: string;
  reporter: string;
  note?: string;
  image?: string;
}

export const lostItems: Item[] = [
  { id: "l1", name: "Student ID Card", location: "Library, 3rd floor", date: "Today", reporter: "Ada O.", note: "Name: A. Okafor" },
  { id: "l2", name: "Bunch of keys", location: "Cafeteria", date: "Yesterday", reporter: "Tomi K.", note: "Blue lanyard" },
  { id: "l3", name: "Black backpack", location: "Lecture Hall A", date: "2 days ago", reporter: "Zara M." },
  { id: "l4", name: "Water bottle", location: "Hostel C lobby", date: "Today", reporter: "Ife A.", note: "Green metal" },
];

export const foundItems: Item[] = [
  { id: "f1", name: "AirPods (case)", location: "Library", date: "Today", reporter: "Front desk" },
  { id: "f2", name: "Phone — black", location: "Cafeteria table 4", date: "Today", reporter: "Sade B." },
  { id: "f3", name: "Brown wallet", location: "Block A corridor", date: "Yesterday", reporter: "Security" },
  { id: "f4", name: "Spiral notebook", location: "Lecture Hall A", date: "2 days ago", reporter: "Mr. Eze" },
];