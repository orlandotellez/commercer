'use client';

import Link from 'next/link';
import { ShoppingCart, Search, Menu, X } from 'lucide-react';
import { useCart } from '@/features/cart/context/CartContext';
import { useState } from 'react';
import { categories } from '@/features/product/data/categories';
import styles from './StoreNavbar.module.css';

export const StoreNavbar = () => {
  const { itemCount } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className={styles.header}>

      {/* Main nav */}
      <div className={styles.mainNav}>
        <div className={`${styles.container} ${styles.mainContent}`}>

          {/* Logo */}
          <h1 className={styles.title}>
            <Link href="/" className={styles.logo}>
              TECH<span>COMPONENTS</span>
            </Link>

          </h1>

          {/* Search Desktop */}
          <div className={styles.searchDesktop}>
            <div className={styles.searchWrapper}>
              <input
                type="text"
                placeholder="Buscar CPUs, GPUs, RAM, monitores..."
                className={styles.input}
              />
              <Search size={16} className={styles.searchIcon} />
            </div>
          </div>

          {/* Actions */}
          <div className={styles.actions}>

            {/* Mobile Search Toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={styles.iconBtn}
            >
              <Search size={20} />
            </button>

            {/* Cart */}
            <Link href="/cart" className={styles.cart}>
              <ShoppingCart size={22} />
              {itemCount > 0 && (
                <span className={styles.badge}>{itemCount}</span>
              )}
            </Link>

            {/* Mobile Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={styles.iconBtn}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        {searchOpen && (
          <div className={styles.searchMobile}>
            <input
              type="text"
              placeholder="Buscar productos..."
              className={styles.input}
            />
          </div>
        )}
      </div>

      {/* Categories */}
      <nav className={styles.categories}>
        <div className={`${styles.container} ${styles.categoriesContent}`}>

          <Link href="/shop" className={styles.categoryActive}>
            Todos
          </Link>

          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?categoria=${cat.slug}`}
              className={styles.category}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <div className={`${styles.container} ${styles.mobileContent}`}>

            <Link
              href="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className={styles.mobileActive}
            >
              Todos los productos
            </Link>

            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?categoria=${cat.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className={styles.mobileItem}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
