// config/cache.ts
import { CacheEntry } from "../types";
import * as cron from "node-cron";


export class SignatureCache {
  private store = new Map<string, CacheEntry>();
  private cleanupTask: cron.ScheduledTask;
  private debug: boolean;

  constructor(
    private cronSchedule: string = "0 0 * * *", // Every day at midnight by default
    debug: boolean = true
  ) {
    this.debug = debug;
    this.log("Initializing SignatureCache");

    this.cleanupTask = cron.schedule(this.cronSchedule, () => {
      this.cleanupExpired();
    });

    this.cleanupTask.start();
    this.log(`Cleanup scheduled using cron pattern: "${this.cronSchedule}"`);
    // Attach graceful shutdown handlers
    this.setupShutdownHooks();
  }

  private setupShutdownHooks(): void {
    const shutdown = () => {
      this.destroy();
      process.exit(0);
    };

    process.once("SIGINT", shutdown);
    process.once("SIGTERM", shutdown);
  }

  private log(message: string): void {
    if (this.debug) {
      console.log(`[SignatureCache] ${new Date().toISOString()} - ${message}`);
    }
  }

  private cleanupExpired(): void {
    const now = Date.now();
    let deletedCount = 0;

    this.log(`Starting cleanup (current entries: ${this.store.size})`);

    for (const [key, entry] of this.store) {
      if (entry.expires < now) {
        this.store.delete(key);
        deletedCount++;
      }
    }

    this.log(
      `Cleanup completed. Removed ${deletedCount} expired entries. Remaining: ${this.store.size}`
    );
  }

  async set(key: string, value: string, ttl: number): Promise<void> {
    const expires = Date.now() + ttl * 1000;
    this.store.set(key, { value, expires });
    this.log(`Set entry: ${key} (expires: ${new Date(expires).toISOString()})`);
    this.log(`Current cache size: ${this.store.size}`);
  }

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);

    if (!entry) {
      this.log(`Get: ${key} - Not found`);
      return null;
    }

    if (entry.expires < Date.now()) {
      this.store.delete(key);
      this.log(`Get: ${key} - Expired and removed`);
      return null;
    }

    this.log(
      `Get: ${key} - Found (expires: ${new Date(entry.expires).toISOString()})`
    );
    return entry.value;
  }

  async exists(key: string): Promise<boolean> {
    const entry = this.store.get(key);

    if (!entry) {
      this.log(`Exists: ${key} - Not found`);
      return false;
    }

    if (entry.expires < Date.now()) {
      this.store.delete(key);
      this.log(`Exists: ${key} - Expired and removed`);
      return false;
    }

    this.log(
      `Exists: ${key} - Exists (expires: ${new Date(
        entry.expires
      ).toISOString()})`
    );
    return true;
  }

  async del(key: string): Promise<void> {
    if (this.store.delete(key)) {
      this.log(`Deleted: ${key}`);
    } else {
      this.log(`Delete attempted but key not found: ${key}`);
    }
    this.log(`Current cache size: ${this.store.size}`);
  }

  destroy(): void {
    this.cleanupTask.stop();
    this.log("Cache destroyed. Cleanup task stopped");
  }
}

// Singleton instance with cron schedule every minute (use "*/1 * * * *" for testing)
export const cache = new SignatureCache("*/57 * * * *", true);

// // config/cache.ts
// type CacheEntry = {
//   value: string;
//   expires: number; // timestamp in ms
// }

// export class SignatureCache {
//   private store = new Map<string, CacheEntry>();
//   private cleanupInterval: NodeJS.Timeout;
//   private debug: boolean;

//   constructor(
//     private cleanupFrequency: number =18000000, //for 5 hours 120000, // Changed to 2 minutes (120000ms) 60000,
//     debug: boolean = true,
//   ) {
//     this.debug = debug;
//     this.log("Initializing SignatureCache");
//     this.cleanupInterval = setInterval(
//       () => this.cleanupExpired(),
//       this.cleanupFrequency,
//     );
//     this.log(`Cleanup scheduled every ${cleanupFrequency / 1000} seconds`);
//   }

//   private log(message: string): void {
//     if (this.debug) {
//       console.log(`[SignatureCache] ${new Date().toISOString()} - ${message}`);
//     }
//   }

//   private cleanupExpired(): void {
//     const now = Date.now();
//     let deletedCount = 0;

//     this.log(`Starting cleanup (current entries: ${this.store.size})`);

//     for (const [key, entry] of this.store) {
//       if (entry.expires < now) {
//         this.store.delete(key);
//         deletedCount++;
//       }
//     }

//     this.log(
//       `Cleanup completed. Removed ${deletedCount} expired entries. Remaining: ${this.store.size}`,
//     );
//   }

//   async set(key: string, value: string, ttl: number): Promise<void> {
//     const expires = Date.now() + ttl * 1000;
//     this.store.set(key, { value, expires });
//     this.log(`Set entry: ${key} (expires: ${new Date(expires).toISOString()})`);
//     this.log(`Current cache size: ${this.store.size}`);
//   }

//   async get(key: string): Promise<string | null> {
//     const entry = this.store.get(key);

//     if (!entry) {
//       this.log(`Get: ${key} - Not found`);
//       return null;
//     }

//     if (entry.expires < Date.now()) {
//       this.store.delete(key);
//       this.log(`Get: ${key} - Expired and removed`);
//       return null;
//     }

//     this.log(
//       `Get: ${key} - Found (expires: ${new Date(entry.expires).toISOString()})`,
//     );
//     return entry.value;
//   }

//   async exists(key: string): Promise<boolean> {
//     const entry = this.store.get(key);

//     if (!entry) {
//       this.log(`Exists: ${key} - Not found`);
//       return false;
//     }

//     if (entry.expires < Date.now()) {
//       this.store.delete(key);
//       this.log(`Exists: ${key} - Expired and removed`);
//       return false;
//     }

//     this.log(
//       `Exists: ${key} - Exists (expires: ${new Date(entry.expires).toISOString()})`,
//     );
//     return true;
//   }

//   async del(key: string): Promise<void> {
//     if (this.store.delete(key)) {
//       this.log(`Deleted: ${key}`);
//     } else {
//       this.log(`Delete attempted but key not found: ${key}`);
//     }
//     this.log(`Current cache size: ${this.store.size}`);
//   }

//   destroy(): void {
//     clearInterval(this.cleanupInterval);
//     this.log("Cache destroyed. Cleanup interval cleared");
//   }
// }

// // Singleton instance with debug logging enabled
// export const cache = new SignatureCache(60000, true);
