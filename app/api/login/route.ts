import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { setSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { passphrase } = await req.json();

    if (!passphrase) {
      return NextResponse.json(
        { error: "Missing passphrase" },
        { status: 400 }
      );
    }

    const result = await db.query(`
      SELECT id, password_hash, name
      FROM users
    `);

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "No user found" },
        { status: 401 }
      );
    }

    let matchedUser = null;

    for (const user of result.rows) {
      const ok = await bcrypt.compare(passphrase, user.password_hash);
      if (ok) {
        console.log(user.password_hash)
        matchedUser = user;
        break;
      }
    }
    

    if (!matchedUser) {
      return NextResponse.json(
        { error: "Invalid passphrase" },
        { status: 401 }
      );
    }

    // Set cookie
    await setSession(matchedUser.id);

    return NextResponse.json({
      success: true,
      userName: matchedUser.name,
    });

  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}
