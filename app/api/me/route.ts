import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";


export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    userName: user.name,
    focus_mode: user.focus_mode,
    carry_over: user.carry_over,
    zestify_mode: user.zestify_mode,
    auto_place: user.auto_place,
    target_date: user.target_date,
    home_order: user.home_order
  });
}

export async function PATCH(req: Request) {
  const client = await db.connect();

  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { focus_mode, carry_over, zestify_mode, auto_place, target_date, home_order } = body;

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (typeof focus_mode === "boolean") {
      fields.push(`focus_mode = $${idx++}`);
      values.push(focus_mode);
    }

    if (typeof carry_over === "boolean") {
      fields.push(`carry_over = $${idx++}`);
      values.push(carry_over);
    }

    if (typeof zestify_mode === "boolean") {
      fields.push(`zestify_mode = $${idx++}`);
      values.push(zestify_mode);
    }

    if (typeof auto_place === "boolean") {
      fields.push(`auto_place = $${idx++}`);
      values.push(auto_place);
    }

    if (typeof target_date === "string") {
      fields.push(`target_date = $${idx++}`);
      values.push(target_date);
    }

    if (Array.isArray(home_order)) {
      fields.push(`home_order = $${idx++}`);
      values.push(JSON.stringify(home_order));
    }


    if (fields.length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided" },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    const res = await client.query(
      `
      UPDATE users
      SET ${fields.join(", ")}
      WHERE id = $${idx}
      RETURNING id, focus_mode, carry_over, zestify_mode, auto_place, target_date, home_order;
      `,
      [...values, user.id]
    );

    await client.query("COMMIT");

    return NextResponse.json(res.rows[0]);
  } catch (error: any) {
    await client.query("ROLLBACK");

    console.error("PATCH /me user details failed", error);

    return NextResponse.json(
      {
        error: "Failed to update user details",
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}