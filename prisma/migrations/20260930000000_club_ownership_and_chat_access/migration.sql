-- Persist club ownership and membership approval state.
DO $$
BEGIN
  CREATE TYPE "ClubMembershipStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

CREATE TABLE IF NOT EXISTS "Club" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT,
    "name" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "sportType" TEXT NOT NULL,
    "logo" TEXT NOT NULL DEFAULT '🏸',
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 4.8,
    "description" TEXT NOT NULL DEFAULT '',
    "memberCount" INTEGER NOT NULL DEFAULT 1,
    "capacity" INTEGER NOT NULL DEFAULT 20,
    "fee" INTEGER NOT NULL DEFAULT 0,
    "schedule" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "time" TEXT NOT NULL DEFAULT '19:00–21:00',
    "level" TEXT NOT NULL DEFAULT 'Người mới',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Club_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ClubMembership" (
    "clubId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "ClubMembershipStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    CONSTRAINT "ClubMembership_pkey" PRIMARY KEY ("clubId", "userId")
);

CREATE INDEX IF NOT EXISTS "Club_ownerId_idx" ON "Club"("ownerId");
CREATE INDEX IF NOT EXISTS "Club_sportType_idx" ON "Club"("sportType");
CREATE INDEX IF NOT EXISTS "Club_area_idx" ON "Club"("area");
CREATE INDEX IF NOT EXISTS "ClubMembership_userId_status_idx" ON "ClubMembership"("userId", "status");
CREATE INDEX IF NOT EXISTS "ClubMembership_clubId_status_idx" ON "ClubMembership"("clubId", "status");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Club_ownerId_fkey' AND conrelid = 'public."Club"'::regclass) THEN
    ALTER TABLE "Club" ADD CONSTRAINT "Club_ownerId_fkey"
      FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ClubMembership_clubId_fkey' AND conrelid = 'public."ClubMembership"'::regclass) THEN
    ALTER TABLE "ClubMembership" ADD CONSTRAINT "ClubMembership_clubId_fkey"
      FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ClubMembership_userId_fkey' AND conrelid = 'public."ClubMembership"'::regclass) THEN
    ALTER TABLE "ClubMembership" ADD CONSTRAINT "ClubMembership_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

-- Existing messages may have no club or authenticated sender. Keep them in storage,
-- but RLS below only exposes new, scoped messages.
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid(),
  sender_id TEXT,
  recipient_id TEXT,
  sender_name TEXT,
  content TEXT,
  room_type TEXT,
  club_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS club_id TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS sender_id TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS recipient_id TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS sender_name TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS room_type TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();
CREATE UNIQUE INDEX IF NOT EXISTS messages_id_key ON public.messages(id);
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.messages'::regclass AND contype = 'p'
  ) THEN
    ALTER TABLE public.messages ADD CONSTRAINT messages_pkey PRIMARY KEY (id);
  END IF;
END
$$;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE existing_policy RECORD;
BEGIN
  FOR existing_policy IN
    SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'messages'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.messages', existing_policy.policyname);
  END LOOP;
END
$$;

ALTER TABLE public."Club" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ClubMembership" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clubs_are_readable_by_authenticated_users"
  ON public."Club" FOR SELECT TO authenticated USING (true);
CREATE POLICY "memberships_visible_to_member_or_owner"
  ON public."ClubMembership" FOR SELECT TO authenticated
  USING (
    "userId" = (auth.jwt() ->> 'sub')
    OR EXISTS (
      SELECT 1 FROM public."Club" c
      WHERE c.id = "ClubMembership"."clubId"
        AND c."ownerId" = (auth.jwt() ->> 'sub')
    )
  );

CREATE POLICY "club_messages_read_by_room_members"
  ON public.messages FOR SELECT TO authenticated
  USING (
    sender_id IS NOT NULL
    AND club_id IS NOT NULL
    AND (
      (
        room_type = 'admin_1on1'
        AND (sender_id = (auth.jwt() ->> 'sub') OR recipient_id = (auth.jwt() ->> 'sub'))
        AND EXISTS (
          SELECT 1 FROM public."Club" c
          WHERE c.id = messages.club_id
            AND (
              (sender_id <> c."ownerId" AND recipient_id = c."ownerId")
              OR (sender_id = c."ownerId" AND recipient_id <> c."ownerId")
            )
        )
      )
      OR (
        room_type = 'club_group'
        AND recipient_id IS NULL
        AND (
          EXISTS (
            SELECT 1 FROM public."Club" c
            WHERE c.id = messages.club_id
              AND c."ownerId" = (auth.jwt() ->> 'sub')
          )
          OR EXISTS (
            SELECT 1 FROM public."ClubMembership" m
            WHERE m."clubId" = messages.club_id
              AND m."userId" = (auth.jwt() ->> 'sub')
              AND m.status = 'APPROVED'
          )
        )
      )
    )
  );

CREATE POLICY "club_messages_insert_by_authorized_sender"
  ON public.messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = (auth.jwt() ->> 'sub')
    AND sender_name = (auth.jwt() ->> 'name')
    AND club_id IS NOT NULL
    AND (
      (
        room_type = 'admin_1on1'
        AND recipient_id IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM public."Club" c
          WHERE c.id = messages.club_id
            AND (
              (sender_id <> c."ownerId" AND recipient_id = c."ownerId")
              OR (sender_id = c."ownerId" AND recipient_id <> c."ownerId")
            )
        )
      )
      OR (
        room_type = 'club_group'
        AND recipient_id IS NULL
        AND (
          EXISTS (
            SELECT 1 FROM public."Club" c
            WHERE c.id = messages.club_id
              AND c."ownerId" = (auth.jwt() ->> 'sub')
          )
          OR EXISTS (
            SELECT 1 FROM public."ClubMembership" m
            WHERE m."clubId" = messages.club_id
              AND m."userId" = (auth.jwt() ->> 'sub')
              AND m.status = 'APPROVED'
          )
        )
      )
    )
  );

GRANT SELECT ON public."Club", public."ClubMembership" TO authenticated;
GRANT SELECT, INSERT ON public.messages TO authenticated;
REVOKE ALL ON public."Club", public."ClubMembership", public.messages FROM PUBLIC, anon;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
    AND NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'messages'
    ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END
$$;
