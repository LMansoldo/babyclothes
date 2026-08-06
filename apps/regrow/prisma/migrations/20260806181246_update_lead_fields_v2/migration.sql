-- Concierge pivot: telefone becomes optional, interesse is replaced by
-- cidade + fase (both nullable at the DB level so existing rows stay
-- valid; the application layer enforces them as required on new submits).
ALTER TABLE "Lead" ALTER COLUMN "telefone" DROP NOT NULL;
ALTER TABLE "Lead" DROP COLUMN "interesse";
ALTER TABLE "Lead" ADD COLUMN "cidade" TEXT;
ALTER TABLE "Lead" ADD COLUMN "fase" TEXT;
