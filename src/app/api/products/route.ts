import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq, and, ilike, or } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mallId = searchParams.get("mallId");
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");

    let query = db.select().from(products).$dynamic();

    const conditions = [eq(products.isAvailable, true)];

    if (mallId) conditions.push(eq(products.mallId, parseInt(mallId)));
    if (categoryId)
      conditions.push(eq(products.categoryId, parseInt(categoryId)));
    if (search) conditions.push(ilike(products.name, `%${search}%`));

    const result = await query.where(and(...conditions));

    return NextResponse.json({ products: result });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "فشل في جلب المنتجات" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      categoryId,
      mallId,
      name,
      description,
      price,
      unit,
      imageUrl,
      stock,
    } = body;

    if (!categoryId || !mallId || !name || !price) {
      return NextResponse.json(
        { error: "البيانات الأساسية مطلوبة" },
        { status: 400 }
      );
    }

    const [newProduct] = await db
      .insert(products)
      .values({
        categoryId,
        mallId,
        name,
        description,
        price,
        unit: unit || "قطعة",
        imageUrl,
        stock: stock || 999,
      })
      .returning();

    return NextResponse.json({ product: newProduct }, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "فشل في إنشاء المنتج" },
      { status: 500 }
    );
  }
}
