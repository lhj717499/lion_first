-- transactions 테이블 스키마 보정
-- PostgreSQL / CockroachDB
--
-- 앱 기동 시 RunTransactionMigration 이 idempotent 하게 실행한다.
-- 수동 실행 시 아래 SQL을 순서대로 적용한다.

ALTER TABLE transactions RENAME COLUMN product_id TO post_id;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) NULL;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS amount DECIMAL(12,2);
UPDATE transactions SET amount = item_price + COALESCE(fee, 0) WHERE amount IS NULL;
ALTER TABLE transactions ALTER COLUMN amount SET NOT NULL;

COMMENT ON COLUMN transactions.payment_method IS 'CASH, CARD / 직거래(DIRECT)는 NULL';
COMMENT ON COLUMN transactions.amount IS '최종 결제 금액 (item_price + fee)';
