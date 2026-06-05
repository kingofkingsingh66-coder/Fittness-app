import { db, kvGet, kvSet } from './db';
import { endOfDay, formatDay, startOfDay } from './utils';
import type { FoodEntry, Motivation, Run, Workout, WorkoutSet } from './types';

const KEYS = {
  premium: 'premium.unlocked',
};

export function isPremiumUnlocked(): boolean {
  return kvGet(KEYS.premium) === '1';
}

export function setPremiumUnlocked(v: boolean) {
  kvSet(KEYS.premium, v ? '1' : '0');
}

// ---- Workouts
export function createWorkout(title: string): Workout {
  const now = Date.now();
  const res = db.runSync('INSERT INTO workouts(title, started_at) VALUES (?, ?)', [title, now]);
  const id = Number(res.lastInsertRowId);
  return { id, title, started_at: now, finished_at: null };
}

export function finishWorkout(workoutId: number) {
  db.runSync('UPDATE workouts SET finished_at = ? WHERE id = ?', [Date.now(), workoutId]);
}

export function listWorkouts(): Workout[] {
  return db.getAllSync<Workout>('SELECT * FROM workouts ORDER BY started_at DESC');
}

export function addWorkoutSet(workoutId: number, set: Omit<WorkoutSet, 'id' | 'workout_id' | 'created_at'>): WorkoutSet {
  const now = Date.now();
  const res = db.runSync(
    'INSERT INTO workout_sets(workout_id, exercise, reps, weight, seconds, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [workoutId, set.exercise, set.reps ?? null, set.weight ?? null, set.seconds ?? null, now]
  );
  const id = Number(res.lastInsertRowId);
  return { id, workout_id: workoutId, created_at: now, ...set };
}

export function listWorkoutSets(workoutId: number): WorkoutSet[] {
  return db.getAllSync<WorkoutSet>('SELECT * FROM workout_sets WHERE workout_id = ? ORDER BY id DESC', [workoutId]);
}

export function deleteWorkout(workoutId: number) {
  db.runSync('DELETE FROM workouts WHERE id = ?', [workoutId]);
}

// ---- Nutrition
export function addFoodEntry(entry: Omit<FoodEntry, 'id'>): FoodEntry {
  const res = db.runSync(
    `INSERT INTO food_entries(eaten_at, meal, food_name, calories, protein_g, carbs_g, fat_g, serving_text)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      entry.eaten_at,
      entry.meal ?? null,
      entry.food_name,
      entry.calories,
      entry.protein_g ?? null,
      entry.carbs_g ?? null,
      entry.fat_g ?? null,
      entry.serving_text ?? null,
    ]
  );
  return { id: Number(res.lastInsertRowId), ...entry };
}

export function listFoodEntriesForDay(dayTs: number): FoodEntry[] {
  const start = startOfDay(dayTs);
  const end = endOfDay(dayTs);
  return db.getAllSync<FoodEntry>(
    'SELECT * FROM food_entries WHERE eaten_at BETWEEN ? AND ? ORDER BY eaten_at DESC',
    [start, end]
  );
}

export function deleteFoodEntry(id: number) {
  db.runSync('DELETE FROM food_entries WHERE id = ?', [id]);
}

// ---- Steps (daily)
export function setStepsForDay(day: string, steps: number) {
  db.runSync(
    'INSERT INTO steps_daily(day, steps, updated_at) VALUES (?, ?, ?) ON CONFLICT(day) DO UPDATE SET steps=excluded.steps, updated_at=excluded.updated_at',
    [day, steps, Date.now()]
  );
}

export function getStepsForDay(day: string): number {
  const row = db.getFirstSync<{ steps: number }>('SELECT steps FROM steps_daily WHERE day = ?', [day]);
  return row?.steps ?? 0;
}

export function getTodaySteps(): number {
  return getStepsForDay(formatDay(Date.now()));
}

// ---- Runs
export function createRun(): Run {
  const now = Date.now();
  const res = db.runSync('INSERT INTO runs(started_at, distance_km, duration_s) VALUES (?, 0, 0)', [now]);
  return { id: Number(res.lastInsertRowId), started_at: now, finished_at: null, distance_km: 0, duration_s: 0 };
}

export function addRunPoint(runId: number, point: { ts: number; lat: number; lon: number; accuracy?: number | null }) {
  db.runSync('INSERT INTO run_points(run_id, ts, lat, lon, accuracy) VALUES (?, ?, ?, ?, ?)', [
    runId,
    point.ts,
    point.lat,
    point.lon,
    point.accuracy ?? null,
  ]);
}

export function updateRunSummary(runId: number, distanceKm: number, durationS: number) {
  db.runSync('UPDATE runs SET distance_km = ?, duration_s = ? WHERE id = ?', [distanceKm, durationS, runId]);
}

export function finishRun(runId: number) {
  db.runSync('UPDATE runs SET finished_at = ? WHERE id = ?', [Date.now(), runId]);
}

export function listRuns(): Run[] {
  return db.getAllSync<Run>('SELECT * FROM runs ORDER BY started_at DESC');
}

// ---- Motivation
export function addMotivation(quote: string, imageUri: string | null): Motivation {
  const now = Date.now();
  const res = db.runSync('INSERT INTO motivations(quote, image_uri, created_at) VALUES (?, ?, ?)', [
    quote,
    imageUri,
    now,
  ]);
  return { id: Number(res.lastInsertRowId), quote, image_uri: imageUri, created_at: now };
}

export function listMotivations(): Motivation[] {
  return db.getAllSync<Motivation>('SELECT * FROM motivations ORDER BY created_at DESC');
}

export function deleteMotivation(id: number) {
  db.runSync('DELETE FROM motivations WHERE id = ?', [id]);
}

