import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Admin user
  const hash = await bcrypt.hash("Admin123!", 12);
  await prisma.user.upsert({
    where: { email: "admin@krzme.ru" },
    update: {},
    create: { email: "admin@krzme.ru", name: "Администратор", passwordHash: hash, role: "ADMIN" },
  });

  // Delete old categories that are no longer needed
  await prisma.category.deleteMany({
    where: { slug: { in: ["decor", "textile", "kitchen", "bathroom", "storage", "lighting"] } },
  });

  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "bannye-chany" },
      update: { name: "Банные чаны", sortOrder: 1 },
      create: { name: "Банные чаны", slug: "bannye-chany", image: "🛁", sortOrder: 1, description: "Купели, чаны и купальные бочки для бани и сауны" },
    }),
    prisma.category.upsert({
      where: { slug: "akva-blast" },
      update: { name: "Аква бласт", sortOrder: 2 },
      create: { name: "Аква бласт", slug: "akva-blast", image: "💧", sortOrder: 2, description: "Оборудование и аксессуары Аква бласт" },
    }),
    prisma.category.upsert({
      where: { slug: "tovary-dlya-doma" },
      update: { name: "Товары для дома", sortOrder: 3 },
      create: { name: "Товары для дома", slug: "tovary-dlya-doma", image: "🏠", sortOrder: 3, description: "Разделочные доски, подносы, подставки и аксессуары" },
    }),
  ]);

  const [catChany, catAkva, catDom] = categories;

  // Remove old demo products
  await prisma.product.deleteMany({
    where: { slug: { in: [
      "aromaticheskaya-svecha-lavanda", "postelnoe-bele-oblako",
      "nabor-kukhonnykh-polotentse", "organayzer-dlya-vannoy",
      "dekorativnaya-korzina", "nastolnaya-lampa-luna",
      "podushka-dekorativnaya-uyut", "pled-skandinaviya",
    ]}},
  });

  // Placeholder products — замените на свои товары через админку
  const products = [
    { name: "Банный чан 1200 л", slug: "bannyy-chan-1200", price: 85000, stock: 5, isFeatured: true, isNew: true, categoryId: catChany.id, images: [], shortDesc: "Чан из нержавеющей стали, объём 1200 л, диаметр 180 см" },
    { name: "Банный чан 800 л", slug: "bannyy-chan-800", price: 62000, comparePrice: 70000, stock: 8, isFeatured: true, categoryId: catChany.id, images: [], shortDesc: "Чан из нержавеющей стали, объём 800 л, диаметр 150 см" },
    { name: "Аква бласт Стандарт", slug: "akva-blast-standart", price: 24000, stock: 15, isFeatured: true, isNew: true, categoryId: catAkva.id, images: [], shortDesc: "Стандартный комплект Аква бласт" },
    { name: "Аква бласт Про", slug: "akva-blast-pro", price: 38000, comparePrice: 45000, stock: 10, isFeatured: true, categoryId: catAkva.id, images: [], shortDesc: "Профессиональный комплект Аква бласт" },
    { name: "Разделочная доска из нержавейки", slug: "razdelochnaya-doska-nerzh", price: 3500, stock: 50, isFeatured: true, isNew: true, categoryId: catDom.id, images: [], shortDesc: "Разделочная доска из нержавеющей стали, 40×30 см" },
    { name: "Поднос металлический", slug: "podnos-metallicheskiy", price: 2200, comparePrice: 2800, stock: 30, isFeatured: true, categoryId: catDom.id, images: [], shortDesc: "Поднос из нержавеющей стали, 50×35 см" },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...p, isVisible: true, description: p.shortDesc },
    });
  }

  // Site settings
  await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: {},
    create: {
      id: "main",
      heroTitle: "KRZME HOME",
      heroSubtitle: "Создайте уют в вашем доме",
      phone: "+7 (800) 000-00-00",
      email: "info@krzme.ru",
      deliveryInfo: "Доставка по всей России. Срок 1-7 дней. Бесплатно при заказе от 3000 ₽.",
      returnInfo: "Возврат в течение 30 дней без объяснения причин.",
    },
  });

  console.log("✅ Seed completed!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
