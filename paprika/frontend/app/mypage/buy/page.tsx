'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { MyPageTransaction } from '@/types';
import sharedStyles from '../page.module.css';
import styles from './page.module.css';

const statusLabels: Record<string, string> = {
  PENDING: '거래 요청',
  AGREED: '거래 확정',
  COMPLETED: '거래 완료',
  CANCELLED: '거래 취소',
};

export default function BuyOrdersPage() {
  const [transactions, setTransactions] = useState<MyPageTransaction[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');

  useEffect(() => {
    api.get('/api/v1/users/me/transactions?tab=buy')
      .then((res) => setTransactions(res.data.data))
      .catch(() => setTransactions([]));
  }, []);

  const handleSubmit = async () => {
    if (!selectedId) return;
    try {
      await api.post('/api/v1/reviews', { transactionId: selectedId, rating, content });
      alert('리뷰가 작성되었습니다!');
      setSelectedId(null);
      setRating(5);
      setContent('');
    } catch {
      alert('리뷰 작성 실패');
    }
  };

  return (
    <section>
      <h1 className={sharedStyles.title}>구매내역</h1>

      {transactions.length === 0 ? (
        <div className={sharedStyles.empty}>구매한 내역이 없습니다.</div>
      ) : (
        <div className={sharedStyles.list}>
          {transactions.map((t) => (
            <div key={t.id} className={sharedStyles.card}>
              <img src={t.imgUrl} alt="상품" className={sharedStyles.cardImg} />
              <div className={sharedStyles.cardInfo}>
                <p className={sharedStyles.cardTitle}>상품 #{t.postId}</p>
                <p className={sharedStyles.cardType}>{t.type === 'DIRECT' ? '직거래' : '택배'}</p>
              </div>
              <div className={sharedStyles.cardRight}>
                <p className={sharedStyles.cardPrice}>{t.amount.toLocaleString()}원</p>
                <p className={sharedStyles.cardStatus}>{statusLabels[t.status]}</p>
                {t.status === 'COMPLETED' && (
                  <button className={styles.reviewBtn} onClick={() => setSelectedId(t.id)}>
                    리뷰 작성
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedId && (
        <div className={styles.modal} onClick={() => setSelectedId(null)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <p className={styles.modalTitle}>리뷰 작성</p>
            <div className={styles.starRow}>
              {[1,2,3,4,5].map((s) => (
                <span key={s} onClick={() => setRating(s)}
                  className={s <= rating ? styles.starFilled : styles.starEmpty}>
                  ★
                </span>
              ))}
            </div>
            <textarea
              className={styles.textarea}
              placeholder="거래 후기를 작성해주세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className={styles.modalBtns}>
              <button className={styles.cancelBtn} onClick={() => setSelectedId(null)}>취소</button>
              <button className={styles.submitBtn} onClick={handleSubmit}>제출</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}