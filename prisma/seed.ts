import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  // Seed carriers
  await prisma.carrier.upsert({ where: { id: "TMOBILE" }, update: {}, create: { id: "TMOBILE", name: "T-Mobile", slug: "t-mobile", description: "Nationwide 5G network", color: "#E20074", logo: "/carriers/tmobile.svg", coverage: "99%", network: "5G/4G LTE" } });
  await prisma.carrier.upsert({ where: { id: "VERIZON" }, update: {}, create: { id: "VERIZON", name: "Verizon", slug: "verizon", description: "Most reliable network", color: "#CD040B", logo: "/carriers/verizon.svg", coverage: "99%", network: "5G UW/4G LTE" } });
  await prisma.carrier.upsert({ where: { id: "ATT" }, update: {}, create: { id: "ATT", name: "AT&T", slug: "att", description: "FirstNet & 5G+", color: "#00A8E0", logo: "/carriers/att.svg", coverage: "97%", network: "5G+/4G LTE" } });
  await prisma.carrier.upsert({ where: { id: "MVNO" }, update: {}, create: { id: "MVNO", name: "Mint Mobile", slug: "t-mobile-mvno", description: "Best value MVNO", color: "#9B59B6", logo: "/carriers/mint.svg", coverage: "99%", network: "5G/4G LTE" } });

  // Seed plans
  const plans = [
    { name: "T-Mobile 5GB", carrierId: "TMOBILE", tier: "STARTER", interval: "MONTHLY", price: 9.99, data: "5 GB", fiveG: true, sortOrder: 1 },
    { name: "T-Mobile 15GB", carrierId: "TMOBILE", tier: "STANDARD", interval: "MONTHLY", price: 19.99, data: "15 GB", fiveG: true, sortOrder: 2 },
    { name: "T-Mobile Unlimited", carrierId: "TMOBILE", tier: "UNLIMITED", interval: "MONTHLY", price: 29.99, originalPrice: 39.99, data: "Unlimited", fiveG: true, hotspot: true, badge: "Popular", sortOrder: 3 },
    { name: "Verizon 25GB", carrierId: "VERIZON", tier: "STANDARD", interval: "MONTHLY", price: 24.99, data: "25 GB", fiveG: true, sortOrder: 4 },
    { name: "Verizon 50GB", carrierId: "VERIZON", tier: "PREMIUM", interval: "MONTHLY", price: 39.99, data: "50 GB", fiveG: true, hotspot: true, badge: "Best Value", sortOrder: 5 },
    { name: "Verizon 100GB", carrierId: "VERIZON", tier: "PREMIUM", interval: "MONTHLY", price: 59.99, originalPrice: 79.99, data: "100 GB", fiveG: true, hotspot: true, sortOrder: 6 },
    { name: "AT&T 10GB", carrierId: "ATT", tier: "STARTER", interval: "MONTHLY", price: 14.99, data: "10 GB", fiveG: true, sortOrder: 7 },
    { name: "AT&T 30GB", carrierId: "ATT", tier: "STANDARD", interval: "MONTHLY", price: 24.99, data: "30 GB", fiveG: true, sortOrder: 8 },
    { name: "AT&T Unlimited", carrierId: "ATT", tier: "UNLIMITED", interval: "MONTHLY", price: 34.99, data: "Unlimited", fiveG: true, hotspot: true, sortOrder: 9 },
    { name: "Mint 10GB", carrierId: "MVNO", tier: "STARTER", interval: "MONTHLY", price: 14.99, data: "10 GB", fiveG: true, sortOrder: 10 },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { stripePriceId: `seed_${plan.name.toLowerCase().replace(/\s+/g, "_")}` },
      update: {},
      create: {
        ...plan,
        tier: plan.tier as "STARTER" | "STANDARD" | "PREMIUM" | "UNLIMITED",
        interval: plan.interval as "MONTHLY" | "QUARTERLY" | "YEARLY",
        originalPrice: (plan as { originalPrice?: number }).originalPrice ?? null,
        badge: (plan as { badge?: string }).badge ?? null,
        hotspot: (plan as { hotspot?: boolean }).hotspot ?? false,
        calls: "Unlimited",
        sms: "Unlimited",
        features: [],
        stripePriceId: `seed_${plan.name.toLowerCase().replace(/\s+/g, "_")}`,
      },
    });
  }

  console.log("✅ Database seeded successfully");
}

main().catch(console.error).finally(() => prisma.$disconnect());
