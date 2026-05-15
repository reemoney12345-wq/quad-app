export type RoomStatus = "available" | "until" | "occupied";

export interface Room {
  id: string;
  name: string;
  building: string;
  capacity: number;
  status: RoomStatus;
  until?: string;
}

export const rooms: Room[] = [
  { id: "1", name: "Room 201", building: "Block A", capacity: 30, status: "until", until: "3:30 PM" },
  { id: "2", name: "Seminar 4", building: "Block A", capacity: 15, status: "available" },
  { id: "3", name: "Hall B2", building: "Block B", capacity: 120, status: "occupied" },
  { id: "4", name: "Studio 1", building: "Arts Wing", capacity: 25, status: "available" },
  { id: "5", name: "Lab 3", building: "Science Block", capacity: 40, status: "until", until: "4:15 PM" },
  { id: "6", name: "Room 108", building: "Block B", capacity: 50, status: "occupied" },
  { id: "7", name: "Tutorial 7", building: "Block A", capacity: 20, status: "available" },
  { id: "8", name: "Lecture Hall C", building: "Science Block", capacity: 200, status: "until", until: "5:00 PM" },
  { id: "9", name: "Studio 2", building: "Arts Wing", capacity: 25, status: "available" },
];

export const buildings = ["Block A", "Block B", "Arts Wing", "Science Block"];
