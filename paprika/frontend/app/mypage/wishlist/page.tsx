'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { WishListItem } from '@/types';
import styles from '../page.module.css';

export default function WishlistPage() {
  const [items, setItems] = useState<WishListItem[]>([]);

  useEffect(() => {
    api.get('/api/v1/users/me/wishlist')
      .then((res) => setItems(res.data.data))
      .catch(() => setItems([]));
  }, []);

  return (
    <section>
      <h1 className={styles.title}>관심 상품</h1>

      {items.length === 0 ? (
        <div className={styles.empty}>찜한 상품이 없습니다.</div>
      ) : (
        <div className={styles.list}>
          {items.map((item) => (
            <div key={item.id} className={styles.card}>
              <img src={item.imgUrl} alt="상품" className={styles.cardImg} />
              <div className={styles.cardInfo}>
                <p className={styles.cardTitle}>상품 #{item.productId}</p>
              </div>
              <button
                onClick={() => {
                  api.delete(`/api/v1/users/me/wishlist/${item.productId}`)
                    .then(() => setItems(prev => prev.filter(i => i.id !== item.id)))
                    .catch(console.error);
                }}
                className={styles.wishBtn}
              >
                찜 해제
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}