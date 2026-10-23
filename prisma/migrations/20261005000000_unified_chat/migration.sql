-- Gộp mọi loại chat (riêng 1-1, nhóm trận, nhóm CLB) vào ChatConversation.
CREATE TYPE "ConversationType" AS ENUM ('DIRECT', 'MATCH', 'CLUB');

ALTER TABLE "ChatConversation"
  ADD COLUMN "type" "ConversationType" NOT NULL DEFAULT 'MATCH',
  ADD COLUMN "clubId" TEXT,
  ADD COLUMN "directKey" TEXT,
  ALTER COLUMN "matchId" DROP NOT NULL;

CREATE UNIQUE INDEX "ChatConversation_clubId_key" ON "ChatConversation"("clubId");
CREATE UNIQUE INDEX "ChatConversation_directKey_key" ON "ChatConversation"("directKey");

ALTER TABLE "ChatConversation" ADD CONSTRAINT "ChatConversation_clubId_fkey"
  FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ChatConversation" ADD CONSTRAINT "ChatConversation_target_check" CHECK (
  ("type" = 'MATCH'  AND "matchId" IS NOT NULL AND "clubId" IS NULL AND "directKey" IS NULL) OR
  ("type" = 'CLUB'   AND "clubId" IS NOT NULL AND "matchId" IS NULL AND "directKey" IS NULL) OR
  ("type" = 'DIRECT' AND "directKey" IS NOT NULL AND "matchId" IS NULL AND "clubId" IS NULL)
);

-- CLB đã có trước migration này: tạo nhóm chat gồm chủ CLB + thành viên đã duyệt.
INSERT INTO "ChatConversation" ("id", "type", "clubId")
SELECT 'clubchat_' || c."id", 'CLUB', c."id" FROM "Club" c;

INSERT INTO "ConversationMember" ("conversationId", "userId")
SELECT 'clubchat_' || c."id", c."ownerId" FROM "Club" c WHERE c."ownerId" IS NOT NULL
UNION
SELECT 'clubchat_' || m."clubId", m."userId" FROM "ClubMembership" m WHERE m."status" = 'APPROVED';

-- Bảng chat CLB riêng (tạo ở 20260930000000) không còn dùng — tin nhắn CLB nằm trong ChatMessage.
DROP TABLE IF EXISTS public.messages;
