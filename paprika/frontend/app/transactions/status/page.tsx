'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import api from '@/lib/api';
import type { ApiResponse } from '@/types';
import styles from './page.module.css';

type TransactionType = 'DIRECT' | 'DELIVERY';

const TYPE_LABEL: Record<TransactionType, string> = {
  DIRECT: '직거래',
  DELIVERY: '배달',
};

// 백엔드 GET /api/v1/transactions/{id} 응답 (TransactionResponse 일부)
interface TransactionResponse {
  id: number;
  type: TransactionType;
  status: string;
  meetingLocation?: string;
  meetingTime?: string;
}

interface TransactionItem {
  id: number;
  type: TransactionType;
  meetingLocation: string;
  meetingTime: string;
  //구매확정했는지 판매확정했는지
  buyerConfirmed: boolean;
  sellerConfirmed: boolean;
  completed: boolean;
}

function TransactionStatusContent() {
  const [items, setItems] = useState<TransactionItem[]>([]);
  const [loadError, setLoadError] = useState(false);

  // 페이지 진입(재방문 포함) 시 내 진행 중 거래 목록을 DB에서 조회해 표시
  useEffect(() => {
    let active = true;
    api
      .get<ApiResponse<TransactionResponse[]>>('/api/v1/transactions')
      .then((response) => {
        if (!active) return;
        const list = response.data.data ?? [];
        setItems(
          list.map((tx) => ({
            id: tx.id,
            type: tx.type,
            meetingLocation: tx.meetingLocation ?? '',
            meetingTime: tx.meetingTime ? tx.meetingTime.replace('T', ' ') : '',
            buyerConfirmed: false,
            sellerConfirmed: false,
            completed: tx.status === 'COMPLETED',
          })),
        );
      })
      .catch(() => {
        if (active) setLoadError(true);
      });
    return () => {
      active = false;
    };
  }, []);

  // 완료 요청을 거래당 한 번만 보내기 위한 기록 (중복 호출 방지)
  const completeRequested = useRef<Set<number>>(new Set());

  // 구매자·판매자 양쪽이 모두 확정하면 post를 완료 상태로 변경 요청한다.
  useEffect(() => {
    items.forEach((item) => {
      const bothConfirmed = item.buyerConfirmed && item.sellerConfirmed;
      if (bothConfirmed && !completeRequested.current.has(item.id)) {
        completeRequested.current.add(item.id);
        requestComplete(item.id);
      }
    });
  }, [items]);

  // 거래 완료 처리: 백엔드에 완료 요청(POST .../complete) → 응답과 무관하게 UI는 완료로 표시
  const requestComplete = async (id: number) => {
    try {
      await api.post(`/api/v1/transactions/${id}/complete`);
    } catch {
      // 백엔드 미연동 단계에서도 데모가 진행되도록 실패는 무시
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: true } : item)),
    );
  };

  const confirmBuyer = (id: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, buyerConfirmed: true } : item)),
    );
  };

  const confirmSeller = (id: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, sellerConfirmed: true } : item)),
    );
  };

  const handleCancel = async (id: number) => {
    if (!confirm('거래를 취소하시겠어요?')) {
      return;
    }
    //확인을 누른 뒤 실제 거래를 취소(CANCELLED) 처리 요청
    try {
      await api.patch(`/api/v1/transactions/${id}/status`, { status: 'CANCELLED' });
    } catch {
      // 백엔드 오류 시에도 데모 흐름은 계속 진행
    }
    completeRequested.current.delete(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>거래 상태</h1>

        {loadError ? (
          <p className={styles.empty}>거래 정보를 불러오지 못했습니다.</p>
        ) : items.length === 0 ? (
          <p className={styles.empty}>진행 중인 거래가 없습니다.</p>
        ) : (
          <ul className={styles.list}>
            {items.map((item) => (
              <li key={item.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.typeBadge}>{TYPE_LABEL[item.type]}</span>
                  {item.completed && <span className={styles.doneBadge}>거래 완료</span>}
                </div>

                <div className={styles.info}>
                  <div className={styles.meetingRow}>
                    <span className={styles.meetingLabel}>장소</span>
                    <span className={styles.meetingValue}>{item.meetingLocation || '-'}</span>
                  </div>
                  <div className={styles.meetingRow}>
                    <span className={styles.meetingLabel}>날짜·시간</span>
                    <span className={styles.meetingValue}>{item.meetingTime || '-'}</span>
                  </div>
                </div>

                {/* 직거래일 때만 구매/판매 확정 버튼 노출. 둘 다 확정되면 완료 요청 */}
                {item.type === 'DIRECT' && !item.completed && (
                  <div className={styles.confirmRow}>
                    <button
                      type="button"
                      className={item.buyerConfirmed ? styles.confirmDone : styles.confirmButton}
                      disabled={item.buyerConfirmed}
                      onClick={() => confirmBuyer(item.id)}
                    >
                      {item.buyerConfirmed ? '구매확정 완료' : '구매확정'}
                    </button>
                    <button
                      type="button"
                      className={item.sellerConfirmed ? styles.confirmDone : styles.confirmButton}
                      disabled={item.sellerConfirmed}
                      onClick={() => confirmSeller(item.id)}
                    >
                      {item.sellerConfirmed ? '판매확정 완료' : '판매확정'}
                    </button>
                  </div>
                )}

                {!item.completed && (
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={() => handleCancel(item.id)}
                  >
                    거래 취소
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

export default function TransactionStatusPage() {
  return (
    <Suspense fallback={null}>
      <TransactionStatusContent />
    </Suspense>
  );
}
