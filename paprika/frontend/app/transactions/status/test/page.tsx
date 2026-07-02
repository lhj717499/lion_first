'use client';

import { useCallback, useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import CancelTransactionButton from '@/components/transactions/CancelTransactionButton';
import type { ApiResponse } from '@/types';

interface TransactionItem {
  id: number;
  type: 'DIRECT' | 'DELIVERY';
  status: string;
  meetingLocation?: string;
  meetingTime?: string;
}

const TYPE_LABEL = {
  DIRECT: '직거래',
  DELIVERY: '택배',
} as const;

const IN_PROGRESS = new Set(['PENDING', 'AGREED']);

export default function TransactionCancelTestPage() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<TransactionItem[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [fetching, setFetching] = useState(false);

  const loadTransactions = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }

    setFetching(true);
    setLoadError(false);
    try {
      const response = await api.get<ApiResponse<TransactionItem[]>>('/api/v1/transactions');
      setItems(response.data.data ?? []);
    } catch {
      setLoadError(true);
    } finally {
      setFetching(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) {
      return;
    }
    loadTransactions();
  }, [authLoading, loadTransactions]);

  const deleteHandler = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: '24px 16px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20 }}>내 거래</h1>

      {authLoading || fetching ? (
        <p>거래 정보를 불러오는 중...</p>
      ) : !user ? (
        <p>로그인 후 거래 내역을 확인할 수 있습니다.</p>
      ) : loadError ? (
        <p>거래 정보를 불러오지 못했습니다.</p>
      ) : items.length === 0 ? (
        <p>거래 내역이 없습니다.</p>
      ) : (
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 16, listStyle: 'none', padding: 0, margin: 0 }}>
          {items.map((item) => (
            <li
              key={item.id}
              style={{
                padding: 16,
                borderRadius: 18,
                border: '1px solid var(--color-outline-variant)',
                background: 'var(--color-surface-container)',
              }}
            >
              <div style={{ marginBottom: 12, fontWeight: 700 }}>
                {TYPE_LABEL[item.type]} · {item.status}
              </div>
              <div style={{ fontSize: 14, marginBottom: 8 }}>장소: {item.meetingLocation || '-'}</div>
              <div style={{ fontSize: 14, marginBottom: 12 }}>
                시간: {item.meetingTime ? item.meetingTime.replace('T', ' ') : '-'}
              </div>
              {IN_PROGRESS.has(item.status) && (
                <CancelTransactionButton
                  transactionId={item.id}
                  deleteHandler={deleteHandler}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
