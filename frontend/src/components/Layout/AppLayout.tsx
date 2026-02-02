"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, History, Info, User } from "lucide-react";
import styles from "./Layout.module.css";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path ? styles.active : "";

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <span style={{ color: 'var(--text-main)' }}>Rhe</span>
          <span style={{ color: 'var(--primary-blue)' }}>minda</span>
          <span style={{ color: 'var(--primary-blue)', fontSize: '2rem', lineHeight: 0 }}>.</span>
        </div>
      </header>
      
      <main className={styles.main}>{children}</main>

      <nav className={styles.nav}>
        <Link href="/" className={`${styles.navLink} ${isActive("/")}`}>
          <Home size={24} />
          <span>Home</span>
        </Link>
        <Link href="/history" className={`${styles.navLink} ${isActive("/history")}`}>
          <History size={24} />
          <span>History</span>
        </Link>
        <Link href="/about" className={`${styles.navLink} ${isActive("/about")}`}>
          <Info size={24} />
          <span>About</span>
        </Link>
        <Link href="/profile" className={`${styles.navLink} ${isActive("/profile")}`}>
          <User size={24} />
          <span>Profile</span>
        </Link>
      </nav>
    </div>
  );
}