export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

const ADMIN_COOKIE = "simkuu_admin_session";

async function requireAdmin(): Promise<boolean> {
  const c = await cookies();
  return c.get(ADMIN_COOKIE)?.value === "authenticated";
}

/**
 * POST /api/admin/reset
 * Wipes all demo/business transactional data while preserving config.
 * Preserved: Admin users, Plans, Carriers, Coupons, Inventory (reset to AVAILABLE), Settings.
 * Deleted: Orders, ESims, Invoices, TicketMessages, SupportTickets, non-admin Users, Notifications.
 */
export async function POST(req: NextRequest) {
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json().catch(() => ({}));
    // Safety confirmation — must pass { confirm: "RESET" }
    if (body.confirm !== "RESET") {
      return NextResponse.json({ error: 'Send { "confirm": "RESET" } to confirm' }, { status: 400 });
    }

    // Delete in dependency order (children before parents)
    const [
      deletedTicketMessages,
      deletedNotifications,
      deletedRewards,
      deletedReferralEarnings,
    ] = await Promise.all([
      db.ticketMessage.deleteMany({}),
      db.notification.deleteMany({}),
      db.reward.deleteMany({}),
      db.referralEarning.deleteMany({}),
    ]);

    const [deletedTickets] = await Promise.all([
      db.supportTicket.deleteMany({}),
    ]);

    // ESim, Invoice, InventoryItem (order relation) before Order
    const [deletedEsims, deletedInvoices] = await Promise.all([
      db.eSim.deleteMany({}),
      db.invoice.deleteMany({}),
    ]);

    // Reset sold/reserved inventory items back to AVAILABLE
    const resetInventory = await db.inventoryItem.updateMany({
      where: { status: { in: ["SOLD", "RESERVED"] } },
      data: { status: "AVAILABLE", orderId: null, reservedAt: null, soldAt: null },
    });

    // Delete orders
    const deletedOrders = await db.order.deleteMany({});

    // Delete non-admin user sessions and accounts, then guest users
    await db.session.deleteMany({});
    await db.account.deleteMany({});
    const deletedUsers = await db.user.deleteMany({
      where: { role: "USER" },
    });

    // Reset coupon usage counts
    await db.coupon.updateMany({}, { data: { usedCount: 0 } });

    return NextResponse.json({
      success: true,
      deleted: {
        orders: deletedOrders.count,
        esims: deletedEsims.count,
        invoices: deletedInvoices.count,
        tickets: deletedTickets.count,
        ticketMessages: deletedTicketMessages.count,
        notifications: deletedNotifications.count,
        users: deletedUsers.count,
      },
      reset: {
        inventoryItems: resetInventory.count,
        couponUsageCounts: "reset to 0",
      },
    });
  } catch (err) {
    console.error("[admin/reset]", err);
    return NextResponse.json({ error: "Reset failed" }, { status: 500 });
  }
}
