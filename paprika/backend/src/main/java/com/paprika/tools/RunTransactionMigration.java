package com.paprika.tools;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * transactions 테이블 스키마 마이그레이션 (JPA EntityManager)
 *
 * 앱 기동 시 idempotent하게 실행된다.
 * - product_id -> post_id 컬럼명 변경
 * - payment_method, amount 컬럼 추가
 */
@Slf4j
@Component
public class RunTransactionMigration implements ApplicationRunner {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (hasColumn("transactions", "product_id") && !hasColumn("transactions", "post_id")) {
            entityManager.createNativeQuery(
                    "ALTER TABLE transactions RENAME COLUMN product_id TO post_id"
            ).executeUpdate();
            log.info("Renamed transactions.product_id -> post_id");
        } else {
            log.info("Skip rename: product_id 없거나 post_id 이미 존재");
        }

        if (!hasColumn("transactions", "payment_method")) {
            entityManager.createNativeQuery(
                    "ALTER TABLE transactions ADD COLUMN payment_method VARCHAR(20) NULL"
            ).executeUpdate();
            log.info("Added transactions.payment_method column");
        } else {
            log.info("Skip add: payment_method 이미 존재");
        }

        if (!hasColumn("transactions", "amount")) {
            entityManager.createNativeQuery(
                    "ALTER TABLE transactions ADD COLUMN amount DECIMAL(12,2)"
            ).executeUpdate();
            entityManager.createNativeQuery(
                    "UPDATE transactions SET amount = item_price + COALESCE(fee, 0) WHERE amount IS NULL"
            ).executeUpdate();
            entityManager.createNativeQuery(
                    "ALTER TABLE transactions ALTER COLUMN amount SET NOT NULL"
            ).executeUpdate();
            log.info("Added transactions.amount column");
        } else {
            log.info("Skip add: amount 이미 존재");
        }

        log.info("Transaction schema migration completed.");
    }

    private boolean hasColumn(String tableName, String columnName) {
        Number count = (Number) entityManager.createNativeQuery("""
                SELECT COUNT(*)
                FROM information_schema.columns
                WHERE table_name = :tableName
                  AND column_name = :columnName
                """)
                .setParameter("tableName", tableName)
                .setParameter("columnName", columnName)
                .getSingleResult();
        return count.longValue() > 0;
    }
}
