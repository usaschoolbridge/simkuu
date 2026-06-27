import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

// PATCH /api/admin/plans/:id — update a plan
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const plan = await db.plan.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.price !== undefined && { price: parseFloat(body.price) }),
        ...(body.originalPrice !== undefined && { originalPrice: body.originalPrice ? parseFloat(body.originalPrice) : null }),
        ...(body.data !== undefined && { data: body.data }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.badge !== undefined && { badge: body.badge }),
        ...(body.fiveG !== undefined && { fiveG: body.fiveG }),
        ...(body.hotspot !== undefined && { hotspot: body.hotspot }),
        ...(body.features !== undefined && { features: body.features }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
      },
    });
    return NextResponse.json(plan);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update plan" }, { status: 500 });
  }
}

// DELETE /api/admin/plans/:id — delete a plan
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.plan.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete plan" }, { status: 500 });
  }
}
