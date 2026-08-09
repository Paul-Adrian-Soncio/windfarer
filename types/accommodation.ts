import { Place } from "./place";

export interface Accommodation {
  id: string;
  place: Place;
  name: string;
  checkIn: string;
  checkInTime?: string;
  checkOut: string;
  checkOutTime?: string;
  willTransferLater: boolean;
  cost?: number;
  notes?: string;
}
