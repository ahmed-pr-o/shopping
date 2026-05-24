import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);
    const body = await request.json();

    const [updated] = await db
      .update(products)
      .set(body)
      .where(eq(products.id, productId))
      .returning();

    return NextResponse.json({ product: updated });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "فشل في التحديث" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);

    await db
      .update(products)
      .set({ isAvailable: false })
      .where(eq(products.id, productId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "فشل في الحذف" }, { status: 500 });
  }
}
