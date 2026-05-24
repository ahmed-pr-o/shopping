import { NextResponse } from "next/server";
import { db } from "@/db";
import { notifications, orders } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    let allNotifications;
    if (orderId) {
      allNotifications = await db
        .select()
        .from(notifications)
        .where(eq(notifications.orderId, parseInt(orderId)))
        .orderBy(desc(notifications.createdAt));
    } else {
      allNotifications = await db
        .select({
          id: notifications.id,
          orderId: notifications.orderId,
          type: notifications.type,
          message: notifications.message,
          isRead: notifications.isRead,
          createdAt: notifications.createdAt,
          orderNumber: orders.orderNumber,
        })
        .from(notifications)
        .leftJoin(orders, eq(notifications.orderId, orders.id))
        .orderBy(desc(notifications.createdAt))
        .limit(50);
    }

    return NextResponse.json({ notifications: allNotifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "فشل في جلب الإشعارات" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json({ error: "فشل في التحديث" }, { status: 500 });
  }
}
