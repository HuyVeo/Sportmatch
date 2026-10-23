/**
 * Thêm người chơi demo của các môn mới vào database đang có — KHÔNG xoá dữ
 * liệu (khác `pnpm db:seed`). Người nào đã có (trùng id hoặc email) thì bỏ qua,
 * nên chạy lại nhiều lần vẫn an toàn.
 *
 *   pnpm db:add-players
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { extraPlayers } from "./extra-players";
import { createSeedUser } from "./seed-users";

const SEED_PASSWORD = "SportMatch123";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("Thiếu DIRECT_URL/DATABASE_URL — xem .env.example.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const sportIds = new Set(
    (await prisma.sport.findMany({ select: { id: true } })).map((s) => s.id),
  );
  const missingSports = [
    ...new Set(
      extraPlayers.flatMap((user) => user.sports.map((s) => s.sportId)),
    ),
  ].filter((id) => !sportIds.has(id));
  if (missingSports.length > 0) {
    throw new Error(
      `Chưa có môn ${missingSports.join(", ")} — chạy "pnpm db:deploy" trước.`,
    );
  }

  const existing = await prisma.user.findMany({
    where: {
      OR: [
        { id: { in: extraPlayers.map((user) => user.id) } },
        { email: { in: extraPlayers.map((user) => user.email) } },
      ],
    },
    select: { id: true, email: true },
  });
  const taken = new Set(existing.flatMap((user) => [user.id, user.email]));
  const toCreate = extraPlayers.filter(
    (user) => !taken.has(user.id) && !taken.has(user.email),
  );

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 12);
  for (const user of toCreate) {
    await createSeedUser(prisma, user, passwordHash);
  }

  console.log(
    `✓ Thêm ${toCreate.length} người chơi, bỏ qua ${extraPlayers.length - toCreate.length} người đã có.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
