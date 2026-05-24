import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mallId, name, icon, sortOrder } = body;

    if (!mallId || !name) {
      return NextResponse.json(
        { error: "معرف المول والاسم مطلوبان" },
        { status: 400 }
      );
    }

    const [newCategory] = await db
      .insert(categories)
      .values({ mallId, name, icon, sortOrder: sortOrder || 0 })
      .returning();

    return NextResponse.json({ category: newCategory }, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json({ error: "فشل في إنشاء القسم" }, { status: 500 });
  }
}
