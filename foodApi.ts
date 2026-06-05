import type { FoodSearchItem } from './types';
import { db } from './db';

function cacheUpsert(item: FoodSearchItem, raw: any) {
  db.runSync(
    `INSERT INTO food_cache(id, name, calories_100g, protein_100g, carbs_100g, fat_100g, raw_json, cached_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name=excluded.name,
       calories_100g=excluded.calories_100g,
       protein_100g=excluded.protein_100g,
       carbs_100g=excluded.carbs_100g,
       fat_100g=excluded.fat_100g,
       raw_json=excluded.raw_json,
       cached_at=excluded.cached_at`,
    [
      item.id,
      item.name,
      item.calories_100g,
      item.protein_100g,
      item.carbs_100g,
      item.fat_100g,
      JSON.stringify(raw ?? null),
      Date.now(),
    ]
  );
}

export function searchCached(query: string): FoodSearchItem[] {
  const q = `%${query.toLowerCase()}%`;
  return db.getAllSync<FoodSearchItem>(
    `SELECT id, name, calories_100g, protein_100g, carbs_100g, fat_100g
     FROM food_cache
     WHERE lower(name) LIKE ?
     ORDER BY cached_at DESC
     LIMIT 20`,
    [q]
  );
}

export async function searchOpenFoodFacts(query: string): Promise<FoodSearchItem[]> {
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
    query
  )}&search_simple=1&action=process&json=1&page_size=20`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Food search failed (${res.status})`);
  const data = await res.json();

  const products: any[] = data?.products ?? [];
  const items: FoodSearchItem[] = products
    .map((p) => {
      const nutr = p?.nutriments ?? {};
      const name = (p?.product_name || p?.generic_name || '').trim();
      const code = p?.code ? String(p.code) : null;
      if (!name) return null;

      const item: FoodSearchItem = {
        id: code ? `off:${code}` : `off:search:${name}`,
        name,
        calories_100g: nutr['energy-kcal_100g'] ?? nutr['energy-kcal'] ?? null,
        protein_100g: nutr['proteins_100g'] ?? null,
        carbs_100g: nutr['carbohydrates_100g'] ?? null,
        fat_100g: nutr['fat_100g'] ?? null,
      };
      cacheUpsert(item, p);
      return item;
    })
    .filter(Boolean) as FoodSearchItem[];

  return items;
}

