-- AlterTable
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'Resume' AND column_name = 'text'
  ) THEN
    ALTER TABLE "Resume" ADD COLUMN "text" TEXT NOT NULL DEFAULT '';
  END IF;
END $$;
