"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, History, Info, User } from "lucide-react";
import styles from "./Layout.module.css";
import { initPurchases } from "@/lib/purchases";
import { getUserId } from "@/lib/user";
import { initializeNotifications, scheduleNotification } from "@/lib/notifications";
import { useRouter } from "next/navigation";
import { LocalNotifications } from '@capacitor/local-notifications';
import { API_URL } from "@/lib/config";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const setup = async () => {
      const userId = getUserId();
      
      await initPurchases(userId);
      await initializeNotifications();

      await LocalNotifications.removeAllListeners(); 

      LocalNotifications.addListener('localNotificationActionPerformed', async (notification) => {
          const actionId = notification.actionId;
          const reminderId = notification.notification.extra?.reminderId;

          // A. Handle Body Tap -> Navigate to Edit
          if (actionId === 'tap' && reminderId) {
              router.push(`/history?edit=${reminderId}`);
              return;
          }

          if (!reminderId) return;

          // B. Handle Complete
          if (actionId === 'complete') {
              await fetch(`${API_URL}/reminders/${reminderId}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ status: 'completed' })
              });
              window.location.reload();
          } 
          // C. Handle Snooze (Fixed!)
          else if (actionId === 'snooze') {
              const snoozeTime = new Date(Date.now() + 10 * 60000).toISOString();
              
              // 1. Update Backend
              const res = await fetch(`${API_URL}/reminders/${reminderId}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ status: 'snoozed', remind_at: snoozeTime })
              });

              // 2. RESCHEDULE LOCAL NOTIFICATION
              if (res.ok) {
                  // Fetch the fresh object to ensure we have title/extra_info
                  const getRes = await fetch(`${API_URL}/reminders/${reminderId}`);
                  if (getRes.ok) {
                      const updatedReminder = await getRes.json();
                      await scheduleNotification(updatedReminder);
                      console.log("Locally Rescheduled Snooze for:", updatedReminder.title);
                  }
              }
              
              window.location.reload();
          }
      });
    };

    setup();
  }, [router]);

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