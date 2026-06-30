import Link from 'next/link';

const linkStyle: React.CSSProperties = {
  fontSize: 15,
  color: 'var(--color-on-surface)',
  textDecoration: 'none',
  display: 'block',
  padding: '6px 0',
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 13,
  color: 'var(--color-on-surface-variant)',
  fontWeight: 600,
  marginBottom: 8,
  marginTop: 0,
};

export default function MypageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', maxWidth: 1200, margin: '0 auto', padding: '32px 24px', gap: 48 }}>

      {/* 사이드바 */}
      <aside style={{ width: 180, flexShrink: 0 }}>
        <Link href="/mypage" style={{ textDecoration: 'none', color: 'inherit' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>마이페이지</h2>
        </Link>
        <button style={{ fontSize: 14, color: 'var(--color-on-surface-variant)', background: 'none', border: '1px solid #ddd', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', marginBottom: 24 }}>
          로그아웃
        </button>

        <hr style={{ border: 'none', borderTop: '1px solid #eee', marginBottom: 20 }} />

        <div style={{ marginBottom: 24 }}>
          <p style={sectionTitleStyle}>거래 정보</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li><Link href="/mypage/buy" style={linkStyle}>구매내역</Link></li>
            <li><Link href="/mypage/sell" style={linkStyle}>판매내역</Link></li>
            <li><Link href="/mypage/selling" style={linkStyle}>판매중</Link></li>
          </ul>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #eee', marginBottom: 20 }} />

        <div>
          <p style={sectionTitleStyle}>내 정보</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li><Link href="/mypage/profile" style={linkStyle}>회원정보 수정</Link></li>
            <li><Link href="/mypage/reviews" style={linkStyle}>거래 후기</Link></li>
            <li><Link href="/mypage/wishlist" style={linkStyle}>관심 상품</Link></li>
          </ul>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <div style={{ flex: 1 }}>
        {children}
      </div>

    </div>
  );
}