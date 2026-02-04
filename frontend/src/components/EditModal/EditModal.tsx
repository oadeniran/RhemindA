import React, { useState } from 'react';
import styles from './EditModal.module.css';
import { X, Check, Clock, Save } from 'lucide-react';

export interface ReminderData {
  _id: string;
  title: string;
  remind_at: string;
  recurring_rule?: string | null;
  status: string;
  creation_mode?: string;
  extra_info?: string;
}

interface EditModalProps {
  reminder: ReminderData;
  onClose: () => void;
  onSave: (id: string, data: Partial<ReminderData>) => void;
  onComplete: (id: string) => void;
  onSnooze: (id: string) => void;
}

export default function EditModal({ reminder, onClose, onSave, onComplete, onSnooze }: EditModalProps) {
  // Safe default for date slicing
  const initialDate = reminder.remind_at && reminder.remind_at.length >= 16 
    ? reminder.remind_at.slice(0, 16) 
    : "";

  const [title, setTitle] = useState(reminder.title);
  const [date, setDate] = useState(initialDate);
  const [rule, setRule] = useState(reminder.recurring_rule || "none");
  const [extraInfo, setExtraInfo] = useState(reminder.extra_info || "");

  const handleSave = () => {
    onSave(reminder._id, {
      title,
      remind_at: date,
      recurring_rule: rule === "none" ? null : rule,
      extra_info: extraInfo
    });
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3>Edit Reminder</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className={styles.body}>
          {/* Title Input */}
          <div className={styles.formGroup}>
            <label>Title</label>
            <input 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              className={styles.input} 
            />
          </div>
          
          {/* Date Input */}
          <div className={styles.formGroup}>
            <label>Time</label>
            <input 
              type="datetime-local" 
              value={date} 
              onChange={e => setDate(e.target.value)} 
              className={styles.input} 
            />
          </div>

          {/* Extra Info Input */}
          <div className={styles.formGroup}>
            <label>Extra Info</label>
            <textarea 
              value={extraInfo} 
              onChange={e => setExtraInfo(e.target.value)} 
              className={styles.input}
              style={{ minHeight: '80px', resize: 'vertical' }}
            />
          </div>

          {/* Recurring Rule */}
          <div className={styles.formGroup}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label>Recurring</label>
                
                {/* ESCAPE HATCH: Allows user to unlock if they really want to */}
                {rule === 'custom' && (
                <button 
                    onClick={() => {
                    if(confirm("This will clear the complex AI schedule. Switch to standard?")) {
                        setRule('none'); // Unlocks the dropdown
                    }
                    }}
                    style={{ 
                    fontSize: '0.75rem', 
                    color: 'var(--primary-blue)', 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer',
                    textDecoration: 'underline'
                    }}
                >
                    Reset to Standard
                </button>
                )}
            </div>

            <select 
                value={rule} 
                onChange={e => setRule(e.target.value)} 
                className={styles.input}
                // 1. DISABLE IF CUSTOM
                disabled={rule === 'custom'}
                // 2. Visual Feedback (Greyed out)
                style={rule === 'custom' ? { background: '#f1f5f9', color: '#64748b', cursor: 'not-allowed' } : {}}
            >
                {/* 3. Add Custom Option so it displays correctly */}
                <option value="custom">Custom Schedule (AI Managed)</option>
                <hr />
                <option value="none">No Repeat</option>
                <hr />
                <option value="daily">Daily</option>
                <option value="weekdays">Weekdays (Mon-Fri)</option>
                <option value="weekends">Weekends (Sat-Sun)</option>
                <hr />
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-Weekly (Every 2 weeks)</option>
                <hr />
                <option value="monthly">Monthly</option>
                <option value="bimonthly">Every 2 Months</option>
                <option value="quarterly">Quarterly</option>
                <option value="triannual">Every 4 Months</option>
                <option value="biannual">Twice a Year</option>
                <hr />
                <option value="yearly">Yearly</option>
            </select>

            {/* 4. Helper Text */}
            {rule === 'custom' && (
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px', fontStyle: 'italic' }}>
                🔒 Complex schedule. Reset to standard to edit.
                </div>
            )}
            </div>
        </div>

        <div className={styles.actions}>
           {/* Primary Save Button */}
           <button onClick={handleSave} className={styles.saveBtn}>
             <Save size={16} /> Save Changes
           </button>
           
           <div className={styles.quickActions}>
             {/* Snooze Button */}
             <button 
               onClick={() => { onSnooze(reminder._id); onClose(); }} 
               className={styles.actionBtn}
               style={{ background: '#f59e0b', color: 'white' }}
             >
               <Clock size={16} /> Snooze 10m
             </button>

             {/* Complete Button (Only show if not done) */}
             {reminder.status !== 'completed' && (
               <button 
                 onClick={() => { onComplete(reminder._id); onClose(); }} 
                 className={styles.actionBtn}
                 style={{ background: '#16a34a', color: 'white' }}
               >
                 <Check size={16} /> Done
               </button>
             )}
           </div>
        </div>

      </div>
    </div>
  );
}