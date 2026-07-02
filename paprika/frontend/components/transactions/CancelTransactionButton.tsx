'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import axios from 'axios';
import api from '@/lib/api';
import type { ApiResponse } from '@/types';
import styles from './CancelTransactionButton.module.css';

interface TransactionSummary {
  id: number;
  postId: number;
  status: string;
}

interface CancelTransactionButtonProps {
  /** 취소할 거래 id (부모 list/map에서 알고 있을 때) */
  transactionId?: number;
  /** 상품 id — prop 또는 /products/:id URL에서 연결 */
  postId?: number;
  /** API 성공 시 부모 list에서 해당 id를 제거하는 핸들러 */
  deleteHandler: (id: number) => void;
  disabled?: boolean;
  className?: string;
  confirmMessage?: string;
}

const IN_PROGRESS = new Set(['PENDING', 'AGREED']);

/**
 * 거래 취소 버튼 (재사용 모듈)
 *
 * 사용 패턴 (부모 list):
 *   <CancelTransactionButton transactionId={item.id} deleteHandler={deleteHandler} />
 *
 * 사용 패턴 (상품 상세 — TradeButton과 같이 postId만 연결):
 *   <CancelTransactionButton postId={2} deleteHandler={deleteHandler} />
 *   <CancelTransactionButton deleteHandler={deleteHandler} />  // /products/2 URL에서 자동
 *
 * 흐름: 클릭 → PATCH CANCELLED → success → deleteHandler(id)
 *       (서버에서 해당 상품 post_status → SELLING 복구)
 */
export default function CancelTransactionButton({
  transactionId: transactionIdProp,
  postId: postIdProp,
  deleteHandler,
  disabled = false,
  className,
  confirmMessage = '거래를 취소하시겠어요?',
}: CancelTransactionButtonProps) {
  const pathname = usePathname();
  const postId = useMemo(() => {
    if (postIdProp != null) {
      return postIdProp;
    }
    const fromUrl = pathname.match(/^\/products\/([^/]+)$/)?.[1];
    return fromUrl ? Number(fromUrl) : null;
  }, [pathname, postIdProp]);

  const [resolvedId, setResolvedId] = useState<number | null>(transactionIdProp ?? null);
  const [resolving, setResolving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (transactionIdProp != null) {
      setResolvedId(transactionIdProp);
      return;
    }

    if (postId == null) {
      setResolvedId(null);
      return;
    }

    let active = true;
    setResolving(true);

    api
      .get<ApiResponse<TransactionSummary[]>>('/api/v1/transactions')
      .then((response) => {
        if (!active) return;
        const mine = (response.data.data ?? []).find(
          (tx) => tx.postId === postId && IN_PROGRESS.has(tx.status),
        );
        setResolvedId(mine?.id ?? null);
      })
      .catch(() => {
        if (active) setResolvedId(null);
      })
      .finally(() => {
        if (active) setResolving(false);
      });

    return () => {
      active = false;
    };
  }, [transactionIdProp, postId]);

  const handleClick = async () => {
    if (resolvedId == null) {
      return;
    }
    if (!confirm(confirmMessage)) {
      return;
    }

    setSubmitting(true);
    try {
      await api.patch(`/api/v1/transactions/${resolvedId}/status`, {
        status: 'CANCELLED',
      });
      deleteHandler(resolvedId);
    } catch (error) {
      const message =
        (axios.isAxiosError(error) && error.response?.data?.message) ||
        '거래 취소에 실패했습니다. 잠시 후 다시 시도해 주세요.';
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (resolvedId == null && !resolving) {
    return null;
  }

  return (
    <button
      type="button"
      className={className ?? styles.button}
      disabled={disabled || submitting || resolving || resolvedId == null}
      onClick={handleClick}
    >
      {submitting ? '취소 중...' : resolving ? '확인 중...' : '거래 취소'}
    </button>
  );
}
