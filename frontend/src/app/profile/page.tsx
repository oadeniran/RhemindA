"use client";
import { useState, useEffect } from "react";
import AppLayout from "@/components/Layout/AppLayout";
import styles from "./profile.module.css"; 
import { checkSubscription, purchasePro } from "@/lib/purchases";
import { getUserId } from "@/lib/user";
import { Crown, Check, XCircle, Loader2 } from "lucide-react";

export default function Profile() {
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const userId = getUserId();

  useEffect(() => {
    const syncStatus = async () => {
      const status = await checkSubscription();
      setIsPro(status);
      setLoading(false);
    };
    syncStatus();
  }, []);

  const handlePurchase = async () => {
    setPurchasing(true);
    const success = await purchasePro();
    if (success) setIsPro(true);
    setPurchasing(false);
  };

  return (
    <AppLayout>
      <div className={styles.container}>
        
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.avatar}>👤</div>
          <h1 className={styles.username}>
             {loading ? "Loading..." : `User ${userId.substring(5, 9)}`}
          </h1>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
            Manage your subscription and limits
          </p>
        </div>

        {/* Pricing Grid */}
        <div className={styles.plansGrid}>
          
          {/* --- FREE PLAN CARD --- */}
          <div className={`${styles.planCard} ${!isPro ? styles.currentPlan : ''}`}>
            <div className={styles.cardHeader}>
              <div className={styles.planName}>Starter</div>
              <div className={styles.price}>Free</div>
            </div>
            <div className={styles.features}>
              <Feature label="3 Reminders Total" active={true} />
              <Feature label="1 Voice Creation" active={true} />
              <Feature label="1 AI Text Creation" active={true} />
              <Feature label="Cloud Sync" active={true} />
              <Feature label="Recurring Rules" active={false} />
            </div>
            <div className={styles.actionArea}>
              {!isPro ? (
                <div className={styles.currentBtn}>Current Plan</div>
              ) : (
                <div className={styles.currentBtn} style={{background:'transparent'}}>Included</div>
              )}
            </div>
          </div>

          {/* --- PRO PLAN CARD --- */}
          <div className={`${styles.planCard} ${styles.proCard}`}>
            {!isPro && <div className={styles.popularBadge}>Recommended</div>}
            
            <div className={styles.cardHeader}>
              <div className={styles.planName} style={{color: 'var(--primary-blue)'}}>Rheminda Pro</div>
              <div className={styles.price}>
                $4.99 <span className={styles.period}>/mo</span>
              </div>
            </div>
            <div className={styles.features}>
              <Feature label="Unlimited Reminders" active={true} highlight />
              <Feature label="Unlimited Voice AI" active={true} highlight />
              <Feature label="Complex Recurring Rules" active={true} highlight />
              <Feature label="Priority Sync" active={true} />
              <Feature label="Edit & Reschedule" active={true} />
            </div>
            <div className={styles.actionArea}>
              {isPro ? (
                <div className={styles.currentBtn} style={{background:'#dcfce7', color:'#166534'}}>
                  Active Plan
                </div>
              ) : (
                <button className={styles.upgradeBtn} onClick={handlePurchase} disabled={purchasing}>
                  {purchasing ? <Loader2 className="spin" size={18} /> : <Crown size={18} />}
                  Upgrade Now
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}

const Feature = ({ label, active, highlight = false }: { label: string, active: boolean, highlight?: boolean }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    {active ? (
      <Check size={16} color={highlight ? "var(--primary-blue)" : "#16a34a"} strokeWidth={3} />
    ) : (
      <XCircle size={16} color="#cbd5e1" />
    )}
    <span style={{ 
      color: active ? (highlight ? 'var(--text-main)' : '#475569') : '#94a3b8', 
      fontSize: '0.9rem',
      fontWeight: highlight ? 600 : 400
    }}>
      {label}
    </span>
  </div>
);