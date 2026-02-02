import React, { useState, useRef, useEffect } from "react";
import styles from "./ReminderCard.module.css";
import { Repeat } from "lucide-react";

interface Props {
  data: any;
  onComplete?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export default function ReminderCard({ data, onComplete, onDelete, showActions = false }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const date = new Date(data.remind_at).toLocaleString([], { 
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
  });

  // Handle "Click Outside" to collapse
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    // Only add listener if currently expanded (performance optimization)
    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded]);

  return (
    <div 
      ref={cardRef}
      className={`${styles.card} ${isExpanded ? styles.expanded : ''}`}
      onClick={() => setIsExpanded(true)} // Click anywhere to expand
    >
      <div className={styles.header}>
        <span className={styles.title}>{data.title}</span>
        <span className={styles.time}>{date}</span>
      </div>
      
      <div className={styles.metaRow}>
        <span className={styles.status}>{data.status.toUpperCase()}</span>

        {data.recurring_rule && (
          <span className={styles.status} style={{display: 'flex', alignItems: 'center', gap: '4px', color: '#0284c7'}}>
            <Repeat size={12} /> {data.recurring_rule}
          </span>
        )}
      </div>

      {data.extra_info && (
        <div className={styles.extraInfo}>
          "{data.extra_info}"
        </div>
      )}

      {/* Show actions if permitted AND (always visible OR only on expand)
      */}
      {showActions && (
        <div className={styles.actions}>
          {onDelete && (
            <button 
              className={`${styles.btn} ${styles.btnDelete}`} 
              onClick={(e) => { e.stopPropagation(); onDelete(data._id); }}
            >
              Delete
            </button>
          )}
          {onComplete && data.status !== "completed" && (
            <button 
              className={`${styles.btn} ${styles.btnComplete}`} 
              onClick={(e) => { e.stopPropagation(); onComplete(data._id); }}
            >
              Done
            </button>
          )}
        </div>
      )}
    </div>
  );
}