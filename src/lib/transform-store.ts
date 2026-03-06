import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { AiRestaurantSnapshot } from "@/types";

const DEFAULT_TRANSFORM_STORE_DIR = "/tmp/dishtok-transforms";
const SNAPSHOT_TTL_MS = 24 * 60 * 60 * 1000;

function getTransformStoreDir() {
  return process.env.TRANSFORM_STORE_DIR || DEFAULT_TRANSFORM_STORE_DIR;
}

function getSnapshotFilePath(slug: string) {
  return path.join(getTransformStoreDir(), `${slug}.json`);
}

function isExpired(createdAt: string) {
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return true;
  return Date.now() - created > SNAPSHOT_TTL_MS;
}

function sanitizeSlugPart(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function createGeneratedSlug(sourceUrl: string) {
  let hostname = "restaurant";

  try {
    hostname = new URL(sourceUrl).hostname.replace(/^www\./, "");
  } catch {
    hostname = "restaurant";
  }

  const base = sanitizeSlugPart(hostname.split(".")[0] || "restaurant");
  const prefix = base === "son-cubano" ? "generated-restaurant" : base;
  return `${prefix}-${randomUUID().slice(0, 8)}`;
}

async function ensureStoreDir() {
  await fs.mkdir(getTransformStoreDir(), { recursive: true });
}

async function deleteSnapshot(slug: string) {
  try {
    await fs.unlink(getSnapshotFilePath(slug));
  } catch {
    // ignore missing/corrupt files during cleanup
  }
}

export async function cleanupExpiredSnapshots() {
  await ensureStoreDir();
  const entries = await fs.readdir(getTransformStoreDir(), {
    withFileTypes: true,
  });

  await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
      .map(async (entry) => {
        try {
          const raw = await fs.readFile(
            path.join(getTransformStoreDir(), entry.name),
            "utf8"
          );
          const snapshot = JSON.parse(raw) as Partial<AiRestaurantSnapshot>;

          if (
            !snapshot.slug ||
            !snapshot.createdAt ||
            isExpired(snapshot.createdAt)
          ) {
            await deleteSnapshot(entry.name.replace(/\.json$/, ""));
          }
        } catch {
          await deleteSnapshot(entry.name.replace(/\.json$/, ""));
        }
      })
  );
}

export async function writeTransformSnapshot(snapshot: AiRestaurantSnapshot) {
  await ensureStoreDir();
  await cleanupExpiredSnapshots();
  await fs.writeFile(
    getSnapshotFilePath(snapshot.slug),
    JSON.stringify(snapshot, null, 2),
    "utf8"
  );
}

export async function readTransformSnapshot(slug: string) {
  try {
    const raw = await fs.readFile(getSnapshotFilePath(slug), "utf8");
    const snapshot = JSON.parse(raw) as AiRestaurantSnapshot;

    if (!snapshot.createdAt || isExpired(snapshot.createdAt)) {
      await deleteSnapshot(slug);
      return null;
    }

    return snapshot;
  } catch {
    return null;
  }
}
