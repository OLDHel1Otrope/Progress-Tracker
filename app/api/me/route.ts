import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

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
    auto_place: user.auto_place
  });
}
