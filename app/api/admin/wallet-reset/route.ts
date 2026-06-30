export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

  const cookieStore = await cookies();
  const adminCookie = cookieStore.get("simkuu_admin_session")?.value;
  if (adminCookie !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  if (body.confirm !== "RESET_WALLETS") {
    return NextResponse.json({ error: 'Send { "confirm": "RESET_WALLETS" } to proceed' }, { status: 400 });
  }

  try {
    const [deletedTx, updatedUsers] = await Promise.all([
      db.walletTransaction.deleteMany({}),
      db.user.updateMany({ data: { walletBalance: 0 } }),
    ]);

    return NextResponse.json({
      ok: true,
      walletsReset: updatedUsers.count,
      transactionsDeleted: deletedTx.count,
    });
  } catch (err) {
    console.error("[admin/wallet-reset]", err);
    return NextResponse.json({ error: "Reset failed" }, { status: 500 });
  }
}
