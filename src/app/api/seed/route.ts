import { NextResponse } from "next/server";
import { db } from "@/db";
import { malls, categories, products, discounts } from "@/db/schema";

export async function POST() {
  try {
    // حذف البيانات القديمة
    await db.delete(discounts);
    await db.delete(products);
    await db.delete(categories);
    await db.delete(malls);

    // إضافة المولات
    const insertedMalls = await db
      .insert(malls)
      .values([
        {
          name: "مول أبو دلال",
          description: "أكبر مول في غزة، يضم أشهر الماركات والمنتجات بأسعار تنافسية",
          address: "غزة - الرمال",
          phone: "0599-111-111",
          imageUrl: "/images/mall1.jpg",
          bankAccountNumber: "1234567890",
          bankAccountName: "محمد أبو دلال",
          internalDeliveryFee: "5.00",
          externalDeliveryFee: "12.00",
        },
        {
          name: "سوبرماركت النصر",
          description: "سوبرماركت متكامل يوفر كل احتياجاتك اليومية بأفضل الأسعار",
          address: "غزة - الشجاعية",
          phone: "0599-222-222",
          imageUrl: "/images/mall2.jpg",
          bankAccountNumber: "0987654321",
          bankAccountName: "سوبرماركت النصر",
          internalDeliveryFee: "4.00",
          externalDeliveryFee: "10.00",
        },
        {
          name: "مجمع السلام التجاري",
          description: "مركز تجاري شامل في قلب مدينة غزة",
          address: "غزة - تل الهوى",
          phone: "0599-333-333",
          imageUrl: "/images/mall3.jpg",
          bankAccountNumber: "1122334455",
          bankAccountName: "مجمع السلام",
          internalDeliveryFee: "5.00",
          externalDeliveryFee: "15.00",
        },
      ])
      .returning();

    const mall1 = insertedMalls[0];
    const mall2 = insertedMalls[1];
    const mall3 = insertedMalls[2];

    // أقسام مول أبو دلال
    const mall1Categories = await db
      .insert(categories)
      .values([
        { mallId: mall1.id, name: "اللحوم والدواجن", icon: "🥩", sortOrder: 1 },
        { mallId: mall1.id, name: "الخضروات والفواكه", icon: "🥦", sortOrder: 2 },
        { mallId: mall1.id, name: "الألبان والبيض", icon: "🥛", sortOrder: 3 },
        { mallId: mall1.id, name: "المكسرات والتمور", icon: "🌰", sortOrder: 4 },
        { mallId: mall1.id, name: "المشروبات", icon: "🧃", sortOrder: 5 },
        { mallId: mall1.id, name: "البقالة والمعلبات", icon: "🥫", sortOrder: 6 },
      ])
      .returning();

    // أقسام سوبرماركت النصر
    const mall2Categories = await db
      .insert(categories)
      .values([
        { mallId: mall2.id, name: "الخبز والمعجنات", icon: "🍞", sortOrder: 1 },
        { mallId: mall2.id, name: "البقالة", icon: "🛒", sortOrder: 2 },
        { mallId: mall2.id, name: "الخضروات", icon: "🥕", sortOrder: 3 },
        { mallId: mall2.id, name: "المشروبات", icon: "🥤", sortOrder: 4 },
        { mallId: mall2.id, name: "منتجات التنظيف", icon: "🧹", sortOrder: 5 },
      ])
      .returning();

    // أقسام مجمع السلام
    const mall3Categories = await db
      .insert(categories)
      .values([
        { mallId: mall3.id, name: "الملابس", icon: "👕", sortOrder: 1 },
        { mallId: mall3.id, name: "الإلكترونيات", icon: "📱", sortOrder: 2 },
        { mallId: mall3.id, name: "الأدوات المنزلية", icon: "🏠", sortOrder: 3 },
        { mallId: mall3.id, name: "الأحذية", icon: "👟", sortOrder: 4 },
      ])
      .returning();

    // منتجات مول أبو دلال
    await db.insert(products).values([
      // اللحوم
      { categoryId: mall1Categories[0].id, mallId: mall1.id, name: "لحم غنم طازج", price: "45.00", unit: "كيلو", description: "لحم غنم طازج من أفضل المصادر" },
      { categoryId: mall1Categories[0].id, mallId: mall1.id, name: "لحم بقر مفروم", price: "38.00", unit: "كيلو", description: "لحم بقر مفروم طازج 100%" },
      { categoryId: mall1Categories[0].id, mallId: mall1.id, name: "دجاج كامل", price: "22.00", unit: "كيلو", description: "دجاج طازج يومي" },
      { categoryId: mall1Categories[0].id, mallId: mall1.id, name: "صدر دجاج", price: "28.00", unit: "كيلو", description: "صدر دجاج منظف" },
      { categoryId: mall1Categories[0].id, mallId: mall1.id, name: "أجنحة دجاج", price: "18.00", unit: "كيلو", description: "أجنحة دجاج طازجة" },
      // الخضروات
      { categoryId: mall1Categories[1].id, mallId: mall1.id, name: "طماطم", price: "3.50", unit: "كيلو", description: "طماطم طازجة" },
      { categoryId: mall1Categories[1].id, mallId: mall1.id, name: "خيار", price: "2.50", unit: "كيلو", description: "خيار طازج" },
      { categoryId: mall1Categories[1].id, mallId: mall1.id, name: "بطاطس", price: "4.00", unit: "كيلو", description: "بطاطس محلية" },
      { categoryId: mall1Categories[1].id, mallId: mall1.id, name: "تفاح أحمر", price: "8.00", unit: "كيلو", description: "تفاح أحمر طازج" },
      { categoryId: mall1Categories[1].id, mallId: mall1.id, name: "موز", price: "5.00", unit: "كيلو", description: "موز طازج" },
      // الألبان
      { categoryId: mall1Categories[2].id, mallId: mall1.id, name: "حليب طازج", price: "4.50", unit: "لتر", description: "حليب بقر طازج" },
      { categoryId: mall1Categories[2].id, mallId: mall1.id, name: "جبنة بيضاء", price: "12.00", unit: "كيلو", description: "جبنة بيضاء محلية" },
      { categoryId: mall1Categories[2].id, mallId: mall1.id, name: "بيض بلدي", price: "8.00", unit: "كرتونة 12", description: "بيض بلدي طازج" },
      { categoryId: mall1Categories[2].id, mallId: mall1.id, name: "لبن", price: "3.50", unit: "كيلو", description: "لبن طازج" },
      // المكسرات
      { categoryId: mall1Categories[3].id, mallId: mall1.id, name: "كاجو مشوي", price: "35.00", unit: "كيلو", description: "كاجو مشوي فاخر" },
      { categoryId: mall1Categories[3].id, mallId: mall1.id, name: "لوز", price: "28.00", unit: "كيلو", description: "لوز طازج" },
      { categoryId: mall1Categories[3].id, mallId: mall1.id, name: "تمر مجدول", price: "25.00", unit: "كيلو", description: "تمر مجدول فاخر" },
      { categoryId: mall1Categories[3].id, mallId: mall1.id, name: "فستق حلبي", price: "40.00", unit: "كيلو", description: "فستق حلبي محمص" },
      // المشروبات
      { categoryId: mall1Categories[4].id, mallId: mall1.id, name: "عصير برتقال", price: "5.00", unit: "لتر", description: "عصير برتقال طبيعي" },
      { categoryId: mall1Categories[4].id, mallId: mall1.id, name: "كوكاكولا", price: "3.50", unit: "علبة", description: "كوكاكولا 330ml" },
      { categoryId: mall1Categories[4].id, mallId: mall1.id, name: "مياه معدنية", price: "1.50", unit: "لتر ونص", description: "مياه معدنية نقية" },
      // البقالة
      { categoryId: mall1Categories[5].id, mallId: mall1.id, name: "أرز مصري", price: "6.00", unit: "كيلو", description: "أرز مصري درجة أولى" },
      { categoryId: mall1Categories[5].id, mallId: mall1.id, name: "سكر أبيض", price: "4.50", unit: "كيلو", description: "سكر أبيض ناعم" },
      { categoryId: mall1Categories[5].id, mallId: mall1.id, name: "زيت زيتون", price: "35.00", unit: "لتر", description: "زيت زيتون بكر ممتاز" },
      { categoryId: mall1Categories[5].id, mallId: mall1.id, name: "طحين", price: "3.50", unit: "كيلو", description: "طحين أبيض فاخر" },
    ]);

    // منتجات سوبرماركت النصر
    await db.insert(products).values([
      { categoryId: mall2Categories[0].id, mallId: mall2.id, name: "خبز عربي", price: "2.00", unit: "كيس 5 أرغفة", description: "خبز عربي طازج يومي" },
      { categoryId: mall2Categories[0].id, mallId: mall2.id, name: "كعك بالسمسم", price: "3.00", unit: "كيس", description: "كعك محلي بالسمسم" },
      { categoryId: mall2Categories[1].id, mallId: mall2.id, name: "معكرونة", price: "3.00", unit: "كيلو", description: "معكرونة إيطالية" },
      { categoryId: mall2Categories[1].id, mallId: mall2.id, name: "صلصة طماطم", price: "5.50", unit: "علبة 500g", description: "صلصة طماطم إيطالية" },
      { categoryId: mall2Categories[2].id, mallId: mall2.id, name: "بصل", price: "2.00", unit: "كيلو", description: "بصل طازج" },
      { categoryId: mall2Categories[2].id, mallId: mall2.id, name: "ثوم", price: "8.00", unit: "كيلو", description: "ثوم طازج" },
      { categoryId: mall2Categories[3].id, mallId: mall2.id, name: "شاي أحمر", price: "6.00", unit: "علبة", description: "شاي سيلاني فاخر" },
      { categoryId: mall2Categories[3].id, mallId: mall2.id, name: "قهوة عربية", price: "15.00", unit: "250g", description: "قهوة عربية محمصة" },
      { categoryId: mall2Categories[4].id, mallId: mall2.id, name: "صابون غسيل", price: "4.00", unit: "قطعة", description: "صابون غسيل فعال" },
      { categoryId: mall2Categories[4].id, mallId: mall2.id, name: "منظف متعدد الأغراض", price: "7.00", unit: "لتر", description: "منظف للأسطح" },
    ]);

    // منتجات مجمع السلام
    await db.insert(products).values([
      { categoryId: mall3Categories[0].id, mallId: mall3.id, name: "قميص رجالي", price: "35.00", unit: "قطعة", description: "قميص قطني عالي الجودة" },
      { categoryId: mall3Categories[0].id, mallId: mall3.id, name: "فستان نسائي", price: "55.00", unit: "قطعة", description: "فستان أنيق" },
      { categoryId: mall3Categories[0].id, mallId: mall3.id, name: "بنطلون جينز", price: "65.00", unit: "قطعة", description: "جينز عالي الجودة" },
      { categoryId: mall3Categories[1].id, mallId: mall3.id, name: "شاحن هاتف", price: "25.00", unit: "قطعة", description: "شاحن سريع متوافق" },
      { categoryId: mall3Categories[1].id, mallId: mall3.id, name: "سماعات بلوتوث", price: "85.00", unit: "قطعة", description: "سماعات لاسلكية" },
      { categoryId: mall3Categories[2].id, mallId: mall3.id, name: "طاسة ضغط", price: "120.00", unit: "قطعة", description: "طاسة ضغط استانليس" },
      { categoryId: mall3Categories[2].id, mallId: mall3.id, name: "مفرش طاولة", price: "45.00", unit: "قطعة", description: "مفرش قطني جميل" },
      { categoryId: mall3Categories[3].id, mallId: mall3.id, name: "حذاء رياضي", price: "95.00", unit: "زوج", description: "حذاء رياضي مريح" },
    ]);

    // العروض والتخفيضات
    await db.insert(discounts).values([
      {
        mallId: mall1.id,
        title: "تخفيض 20% على جميع اللحوم",
        description: "عرض خاص لفترة محدودة على اللحوم الطازجة",
        discountPercent: "20.00",
        isActive: true,
      },
      {
        mallId: mall1.id,
        title: "اشتري 2 كيلو تمر واحصل على الثالث مجاناً",
        description: "عرض التمور الخاص",
        discountPercent: "33.00",
        isActive: true,
      },
      {
        mallId: mall2.id,
        title: "خصم 15% على منتجات التنظيف",
        description: "عرض أسبوعي على جميع منتجات التنظيف",
        discountPercent: "15.00",
        isActive: true,
      },
      {
        mallId: mall3.id,
        title: "تخفيضات نهاية الموسم على الملابس",
        description: "خصومات تصل إلى 40% على أصناف مختارة",
        discountPercent: "40.00",
        isActive: true,
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "تم تهيئة قاعدة البيانات بنجاح",
      malls: insertedMalls.length,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "فشل في تهيئة قاعدة البيانات", details: String(error) },
      { status: 500 }
    );
  }
}
