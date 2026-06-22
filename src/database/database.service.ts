import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Database from 'better-sqlite3';
import * as path from 'path';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private db: Database.Database;

  onModuleInit() {
    const dbPath = path.resolve(__dirname, '..', '..', '..', 'TimeNet.db');
    this.db = new Database(dbPath, { readonly: true });
  }

  onModuleDestroy() {
    this.db?.close();
  }

  query<T = any>(sql: string, params: any[] = []): T[] {
    return this.db.prepare(sql).all(...params) as T[];
  }

  queryOne<T = any>(sql: string, params: any[] = []): T | undefined {
    return this.db.prepare(sql).get(...params) as T | undefined;
  }

  count(sql: string, params: any[] = []): number {
    const row = this.db.prepare(sql).get(...params) as { cnt: number };
    return row?.cnt ?? 0;
  }
}
