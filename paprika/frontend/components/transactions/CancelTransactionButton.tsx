'use client';

import { useState } from 'react';
import axios from 'axios';
import api from '@/lib/api';
import styles from './CancelTransactionButton.module.css';

interface CancelTransactionButtonProps {
  /** 취소할 거래 id (부모가 filter/map으로 넘김) */
  transactionId: number;
  /** API 성공 시 부모 list에서 해당 id를 제거하는 핸들러 */
  deleteHandler: (id: number) => void;
  disabled?: boolean;
  className?: string;
  confirmMessage?: string;
}

/**
 * 거래 취소 버튼 (재사용 모듈)
 *
 * 사용 패턴 (부모):
 *   const [list, setList] = useState<Transaction[]>([]);
 *   const deleteHandler = (id: number) => {
 *     setList((prev) => prev.filter((item) => item.id !== id));
 *   };
 *   list.map((item) => (
 *     <CancelTransactionButton transactionId={item.id} deleteHandler={deleteHandler} />
 *   ))
 *
 * 흐름: 클릭 → PATCH CANCELLED → success → deleteHandler(transactionId)
 *       (서버에서 해당 상품 post_status → SELLING 복구)
 */
export default function CancelTransactionButton({
  transactionId,
  deleteHandler,
  disabled = false,
  className,
  confirmMessage = '거래를 취소하시겠어요?',
}: CancelTransactionButtonProps) {
  const [submitting, setSubmitting] = useState(false);

  const handleClick = async () => {
    if (!confirm(confirmMessage)) {
      return;
    }

    setSubmitting(true);
    try {
      await api.patch(`/api/v1/transactions/${transactionId}/status`, {
        status: 'CANCELLED',
      });
      deleteHandler(transactionId);
    } catch (error) {
      const message =
        (axios.isAxiosError(error) && error.response?.data?.message) ||
        '거래 취소에 실패했습니다. 잠시 후 다시 시도해 주세요.';
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <button
      type="button"
      className={className ?? styles.button}
      disabled={disabled || submitting}
      onClick={handleClick}
    >
      {submitting ? '취소 중...' : '거래 취소'}
    </button>
  );
}
