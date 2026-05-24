import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems, malls, notifications } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // البحث بالرقم أو المعرف
    let order;
    const numId = parseInt(id);

    if (!isNaN(numId)) {
      [order] = await db
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
          mallBankAccount: malls.bankAccountNumber,
          mallBankName: malls.bankAccountName,
          mallPhone: malls.phone,
        })
        .from(orders)
        .leftJoin(malls, eq(orders.mallId, malls.id))
        .where(eq(orders.id, numId));
    }

    if (!order) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    }

    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id));

    return NextResponse.json({ order, items });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json({ error: "فشل في جلب الطلب" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = parseInt(id);
    const body = await request.json();
    const { status, paymentTransferRef } = body;

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (status) updateData.status = status;
    if (paymentTransferRef) updateData.paymentTransferRef = paymentTransferRef;

    const [updated] = await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, orderId))
      .returning();

    // إشعار بتغيير الحالة
    if (status) {
      const statusMessages: Record<string, string> = {
        payment_confirmed: "تم تأكيد الدفع وجاري تجهيز طلبك",
        preparing: "طلبك قيد التجهيز الآن",
        out_for_delivery: "طلبك في الطريق إليك",
        delivered: "تم توصيل طلبك بنجاح",
        cancelled: "تم إلغاء الطلب",
      };

      if (statusMessages[status]) {
        await db.insert(notifications).values({
          orderId,
          type: "status_update",
          message: statusMessages[status],
        });
      }
    }

    return NextResponse.json({ order: updated });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json({ error: "فشل في تحديث الطلب" }, { status: 500 });
  }
}
