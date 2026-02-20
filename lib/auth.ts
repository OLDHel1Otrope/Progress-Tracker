import { cookies } from "next/headers";
import { db } from "@/lib/db";

const COOKIE_NAME = "session_id";

export async function setSession(userId: string) {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, userId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}


export async function clearSession() {
  const cookieStore = await cookies();

  cookieStore.delete(COOKIE_NAME);
}

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
