import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "Thiếu biến môi trường DATABASE_URL — xem hướng dẫn trong .env.example.",
    );
  }

  // Runtime dùng connection pooler của Supabase (port 6543);
  // migrate/seed dùng DIRECT_URL (xem prisma7.config.ts).
  return new PrismaClient({
    adapter: new PrismaPg({
      connectionString,
      // Database ở xa (Supabase ap-southeast-2): mở kết nối mới tốn cả giây vì
      // bắt tay TLS. Giữ kết nối rảnh lâu hơn mặc định 10s của `pg` để các
      // request sau dùng lại được, và cho phép chờ kết nối lâu hơn.
      idleTimeoutMillis: 5 * 60_000,
      connectionTimeoutMillis: 15_000,
      keepAlive: true,
    }),
    // Mặc định Prisma chỉ chờ 2s để lấy kết nối cho transaction — không đủ
    // khi phải mở kết nối mới tới database ở xa ("Unable to start a
    // transaction in the given time" lúc hoàn tất onboarding).
    transactionOptions: { maxWait: 15_000, timeout: 20_000 },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

function getClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createClient();
  }
  return globalForPrisma.prisma;
}

/**
 * Khởi tạo lười: client chỉ được tạo ở lần truy cập đầu tiên, để `next build`
 * không nổ khi prerender các trang tĩnh không đụng tới database.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    return Reflect.get(getClient(), property, receiver);
  },
});
