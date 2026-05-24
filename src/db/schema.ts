import {
  pgTable,
  serial,
  text,
  varchar,
  decimal,
  integer,
  boolean,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ==================== ENUMS ====================
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "payment_pending",
  "payment_confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
]);

export const deliveryTypeEnum = pgEnum("delivery_type", [
  "internal",
  "external",
]);

export const userRoleEnum = pgEnum("user_role", [
  "customer",
  "admin",
  "delivery",
]);

// ==================== TABLES ====================

// المستخدمون
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull().unique(),
  address: text("address"),
  role: userRoleEnum("role").default("customer").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// المولات والمحلات
export const malls = pgTable("malls", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  address: text("address").notNull(),
  phone: varchar("phone", { length: 20 }),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true).notNull(),
  bankAccountNumber: varchar("bank_account_number", { length: 50 }),
  bankAccountName: varchar("bank_account_name", { length: 100 }),
  internalDeliveryFee: decimal("internal_delivery_fee", {
    precision: 10,
    scale: 2,
  })
    .default("5.00")
    .notNull(),
  externalDeliveryFee: decimal("external_delivery_fee", {
    precision: 10,
    scale: 2,
  })
    .default("10.00")
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// أقسام المول
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  mallId: integer("mall_id")
    .references(() => malls.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  icon: varchar("icon", { length: 50 }),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// المنتجات
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .references(() => categories.id, { onDelete: "cascade" })
    .notNull(),
  mallId: integer("mall_id")
    .references(() => malls.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 30 }).default("قطعة"),
  imageUrl: text("image_url"),
  isAvailable: boolean("is_available").default(true).notNull(),
  stock: integer("stock").default(999),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// التخفيضات والعروض
export const discounts = pgTable("discounts", {
  id: serial("id").primaryKey(),
  mallId: integer("mall_id")
    .references(() => malls.id, { onDelete: "cascade" })
    .notNull(),
  productId: integer("product_id").references(() => products.id, {
    onDelete: "cascade",
  }),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  discountPercent: decimal("discount_percent", { precision: 5, scale: 2 }),
  newPrice: decimal("new_price", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").default(true).notNull(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// الطلبات
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: varchar("order_number", { length: 20 }).notNull().unique(),
  customerName: varchar("customer_name", { length: 100 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 20 }).notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  deliveryType: deliveryTypeEnum("delivery_type").notNull(),
  // nullable — الطلب ممكن يكون من أكثر من مول
  mallId: integer("mall_id").references(() => malls.id),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  deliveryFee: decimal("delivery_fee", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: orderStatusEnum("status").default("pending").notNull(),
  paymentTransferRef: varchar("payment_transfer_ref", { length: 100 }),
  notes: text("notes"),
  assignedTo: integer("assigned_to").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// تفاصيل الطلب
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .references(() => orders.id, { onDelete: "cascade" })
    .notNull(),
  productId: integer("product_id")
    .references(() => products.id)
    .notNull(),
  productName: varchar("product_name", { length: 200 }).notNull(),
  // اسم المول لكي يعرف الـ delivery وين يشتري كل منتج
  mallName: varchar("mall_name", { length: 100 }),
  mallId: integer("mall_id").references(() => malls.id),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
});

// الإشعارات
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .references(() => orders.id, { onDelete: "cascade" })
    .notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== RELATIONS ====================
export const mallsRelations = relations(malls, ({ many }) => ({
  categories: many(categories),
  products: many(products),
  discounts: many(discounts),
  orders: many(orders),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  mall: one(malls, { fields: [categories.mallId], references: [malls.id] }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  mall: one(malls, { fields: [products.mallId], references: [malls.id] }),
  orderItems: many(orderItems),
}));

export const discountsRelations = relations(discounts, ({ one }) => ({
  mall: one(malls, { fields: [discounts.mallId], references: [malls.id] }),
  product: one(products, {
    fields: [discounts.productId],
    references: [products.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  mall: one(malls, { fields: [orders.mallId], references: [malls.id] }),
  items: many(orderItems),
  notifications: many(notifications),
  assignedUser: one(users, {
    fields: [orders.assignedTo],
    references: [users.id],
  }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  order: one(orders, {
    fields: [notifications.orderId],
    references: [orders.id],
  }),
}));
