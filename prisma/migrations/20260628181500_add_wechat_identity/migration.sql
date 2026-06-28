-- Add WeChat Mini Program identity binding.
-- This table keeps WeChat openid separate from the main User account so web
-- accounts and mini program accounts can be bound or separated later.

CREATE TABLE "WechatIdentity" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "appId" TEXT NOT NULL,
  "openid" TEXT NOT NULL,
  "unionid" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "WechatIdentity_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WechatIdentity_appId_openid_key" ON "WechatIdentity"("appId", "openid");
CREATE INDEX "WechatIdentity_userId_idx" ON "WechatIdentity"("userId");
CREATE INDEX "WechatIdentity_unionid_idx" ON "WechatIdentity"("unionid");

ALTER TABLE "WechatIdentity"
  ADD CONSTRAINT "WechatIdentity_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
