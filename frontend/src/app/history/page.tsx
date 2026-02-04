"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AppLayout from "@/components/Layout/AppLayout";
import ReminderCard from "@/components/ReminderCard/ReminderCard";
import styles from "./history.module.css";
import { API_URL } from "@/lib/config";
import { getUserId } from "@/lib/user";
import { Inbox, Loader2 } from "lucide-react";
import EditModal, { ReminderData } from "@/components/EditModal/EditModal";
import { scheduleNotification, cancelNotification } from "@/lib/notifications";


function HistoryContent() { 
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit'); // This caused the build error

  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingReminder, setEditingReminder] = useState<ReminderData | null>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    const userId = getUserId();
    const res = await fetch(`${API_URL}/reminders/history/${userId}`);
    if (res.ok) setHistory(await res.json());
    setIsLoading(false);
  };

  // Auto-open modal if URL has ?edit=ID
  useEffect(() => {
    if (editId && history.length > 0) {
      const target = history.find(r => r._id === editId);
      if (target) setEditingReminder(target);
    }
  }, [editId, history]);

  const saveEdit = async (id: string, data: any) => {
    try {
        const res = await fetch(`${API_URL}/reminders/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            // Fix: Reschedule Logic
            const oldReminder = history.find(r => r._id === id);
            const merged = { ...oldReminder, ...data, _id: id };
            await scheduleNotification(merged);
        }
        fetchHistory();
    } catch (e) {
        console.error("Edit failed", e);
    }
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
    await cancelNotification(id);
    fetchHistory();
  };

  const handleSnooze = async (id: string) => {
     try {
       const snoozeTime = new Date(Date.now() + 10 * 60000).toISOString();
       const res = await fetch(`${API_URL}/reminders/${id}`, {
         method: "PUT",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ status: "snoozed", remind_at: snoozeTime })
       });
       if (res.ok) {
           const updatedReminder = history.find(r => r._id === id);
           if (updatedReminder) {
               await scheduleNotification({
                   ...updatedReminder, 
                   remind_at: snoozeTime,
                   status: 'snoozed'
               });
           }
           fetchHistory();
       }
     } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Delete this reminder?")) return;
    await fetch(`${API_URL}/reminders/${id}`, { method: "DELETE" });
    await cancelNotification(id); // Good practice to cancel it too
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
            onEdit={setEditingReminder}
          />
        ))}

        {!isLoading && history.length === 0 && (
          <div className={styles.emptyState}>
            <Inbox size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p>No reminders in history.</p>
          </div>
        )}

        {editingReminder && (
           <EditModal 
             key={editingReminder._id}
             reminder={editingReminder} 
             onClose={() => setEditingReminder(null)} 
             onSave={saveEdit} 
             onComplete={handleComplete}
             onSnooze={handleSnooze}
           />
        )}
      </div>
    </AppLayout>
  );
}

// 3. CREATE THE WRAPPER (This is your new Default Export)
export default function HistoryPage() {
  return (
    // This Suspense boundary satisfies the build error
    <Suspense fallback={<div style={{padding: 20}}>Loading...</div>}>
      <HistoryContent />
    </Suspense>
  );
}