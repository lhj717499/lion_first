/**
 * 마이페이지
 * 담당: E - 장인호
 *
 * TODO:
 *  - 매너 온도 시각화 (온도계 그래픽)
 *  - 관심 상품(찜) 목록
 *  - 받은 리뷰 목록
 *  - 로그아웃 버튼 (A - 민동현과 연동)
 */

'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

type OrderTab = 'all' | 'buy' | 'sell' | 'selling';

interface Transaction {
  id: number;
  postId: number;
  type: string;
  status: string;
  myRole: string;
  itemPrice: number;
  amount: number;
  createdAt: string;
  imgUrl: string;
}

const orderTabs: { key: OrderTab; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'buy', label: '구매내역' },
  { key: 'sell', label: '판매내역' },
  { key: 'selling', label: '판매중' },
];

const orderEmptyMessages: Record<OrderTab, string> = {
  all: '거래 내역이 없습니다.',
  buy: '구매한 내역이 없습니다.',
  sell: '판매한 내역이 없습니다.',
  selling: '판매중인 상품이 없습니다.',
};

const statusLabels: Record<string, string> = {
  PENDING: '거래 요청',
  AGREED: '거래 확정',
  COMPLETED: '거래 완료',
  CANCELLED: '거래 취소',
};

export default function MyPage() {
  const [activeOrderTab, setActiveOrderTab] = useState<OrderTab>('all');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    api.get('/api/v1/users/me')
      .then((res) => {
        const data = res.data;
        setNickname(data.nickname ?? '');
        setEmail(data.email ?? '');
        setProfileImageUrl(data.profileImageUrl ?? null);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    api.get(`/api/v1/users/me/transactions?tab=${activeOrderTab}`)
      .then((res) => setTransactions(res.data.data))
      .catch(() => setTransactions([]));
  }, [activeOrderTab]);

  return (
    <section style={{ display: 'grid', gap: 24 }}>

      {/* 프로필 요약 */}
      <div style={{ background: 'var(--color-surface-container-lowest)', borderRadius: 24, padding: 24, boxShadow: 'var(--shadow-card)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h1 style={{ marginBottom: 16 }}>내 프로필</h1>
          <Link href="/mypage/profile" style={{ fontSize: 14, color: 'var(--color-secondary)', textDecoration: 'none' }}>회원정보 수정 &gt;</Link>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {profileImageUrl ? (
            <img src={profileImageUrl} alt="프로필" style={{ width: 88, height: 88, borderRadius: 24, objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 88, height: 88, borderRadius: 24, background: 'var(--color-surface)' }} />
          )}
          <div>
            <p style={{ fontSize: 20, fontWeight: 700 }}>{nickname}</p>
            <p style={{ color: 'var(--color-on-surface-variant)', marginTop: 4 }}>이메일: {email}</p>
            <p style={{ color: 'var(--color-secondary)', marginTop: 8 }}>매너 온도 36.5°C</p>
          </div>
        </div>
      </div>

      {/* 거래 내역 */}
      <div style={{ background: 'var(--color-surface-container-lowest)', borderRadius: 24, padding: 24, boxShadow: 'var(--shadow-card)' }}>
        <h2 style={{ marginBottom: 16 }}>거래 내역</h2>
        <div style={{ display: 'flex', borderBottom: '1px solid #e0e0e0', marginBottom: 24 }}>
          {orderTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveOrderTab(tab.key)}
              style={{
                padding: '8px 20px',
                background: 'none',
                border: 'none',
                borderBottom: activeOrderTab === tab.key ? '2px solid #222' : '2px solid transparent',
                fontWeight: activeOrderTab === tab.key ? 700 : 400,
                color: activeOrderTab === tab.key ? '#222' : '#888',
                cursor: 'pointer',
                fontSize: 14,
                marginBottom: -1,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-on-surface-variant)' }}>
            {orderEmptyMessages[activeOrderTab]}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto' }}>
            {transactions.map((t) => (
              <div key={t.id} style={{ display: 'flex', flexDirection: 'column', borderRadius: 12, background: 'var(--color-surface)', overflow: 'hidden', minWidth: 140, width: 140, flexShrink: 0 }}>
                <img src={t.imgUrl} alt="상품" style={{ width: 140, height: 140, objectFit: 'cover' }} />
                <div style={{ padding: '8px 10px' }}>
                  <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>상품 #{t.postId}</p>
                  <p style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', marginBottom: 4 }}>
                    {t.type === 'DIRECT' ? '직거래' : '택배'} · {t.myRole === 'BUYER' ? '구매' : '판매'}
                  </p>
                  <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{t.amount.toLocaleString()}원</p>
                  <p style={{ fontSize: 12, color: 'var(--color-secondary)' }}>{statusLabels[t.status]}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 관심 상품 */}
      <div style={{ background: 'var(--color-surface-container-lowest)', borderRadius: 24, padding: 24, boxShadow: 'var(--shadow-card)' }}>
        <h2 style={{ marginBottom: 16 }}>관심 상품</h2>
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-on-surface-variant)' }}>
          찜한 상품이 없습니다.
        </div>
      </div>

    </section>
  );
}