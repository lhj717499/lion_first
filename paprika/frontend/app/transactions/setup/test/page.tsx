'use client';

import { useState } from 'react';
import TradeButton from '@/components/transactions/TradeButton';

// TradeButton 모듈 테스트 (URL: /transactions/setup/test)
export default function TradeButtonTestPage() {
  const [postIdInput, setPostIdInput] = useState('1');
  const postId = Number(postIdInput);

  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>상품 번호 (postId)</span>
        <input
          type="number"
          min={1}
          value={postIdInput}
          onChange={(event) => setPostIdInput(event.target.value)}
          placeholder="예: 1"
          style={{
            padding: '12px 16px',
            borderRadius: 12,
            border: '1px solid var(--color-outline-variant)',
            fontSize: 16,
          }}
        />
      </label>

      {Number.isFinite(postId) && postId > 0 ? (
        <TradeButton postId={postId} />
      ) : (
        <p style={{ margin: 0, color: 'var(--color-on-surface-variant)', fontSize: 14 }}>
          올바른 상품 번호를 입력해 주세요.
        </p>
      )}
    </main>
  );
}
