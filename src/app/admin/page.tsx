import { db } from "@/db";
import { malls, orders, products, notifications } from "@/db/schema";
import { eq, count, desc } from "drizzle-orm";
import Navbar from "@/components/Navbar";
import AdminClient from "./AdminClient";

async function getDashboardData() {
  try {
    const [allMalls, allOrders, allNotifications] = await Promise.all([
      db.select().from(malls).where(eq(malls.isActive, true)),
      db
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
          mallId: orders.mallId,
          mallName: malls.name,
        })
        .from(orders)
        .leftJoin(malls, eq(orders.mallId, malls.id))
        .orderBy(desc(orders.createdAt))
        .limit(100),
      db
        .select({
          id: notifications.id,
          orderId: notifications.orderId,
          type: notifications.type,
          message: notifications.message,
          isRead: notifications.isRead,
          createdAt: notifications.createdAt,
        })
        .from(notifications)
        .orderBy(desc(notifications.createdAt))
        .limit(20),
    ]);

    return {
      malls: allMalls,
      orders: allOrders.map((o) => ({
        ...o,
        createdAt: o.createdAt.toISOString(),
        updatedAt: o.updatedAt ? o.updatedAt.toISOString() : "",
      })),
      notifications: allNotifications.map((n) => ({
        ...n,
        createdAt: n.createdAt.toISOString(),
      })),
    };
  } catch {
    return { malls: [], orders: [], notifications: [] };
  }
}

export default async function AdminPage() {
  const data = await getDashboardData();

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="pt-16">
        <AdminClient
          initialMalls={data.malls}
          initialOrders={data.orders}
          initialNotifications={data.notifications}
        />
      </div>
    </div>
  );
}
