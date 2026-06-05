export type Workout = {
  id: number;
  title: string;
  started_at: number;
  finished_at: number | null;
};

export type WorkoutSet = {
  id: number;
  workout_id: number;
  exercise: string;
  reps: number | null;
  weight: number | null;
  seconds: number | null;
  created_at: number;
};

export type FoodEntry = {
  id: number;
  eaten_at: number;
  meal: string | null;
  food_name: string;
  calories: number;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  serving_text: string | null;
};

export type FoodSearchItem = {
  id: string; // off:code or search-generated id
  name: string;
  calories_100g: number | null;
  protein_100g: number | null;
  carbs_100g: number | null;
  fat_100g: number | null;
};

export type Motivation = {
  id: number;
  quote: string;
  image_uri: string | null;
  created_at: number;
};

export type Run = {
  id: number;
  started_at: number;
  finished_at: number | null;
  distance_km: number;
  duration_s: number;
};

