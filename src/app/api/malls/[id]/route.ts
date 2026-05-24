import { NextResponse } from "next/server";
import { db } from "@/db";
import { malls, categories, products, discounts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const mallId = parseInt(id);

    if (isNaN(mallId)) {
      return NextResponse.json({ error: "معرف غير صالح" }, { status: 400 });
    }

    const [mall] = await db.select().from(malls).where(eq(malls.id, mallId));

    if (!mall) {
      return NextResponse.json({ error: "المول غير موجود" }, { status: 404 });
    }

    // جلب الأقسام مع المنتجات
    const mallCategories = await db
      .select()
      .from(categories)
      .where(eq(categories.mallId, mallId));

    const mallProducts = await db
      .select()
      .from(products)
      .where(and(eq(products.mallId, mallId), eq(products.isAvailable, true)));

    // جلب العروض النشطة
    const mallDiscounts = await db
      .select()
      .from(discounts)
      .where(and(eq(discounts.mallId, mallId), eq(discounts.isActive, true)));

    // تجميع المنتجات داخل الأقسام
    const categoriesWithProducts = mallCategories.map((cat) => ({
      ...cat,
      products: mallProducts.filter((p) => p.categoryId === cat.id),
    }));

    return NextResponse.json({
      mall,
      categories: categoriesWithProducts,
      discounts: mallDiscounts,
    });
  } catch (error) {
    console.error("Error fetching mall:", error);
    return NextResponse.json({ error: "فشل في جلب البيانات" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const mallId = parseInt(id);
    const body = await request.json();

    const [updated] = await db
      .update(malls)
      .set(body)
      .where(eq(malls.id, mallId))
      .returning();

    return NextResponse.json({ mall: updated });
  } catch (error) {
    console.error("Error updating mall:", error);
    return NextResponse.json({ error: "فشل في التحديث" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const mallId = parseInt(id);

    await db.update(malls).set({ isActive: false }).where(eq(malls.id, mallId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting mall:", error);
    return NextResponse.json({ error: "فشل في الحذف" }, { status: 500 });
  }
}
