import { MongoClient as NativeMongoClient, ObjectId } from "mongodb";

export interface MongoDoc {
  _id?: string | ObjectId;
  [key: string]: unknown;
}

export interface FindResult<T> { documents: T[] }
export interface InsertResult   { insertedId: string }
export interface UpdateResult   { matchedCount: number; modifiedCount: number }
export interface DeleteResult   { deletedCount: number }

// Global cached client so we don't reconnect on every function call in dev
let cachedClient: NativeMongoClient | null = null;

export class MongoClient {
  private uri: string;
  private dbName: string;

  constructor(uri: string, apiKey: string, db: string) {
    // We repurpose the first parameter (formerly Data API URL) to be the standard MongoDB connection string.
    this.uri = uri;
    this.dbName = db;
  }

  private async getDb() {
    if (!cachedClient) {
      cachedClient = new NativeMongoClient(this.uri);
      await cachedClient.connect();
    }
    return cachedClient.db(this.dbName);
  }

  // Helper to stringify ObjectIds so TanStack Start doesn't fail serializing it
  private serializeDocs(docs: any[]) {
    return docs.map(d => {
      if (d._id && typeof d._id === "object") d._id = d._id.toString();
      return d;
    });
  }

  collection(name: string) {
    return {
      findOne: async <T>(filter: Record<string, unknown>) => {
        const db = await this.getDb();
        const doc = await db.collection(name).findOne(filter);
        if (doc) {
          if (doc._id && typeof doc._id === "object") doc._id = doc._id.toString();
        }
        return { document: doc as T | null };
      },

      find: async <T>(filter: Record<string, unknown>, opts?: { sort?: any; limit?: number; skip?: number; projection?: any }) => {
        const db = await this.getDb();
        let cursor = db.collection(name).find(filter);
        if (opts?.sort) cursor = cursor.sort(opts.sort);
        if (opts?.skip) cursor = cursor.skip(opts.skip);
        if (opts?.limit) cursor = cursor.limit(opts.limit);
        if (opts?.projection) cursor = cursor.project(opts.projection);
        const docs = await cursor.toArray();
        return { documents: this.serializeDocs(docs) as T[] };
      },

      insertOne: async (document: Record<string, unknown>) => {
        const db = await this.getDb();
        const res = await db.collection(name).insertOne(document);
        return { insertedId: res.insertedId.toString() };
      },

      updateOne: async (filter: Record<string, unknown>, update: Record<string, unknown>, options?: { upsert?: boolean }) => {
        const db = await this.getDb();
        const res = await db.collection(name).updateOne(filter, update, options);
        return { matchedCount: res.matchedCount, modifiedCount: res.modifiedCount };
      },

      replaceOne: async (filter: Record<string, unknown>, replacement: Record<string, unknown>) => {
        const db = await this.getDb();
        const res = await db.collection(name).replaceOne(filter, replacement);
        return { matchedCount: res.matchedCount, modifiedCount: res.modifiedCount };
      },

      deleteOne: async (filter: Record<string, unknown>) => {
        const db = await this.getDb();
        const res = await db.collection(name).deleteOne(filter);
        return { deletedCount: res.deletedCount };
      },

      deleteMany: async (filter: Record<string, unknown>) => {
        const db = await this.getDb();
        const res = await db.collection(name).deleteMany(filter);
        return { deletedCount: res.deletedCount };
      },

      count: async (filter: Record<string, unknown>) => {
        const db = await this.getDb();
        const count = await db.collection(name).countDocuments(filter);
        // The old API returned aggregate { count: number } wrapped in an array, 
        // wait, no, my custom API returned { count: number }
        return { count };
      },
    };
  }
}

export function oid(id: string) {
  return new ObjectId(id);
}
