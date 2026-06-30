'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import type { ApiResponse, PostInfo } from '@/types';
import styles from './page.module.css';

type PaymentMethod = 'CASH' | 'CARD';
type TransactionType = 'DIRECT' | 'DELIVERY';

function TransactionContent() {
  const searchParams = useSearchParams();
  const postId = searchParams.get('postId');

  const [postInfo, setPostInfo] = useState<PostInfo | null>(null);
  const [postError, setPostError] = useState(false);

  const [payment, setPayment] = useState<PaymentMethod | null>(null);
  const [transactionType, setTransactionType] = useState<TransactionType | null>(null);

  const router = useRouter();

  // 거래하기로 넘어온 postId로 상품명·가격을 조회해 표시 (현재 백엔드는 더미 데이터 반환)
  useEffect(() => {
    if (!postId) {
      return;
    }
    //백앤드에 상품 정보를 요청하고 응답이 오면 그데이터를 상태에 저장
    //비동기 요청 결과가 아직 유효한지 
    let active = true;
    api
      .get<ApiResponse<PostInfo>>(`/api/v1/transactions/post-info/${postId}`)
      .then((response) => {
        if (active) {
          setPostInfo(response.data.data);
        }
      })
      .catch(() => {
        if (active) {
          setPostError(true);
        }
      });
      //응답이 와도 결과를 무시
    return () => {
      active = false;
    };
  }, [postId]);

  // 결제수단(현금/카드)은 택배거래(DELIVERY)에서만 선택 가능. 직거래(DIRECT)면 잠금.
  const isDirect = transactionType === 'DIRECT';

  const selectDirect = () => {
    setTransactionType('DIRECT');
    setPayment(null); // 직거래는 결제수단 불필요 → 선택값 초기화
  };

  const handleComplete = () => {
    // 직거래는 약속(장소/시간) 페이지로 이동, 그 외는 완료 알림
    if (isDirect) {
      // 약속 확정 시 거래 생성/확정에 필요한 postId·가격을 함께 전달
      const params = new URLSearchParams();
      if (postId) params.set('postId', postId);
      if (postInfo) params.set('price', String(postInfo.price));
      router.push(`/transactions/direct?${params.toString()}`);
      return;
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        {postInfo && (
          <div className={styles.productSummary}>
            <div className={styles.productInfo}>
              <span className={styles.productTitle}>{postInfo.title}</span>
              <span className={styles.productSeller}>판매자 ID: {postInfo.sellerId}</span>
            </div>
            <span className={styles.productPrice}>
              {postInfo.price.toLocaleString()}원
            </span>
          </div>
        )}
        {postError && (
          <p className={styles.productError}>상품 정보를 불러오지 못했습니다.</p>
        )}

        <div className={styles.buttonRow}>
          <button
            type="button"
            className={payment === 'CASH' ? styles.optionActive : styles.optionButton}
            disabled={isDirect}
            onClick={() => setPayment('CASH')}
          >
            현금결제
          </button>
          <button
            type="button"
            className={payment === 'CARD' ? styles.optionActive : styles.optionButton}
            disabled={isDirect}
            onClick={() => setPayment('CARD')}
          >
            카드결제
          </button>
        </div>

        <div className={styles.buttonRow}>
          <button
            type="button"
            className={transactionType === 'DIRECT' ? styles.optionActive : styles.optionButton}
            onClick={selectDirect}
          >
            직거래
          </button>
          <button
            type="button"
            className={transactionType === 'DELIVERY' ? styles.optionActive : styles.optionButton}
            onClick={() => setTransactionType('DELIVERY')}
          >
            택배거래
          </button>
        </div>

        <button
          type="button"
          className={styles.completeButton}
          onClick={handleComplete}
        >
          완료
        </button>
      </div>
    </main>
  );
}

export default function TransactionPage() {
  return (
    <Suspense fallback={null}>
      <TransactionContent />
    </Suspense>
  );
}
