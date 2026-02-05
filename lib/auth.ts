import { cookies } from "next/headers";
import { db } from "@/lib/db";

const COOKIE_NAME = "session_id";

// ------------------------
// Set session
// ------------------------
export async function setSession(userId: string) {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, userId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

// ------------------------
// Clear session
// ------------------------
export async function clearSession() {
  const cookieStore = await cookies();

  cookieStore.delete(COOKIE_NAME);
}

// ------------------------
// Get current user
// ------------------------
export async function getSessionUser() {
  const cookieStore = await cookies();

  const cookie = cookieStore.get(COOKIE_NAME);

  if (!cookie) return null;

  const userId = cookie.value;

  const res = await db.query(
    `SELECT id, name FROM users WHERE id = $1`,
    [userId]
  );

  if (res.rowCount === 0) return null;

  return res.rows[0];
}
