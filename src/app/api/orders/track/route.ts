import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems, malls } from "@/db/schema";
import { eq, or } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get("orderNumber");
    const phone = searchParams.get("phone");

    if (!orderNumber && !phone) {
      return NextResponse.json(
        { error: "رقم الطلب أو رقم الهاتف مطلوب" },
        { status: 400 }
      );
    }

    let foundOrders;
    if (orderNumber) {
      foundOrders = await db
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          customerName: orders.customerName,
          customerPhone: orders.customerPhone,
          deliveryAddress: orders.deliveryAddress,
          deliveryType: orders.deliveryType,
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
        })
        .from(orders)
        .leftJoin(malls, eq(orders.mallId, malls.id))
        .where(eq(orders.orderNumber, orderNumber));
    } else {
      foundOrders = await db
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          customerName: orders.customerName,
          customerPhone: orders.customerPhone,
          deliveryAddress: orders.deliveryAddress,
          deliveryType: orders.deliveryType,
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
        })
        .from(orders)
        .leftJoin(malls, eq(orders.mallId, malls.id))
        .where(eq(orders.customerPhone, phone!));
    }

    if (!foundOrders.length) {
      return NextResponse.json({ error: "لم يتم العثور على طلب" }, { status: 404 });
    }

    // جلب items لكل طلب
    const ordersWithItems = await Promise.all(
      foundOrders.map(async (order) => {
        const items = await db
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, order.id));
        return { ...order, items };
      })
    );

    return NextResponse.json({ orders: ordersWithItems });
  } catch (error) {
    console.error("Error tracking order:", error);
    return NextResponse.json({ error: "فشل في تتبع الطلب" }, { status: 500 });
  }
}
