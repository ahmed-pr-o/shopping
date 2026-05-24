import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems, notifications } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { malls } from "@/db/schema";

function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `SQ-${year}${month}${day}-${random}`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");
    const status = searchParams.get("status");

    let allOrders = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        customerName: orders.customerName,
        customerPhone: orders.customerPhone,
        deliveryAddress: orders.deliveryAddress,
        deliveryType: orders.deliveryType,
        mallId: orders.mallId,
        subtotal: orders.subtotal,
        deliveryFee: orders.deliveryFee,
        total: orders.total,
        status: orders.status,
        paymentTransferRef: orders.paymentTransferRef,
        notes: orders.notes,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        mallName: malls.name,
      })
      .from(orders)
      .leftJoin(malls, eq(orders.mallId, malls.id))
      .orderBy(desc(orders.createdAt));

    if (phone) allOrders = allOrders.filter((o) => o.customerPhone === phone);
    if (status) allOrders = allOrders.filter((o) => o.status === status);

    return NextResponse.json({ orders: allOrders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "فشل في جلب الطلبات" }, { status: 500 });
  }
}

type CartItemInput = {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unit: string;
};

type MallCartInput = {
  mallId: number;
  mallName: string;
  items: CartItemInput[];
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      deliveryAddress,
      deliveryType,
      notes,
      carts,       // MallCartInput[]
      deliveryFee,
    }: {
      customerName: string;
      customerPhone: string;
      deliveryAddress: string;
      deliveryType: string;
      notes?: string;
      carts: MallCartInput[];
      deliveryFee?: number;
    } = body;

    if (!customerName || !customerPhone || !deliveryAddress || !deliveryType || !carts?.length) {
      return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
    }

    const subtotal = carts.reduce(
      (sum, mc) => sum + mc.items.reduce((s, i) => s + i.totalPrice, 0),
      0
    );

    const fee = deliveryFee ?? (deliveryType === "internal" ? 5 : 10);
    const total = subtotal + fee;
    const orderNumber = generateOrderNumber();

    const [newOrder] = await db
      .insert(orders)
      .values({
        orderNumber,
        customerName,
        customerPhone,
        deliveryAddress,
        deliveryType: deliveryType as "internal" | "external",
        mallId: null, // طلب متعدد المولات
        subtotal: subtotal.toFixed(2),
        deliveryFee: fee.toFixed(2),
        total: total.toFixed(2),
        notes: notes ?? null,
        status: "pending",
      })
      .returning();

    // كل item يحمل mallName و mallId — الـ delivery يعرف وين يشتري
    const allItems = carts.flatMap((mc) =>
      mc.items.map((item) => ({
        orderId: newOrder.id,
        productId: item.productId,
        productName: item.productName,
        mallName: mc.mallName,
        mallId: mc.mallId,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toFixed(2),
        totalPrice: item.totalPrice.toFixed(2),
      }))
    );

    await db.insert(orderItems).values(allItems);

    const mallNames = [...new Set(carts.map((mc) => mc.mallName))].join("، ");
    await db.insert(notifications).values({
      orderId: newOrder.id,
      type: "new_order",
      message: `طلب جديد #${orderNumber} من ${customerName} — مولات: ${mallNames} — إجمالي: ${total.toFixed(2)}₪`,
    });

    return NextResponse.json({ order: newOrder }, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "فشل في إنشاء الطلب" }, { status: 500 });
  }
}
