import { db } from "@/db";
import { malls, categories, products, discounts } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MallClient from "./MallClient";

async function getMallData(id: number) {
  const [mall] = await db.select().from(malls).where(eq(malls.id, id));
  if (!mall) return null;

  const mallCategories = await db
    .select()
    .from(categories)
    .where(eq(categories.mallId, id));

  const mallProducts = await db
    .select()
    .from(products)
    .where(and(eq(products.mallId, id), eq(products.isAvailable, true)));

  const mallDiscounts = await db
    .select()
    .from(discounts)
    .where(and(eq(discounts.mallId, id), eq(discounts.isActive, true)));

  const categoriesWithProducts = mallCategories
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((cat) => ({
      ...cat,
      products: mallProducts.filter((p) => p.categoryId === cat.id),
    }));

  return { mall, categories: categoriesWithProducts, discounts: mallDiscounts };
}

export default async function MallPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const mallId = parseInt(id);

  if (isNaN(mallId)) notFound();

  let data;
  try {
    data = await getMallData(mallId);
  } catch {
    data = null;
  }

  if (!data) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-16">
        <MallClient
          mall={data.mall}
          categories={data.categories}
          discounts={data.discounts}
        />
      </div>
      <Footer />
    </div>
  );
}
