import { eq, and, gte, lte, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, contentPosts, contentTemplates, subscriptions, paymentRequests, InsertContentPost, InsertContentTemplate, InsertSubscription, InsertPaymentRequest } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Content Posts Queries
export async function createContentPost(post: InsertContentPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(contentPosts).values(post);
}

export async function getUserContentPosts(userId: number, month?: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  let query = db.select().from(contentPosts).where(eq(contentPosts.userId, userId));
  
  if (month) {
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    query = db.select().from(contentPosts).where(
      and(
        eq(contentPosts.userId, userId),
        gte(contentPosts.scheduledAt, startOfMonth),
        lte(contentPosts.scheduledAt, endOfMonth)
      )
    );
  }
  
  return query.orderBy(desc(contentPosts.scheduledAt));
}

export async function updateContentPost(id: number, updates: Partial<InsertContentPost>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(contentPosts).set(updates).where(eq(contentPosts.id, id));
}

export async function deleteContentPost(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(contentPosts).where(eq(contentPosts.id, id));
}

// Content Templates Queries
export async function createContentTemplate(template: InsertContentTemplate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(contentTemplates).values(template);
}

export async function getUserContentTemplates(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(contentTemplates).where(eq(contentTemplates.userId, userId)).orderBy(desc(contentTemplates.createdAt));
}

export async function deleteContentTemplate(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(contentTemplates).where(eq(contentTemplates.id, id));
}

// Subscriptions Queries
export async function getUserSubscription(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createOrUpdateSubscription(userId: number, sub: Partial<InsertSubscription>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getUserSubscription(userId);
  
  if (existing) {
    return db.update(subscriptions).set(sub).where(eq(subscriptions.userId, userId));
  } else {
    return db.insert(subscriptions).values({ ...sub, userId } as InsertSubscription);
  }
}

// Payment Requests Queries
export async function createPaymentRequest(request: InsertPaymentRequest) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(paymentRequests).values(request);
}

export async function getUserPaymentRequests(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(paymentRequests).where(eq(paymentRequests.userId, userId)).orderBy(desc(paymentRequests.requestedAt));
}

export async function getPaymentRequest(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(paymentRequests).where(eq(paymentRequests.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updatePaymentRequest(id: number, updates: Partial<InsertPaymentRequest>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(paymentRequests).set(updates).where(eq(paymentRequests.id, id));
}

export async function getAllPendingPaymentRequests() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(paymentRequests).where(eq(paymentRequests.status, "pending")).orderBy(desc(paymentRequests.requestedAt));
}
