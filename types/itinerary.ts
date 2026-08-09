import { Place } from "./place";

export type BlockType = "activity" | "meal" | "visit" | "rest" | "travel" | "blank";

export type LocalTravelMode = "walk" | "taxi" | "transit" | "rideshare" | "other";

export interface ItineraryDay {
  id: string;
  label: string;
  date?: string;
  blockIds: string[];
}

export interface ItineraryBlock {
  id: string;
  dayId: string;
  type: BlockType;
  title: string;
  description?: string;
  scheduledTime?: string;
  plannedExpense?: number;
  location?: Place;
  mealType?: "breakfast" | "lunch" | "dinner" | "snack";
  travelMode?: LocalTravelMode;
}
