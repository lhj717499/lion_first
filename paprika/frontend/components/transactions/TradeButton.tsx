'use client';

import { Suspense, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import TransactionSetup from '@/components/transactions/TransactionSetup';
import styles from './TradeButton.module.css';


interface TradeButtonProps {
  postId?: number;
}

export default function TradeButton({ postId: postIdProp }: TradeButtonProps) {
  const pathname = usePathname();
  const postId = useMemo(() => {
    const fromUrl = pathname.match(/^\/products\/([^/]+)$/)?.[1];
    if (fromUrl) {
      return fromUrl;
    }
    return postIdProp != null ? String(postIdProp) : null;
  }, [pathname, postIdProp]);

  const [open, setOpen] = useState(false);

  return (
    <div className={styles.tradeButton}>
      <button type="button" onClick={() => setOpen(true)}>
        거래하기
      </button>

      {open && postId && (
        <div className={styles.backdrop} onClick={() => setOpen(false)} role="presentation">
          <div
            className={styles.dialog}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="거래 방식 선택"
          >
            <button type="button" className={styles.closeButton} onClick={() => setOpen(false)}>
              닫기
            </button>
            <Suspense fallback={<p className={styles.loading}>거래 정보를 불러오는 중...</p>}>
              <TransactionSetup postId={postId} title={null} />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
}
