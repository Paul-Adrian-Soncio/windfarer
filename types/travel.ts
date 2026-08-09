import { Place } from "./place";

export type TravelMode = "plane" | "boat" | "car" | "train" | "bus" | "other";

export interface PlaneDetails {
  flightInsurance: boolean;
  mealsIncluded: boolean | string;
  luggage?: { count: number; weightKg?: number };
}

export interface TravelSegment {
  id: string;
  mode: TravelMode;
  providerName?: string;
  fromPlace?: Place;
  toPlace?: Place;
  departureDate?: string;
  departureTime?: string;
  arrivalDate?: string;
  arrivalTime?: string;
  isLayover?: boolean;
  cost?: number;
  plane?: PlaneDetails;
}
