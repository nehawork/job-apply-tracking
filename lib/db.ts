import { createClient, type Client } from "@libsql/client";
import type { Filters, JobApplication } from "@/lib/types";

declare global {
  // eslint-disable-next-line no-var
  var __jobTrackerDbClient: Client | undefined;
  // eslint-disable-next-line no-var
  var __jobTrackerDbReady: Promise<void> | undefined;
}

function getDatabaseUrl() {
  if (process.env.VERCEL === "1" || process.env.NODE_ENV === "production") {
    if (!process.env.PRODUCTION_DATABASE_URL) {
      throw new Error(
        "Missing PRODUCTION_DATABASE_URL. Use a persistent libSQL/SQLite provider on Vercel so deployments do not reset data."
      );
    }

    return process.env.PRODUCTION_DATABASE_URL;
  }

  return process.env.DATABASE_URL || "file:./data/job-tracker.db";
}

function getDatabaseAuthToken() {
  if (process.env.VERCEL === "1" || process.env.NODE_ENV === "production") {
    return process.env.PRODUCTION_DATABASE_AUTH_TOKEN;
  }

  return undefined;
}

function getClient() {
  if (!global.__jobTrackerDbClient) {
    global.__jobTrackerDbClient = createClient({
      url: getDatabaseUrl(),
      authToken: getDatabaseAuthToken()
    });
  }

  return global.__jobTrackerDbClient;
}

async function initialize() {
  const db = getClient();

  await db.execute(`
    CREATE TABLE IF NOT EXISTS job_applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_name TEXT NOT NULL,
      position TEXT NOT NULL,
      job_description TEXT NOT NULL,
      contact_email TEXT NOT NULL,
      contact_no TEXT NOT NULL,
      address TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('Created', 'Applied', 'Selected', 'Rejected')),
      reason TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await migrateStatuses(db);
}

async function migrateStatuses(db: Client) {
  const schemaResult = await db.execute({
    sql: `
      SELECT sql
      FROM sqlite_master
      WHERE type = 'table' AND name = 'job_applications'
    `
  });

  const createTableSql = String(schemaResult.rows[0]?.sql ?? "");
  if (createTableSql.includes("'Created'")) {
    return;
  }

  await db.batch(
    [
      `
        ALTER TABLE job_applications RENAME TO job_applications_old
      `,
      `
        CREATE TABLE job_applications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          company_name TEXT NOT NULL,
          position TEXT NOT NULL,
          job_description TEXT NOT NULL,
          contact_email TEXT NOT NULL,
          contact_no TEXT NOT NULL,
          address TEXT NOT NULL,
          status TEXT NOT NULL CHECK (status IN ('Created', 'Applied', 'Selected', 'Rejected')),
          reason TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `,
      `
        INSERT INTO job_applications (
          id,
          company_name,
          position,
          job_description,
          contact_email,
          contact_no,
          address,
          status,
          reason,
          created_at
        )
        SELECT
          id,
          company_name,
          position,
          job_description,
          contact_email,
          contact_no,
          address,
          status,
          reason,
          created_at
        FROM job_applications_old
      `,
      `
        DROP TABLE job_applications_old
      `
    ],
    "write"
  );
}

export async function ensureDb() {
  if (!global.__jobTrackerDbReady) {
    global.__jobTrackerDbReady = initialize();
  }

  await global.__jobTrackerDbReady;
}

export async function createApplication(input: Omit<JobApplication, "id" | "createdAt">) {
  await ensureDb();
  const db = getClient();

  await db.execute({
    sql: `
      INSERT INTO job_applications (
        company_name,
        position,
        job_description,
        contact_email,
        contact_no,
        address,
        status,
        reason
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      input.companyName,
      input.position,
      input.jobDescription,
      input.contactEmail,
      input.contactNo,
      input.address,
      input.status,
      input.reason
    ]
  });
}

export async function updateApplicationStatus(input: {
  id: number;
  status: JobApplication["status"];
  reason: string | null;
}) {
  await ensureDb();
  const db = getClient();

  await db.execute({
    sql: `
      UPDATE job_applications
      SET status = ?, reason = ?
      WHERE id = ?
    `,
    args: [input.status, input.reason, input.id]
  });
}

export async function deleteApplication(id: number) {
  await ensureDb();
  const db = getClient();

  await db.execute({
    sql: "DELETE FROM job_applications WHERE id = ?",
    args: [id]
  });
}

function buildFilterQuery(filters: Filters) {
  const conditions: string[] = [];
  const args: string[] = [];

  if (filters.status && filters.status !== "All") {
    conditions.push("status = ?");
    args.push(filters.status);
  }

  if (filters.companyName) {
    conditions.push("LOWER(company_name) LIKE LOWER(?)");
    args.push(`%${filters.companyName}%`);
  }

  if (filters.createdAt) {
    conditions.push("date(created_at) = ?");
    args.push(filters.createdAt);
  }

  return {
    whereClause: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "",
    args
  };
}

export async function listApplications(
  filters: Filters,
  options?: {
    page?: number;
    pageSize?: number;
  }
) {
  await ensureDb();
  const db = getClient();
  const page = Math.max(1, options?.page ?? 1);
  const pageSize = Math.max(1, options?.pageSize ?? 10);
  const offset = (page - 1) * pageSize;
  const { whereClause, args } = buildFilterQuery(filters);

  const countResult = await db.execute({
    sql: `
      SELECT COUNT(*) as total
      FROM job_applications
      ${whereClause}
    `,
    args
  });

  const total = Number(countResult.rows[0]?.total ?? 0);
  const result = await db.execute({
    sql: `
      SELECT
        id,
        company_name,
        position,
        job_description,
        contact_email,
        contact_no,
        address,
        status,
        reason,
        created_at
      FROM job_applications
      ${whereClause}
      ORDER BY datetime(created_at) DESC, id DESC
      LIMIT ? OFFSET ?
    `,
    args: [...args, String(pageSize), String(offset)]
  });

  return {
    items: result.rows.map((row) => ({
      id: Number(row.id),
      companyName: String(row.company_name),
      position: String(row.position),
      jobDescription: String(row.job_description),
      contactEmail: String(row.contact_email),
      contactNo: String(row.contact_no),
      address: String(row.address),
      status: row.status as JobApplication["status"],
      reason: row.reason ? String(row.reason) : null,
      createdAt: String(row.created_at)
    })),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize))
  };
}
