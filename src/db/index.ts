import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

/**
 * Ленивое подключение к PostgreSQL.
 * Раньше код бросал ошибку на этапе импорта, из-за чего `next build`
 * падал, если переменная DATABASE_URL не задана (например, на Vercel
 * до настройки окружения). Теперь подключение создаётся только при
 * первом реальном обращении к базе.
 */
const databaseUrl = process.env.DATABASE_URL;

let _pool: Pool | null = null;
let _db: any = null;

function getDb(): any {
  if (!_db) {
    if (!databaseUrl) {
      throw new Error("DATABASE_URL is required");
    }
    _pool = new Pool({ connectionString: databaseUrl });
    _db = drizzle(_pool);
  }
  return _db;
}

/**
 * Прокси: методы базы доступны только в момент вызова.
 * На этапе сборки модуль просто импортируется — ошибки нет.
 */
export const db: any = new Proxy(
  {},
  {
    get(_target, prop) {
      const real = getDb();
      const v = real[prop];
      return typeof v === "function" ? v.bind(real) : v;
    },
  }
);

export { _pool as pool };
