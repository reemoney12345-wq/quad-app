export type UpdateCategory = "Crowd" | "WiFi" | "Queue" | "Other";

export interface CampusUpdate {
  id: string;
  author: string;
  category: UpdateCategory;
  location: string;
  message: string;
  minutesAgo: number;
  confirmations: number;
}

export const seedUpdates: CampusUpdate[] = [
  { id: "1", author: "Ada O.", category: "Crowd", location: "Library", message: "Library is full — no seats on 2nd floor.", minutesAgo: 12, confirmations: 8 },
  { id: "2", author: "Tomi K.", category: "WiFi", location: "Block B", message: "WiFi keeps dropping in Block B.", minutesAgo: 28, confirmations: 5 },
  { id: "3", author: "Zara M.", category: "Queue", location: "Clinic", message: "Clinic queue is short right now — good time to go.", minutesAgo: 6, confirmations: 11 },
  { id: "4", author: "Ife A.", category: "Crowd", location: "Cafeteria", message: "Cafeteria crowded, ~15 min wait for hot meals.", minutesAgo: 34, confirmations: 3 },
];
