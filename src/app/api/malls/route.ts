import { NextResponse } from "next/server";
import { db } from "@/db";
import { malls, categories, products, discounts } from "@/db/schema";
import { eq, count } from "drizzle-orm";

export async function GET() {
  try {
    const allMalls = await db
      .select({
        id: malls.id,
        name: malls.name,
        description: malls.description,
        address: malls.address,
        phone: malls.phone,
        imageUrl: malls.imageUrl,
        isActive: malls.isActive,
        internalDeliveryFee: malls.internalDeliveryFee,
        externalDeliveryFee: malls.externalDeliveryFee,
        createdAt: malls.createdAt,
      })
      .from(malls)
      .where(eq(malls.isActive, true));

    return NextResponse.json({ malls: allMalls });
  } catch (error) {
    console.error("Error fetching malls:", error);
    return NextResponse.json({ error: "فشل في جلب البيانات" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      address,
      phone,
      imageUrl,
      bankAccountNumber,
      bankAccountName,
      internalDeliveryFee,
      externalDeliveryFee,
    } = body;

    if (!name || !address) {
      return NextResponse.json(
        { error: "الاسم والعنوان مطلوبان" },
        { status: 400 }
      );
    }

    const [newMall] = await db
      .insert(malls)
      .values({
        name,
        description,
        address,
        phone,
        imageUrl,
        bankAccountNumber,
        bankAccountName,
        internalDeliveryFee: internalDeliveryFee || "5.00",
        externalDeliveryFee: externalDeliveryFee || "10.00",
      })
      .returning();

    return NextResponse.json({ mall: newMall }, { status: 201 });
  } catch (error) {
    console.error("Error creating mall:", error);
    return NextResponse.json(
      { error: "فشل في إنشاء المول" },
      { status: 500 }
    );
  }
}
