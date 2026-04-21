-- 20260421_customer_consultations_extend.sql
-- customer_consultations 테이블을 online_order 구조로 확장
-- 실행 전 기존 레코드는 운영자가 수동 삭제

ALTER TABLE customer_consultations
  ADD COLUMN IF NOT EXISTS device text,
  ADD COLUMN IF NOT EXISTS model text,
  ADD COLUMN IF NOT EXISTS "petName" text,
  ADD COLUMN IF NOT EXISTS capacity text,
  ADD COLUMN IF NOT EXISTS color text,
  ADD COLUMN IF NOT EXISTS register text,
  ADD COLUMN IF NOT EXISTS plan text,
  ADD COLUMN IF NOT EXISTS freebie text,
  ADD COLUMN IF NOT EXISTS installment text,
  ADD COLUMN IF NOT EXISTS installment_principal text,
  ADD COLUMN IF NOT EXISTS discount text,
  ADD COLUMN IF NOT EXISTS benefit text,
  ADD COLUMN IF NOT EXISTS carrier text,
  ADD COLUMN IF NOT EXISTS is_consultation boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS profile_id uuid REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS kakao_friend_rewarded boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS kakao_friend_checked_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_customer_consultations_profile_id
  ON customer_consultations(profile_id);
CREATE INDEX IF NOT EXISTS idx_customer_consultations_phone
  ON customer_consultations(phone);
