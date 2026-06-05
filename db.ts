import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('fit.db');

export function initDb() {
  db.execSync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS kv (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS workouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      started_at INTEGER NOT NULL,
      finished_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS workout_sets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workout_id INTEGER NOT NULL,
      exercise TEXT NOT NULL,
      reps INTEGER,
      weight REAL,
      seconds INTEGER,
      created_at INTEGER NOT NULL,
      FOREIGN KEY(workout_id) REFERENCES workouts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS food_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      eaten_at INTEGER NOT NULL,
      meal TEXT,
      food_name TEXT NOT NULL,
      calories REAL NOT NULL,
      protein_g REAL,
      carbs_g REAL,
      fat_g REAL,
      serving_text TEXT
    );

    CREATE TABLE IF NOT EXISTS food_cache (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      calories_100g REAL,
      protein_100g REAL,
      carbs_100g REAL,
      fat_100g REAL,
      raw_json TEXT,
      cached_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS steps_daily (
      day TEXT PRIMARY KEY NOT NULL, -- YYYY-MM-DD
      steps INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      started_at INTEGER NOT NULL,
      finished_at INTEGER,
      distance_km REAL NOT NULL DEFAULT 0,
      duration_s INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS run_points (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      run_id INTEGER NOT NULL,
      ts INTEGER NOT NULL,
      lat REAL NOT NULL,
      lon REAL NOT NULL,
      accuracy REAL,
      FOREIGN KEY(run_id) REFERENCES runs(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS motivations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quote TEXT NOT NULL,
      image_uri TEXT,
      created_at INTEGER NOT NULL
    );
  `);
}

export function kvGet(key: string): string | null {
  const row = db.getFirstSync<{ value: string }>('SELECT value FROM kv WHERE key = ?', [key]);
  return row?.value ?? null;
}

export function kvSet(key: string, value: string) {
  db.runSync('INSERT INTO kv(key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value', [
    key,
    value,
  ]);
}

