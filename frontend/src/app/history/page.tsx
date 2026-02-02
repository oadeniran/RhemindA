"use client";
import { useState, useEffect } from "react";
import AppLayout from "@/components/Layout/AppLayout";
import ReminderCard from "@/components/ReminderCard/ReminderCard";
import styles from "./history.module.css";
import { API_URL } from "@/lib/config";
import { getUserId } from "@/lib/user";
import { Inbox, Loader2 } from "lucide-react";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = async () => {
    setIsLoading(true);
    const userId = getUserId();
    const res = await fetch(`${API_URL}/reminders/history/${userId}`);
    if (res.ok) setHistory(await res.json());
    setIsLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleComplete = async (id: string) => {
    await fetch(`${API_URL}/reminders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed" })
    });
    fetchHistory();
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Delete this reminder?")) return;
    await fetch(`${API_URL}/reminders/${id}`, { method: "DELETE" });
    fetchHistory();
  };

  return (
    <AppLayout>
      <div className={styles.container}>
        <h1 className={styles.title}>All Reminders</h1>

        {isLoading && (
          <div className={styles.emptyState}>
            <Loader2 className="spin" size={24} />
          </div>
        )}

        {!isLoading && history.length > 0 && history.map((r: any) => (
          <ReminderCard 
            key={r._id} 
            data={r} 
            showActions={true}
            onComplete={handleComplete}
            onDelete={handleDelete}
          />
        ))}

        {!isLoading && history.length === 0 && (
          <div className={styles.emptyState}>
            <Inbox size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p>No reminders in history.</p>
            <p style={{fontSize: '0.8em', marginTop: '4px'}}>
              Go to Home to add a new one.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}