import { NextResponse } from "next/server";
import { db } from "@/db";
import { discounts, products } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mallId = searchParams.get("mallId");

    let allDiscounts;
    if (mallId) {
      allDiscounts = await db
        .select()
        .from(discounts)
        .where(and(eq(discounts.mallId, parseInt(mallId)), eq(discounts.isActive, true)));
    } else {
      allDiscounts = await db
        .select()
        .from(discounts)
        .where(eq(discounts.isActive, true));
    }

    return NextResponse.json({ discounts: allDiscounts });
  } catch (error) {
    console.error("Error fetching discounts:", error);
    return NextResponse.json({ error: "فشل في جلب العروض" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mallId, productId, title, description, discountPercent, newPrice, expiresAt } = body;

    if (!mallId || !title) {
      return NextResponse.json({ error: "البيانات مطلوبة" }, { status: 400 });
    }

    const [newDiscount] = await db
      .insert(discounts)
      .values({
        mallId,
        productId,
        title,
        description,
        discountPercent,
        newPrice,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      })
      .returning();

    return NextResponse.json({ discount: newDiscount }, { status: 201 });
  } catch (error) {
    console.error("Error creating discount:", error);
    return NextResponse.json({ error: "فشل في إنشاء العرض" }, { status: 500 });
  }
}
