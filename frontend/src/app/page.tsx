"use client";
import { useState, useEffect, useRef } from "react";
import AppLayout from "@/components/Layout/AppLayout";
import ReminderCard from "@/components/ReminderCard/ReminderCard";
import styles from "./home.module.css";
import { API_URL } from "@/lib/config";
import { getUserId } from "@/lib/user";
import { Mic, Send, Square, Trash2, Loader2, Sparkles, Edit3 } from "lucide-react";
import { LIMITS } from "@/lib/config";
import { checkSubscription, purchasePro } from "@/lib/purchases";


export default function Home() {
  const [reminders, setReminders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usage, setUsage] = useState({ total: 0, voice: 0, text: 0 });
  const [isPro, setIsPro] = useState(false);
  
  // Mode State: 'ai' (Voice/Text) or 'manual' (Form)
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');

  // AI Inputs
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  // Manual Inputs
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [rule, setRule] = useState("none");
  const [extraInfo, setExtraInfo] = useState("");
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const checkLimit = (mode:string): boolean => {
      if (isPro) return true;
  
      // Global Limit
      if (usage.total >= LIMITS.FREE_TOTAL) {
        alert("Free Limit Reached (3 Reminders). Upgrade in Profile to add more!");
        return false;
      }
  
      // Mode Specific Limits
      if (mode === 'voice' && usage.voice >= LIMITS.FREE_VOICE) {
        alert("You've used your free Voice Reminder. Upgrade to unlock unlimited voice!");
        return false;
      }
      if (mode === 'text' && usage.text >= LIMITS.FREE_TEXT) {
        alert("You've used your free AI Text Reminder. Use Manual form or Upgrade!");
        return false;
      }
      
      return true;
    };

  const fetchUserData = async () => {
    const userId = getUserId();
    const proStatus = await checkSubscription();
    setIsPro(proStatus);

    // Fetch history to calculate usage (Simple client-side calculation for Hackathon)
    const res = await fetch(`${API_URL}/reminders/history/${userId}`);
    if (res.ok) {
      const allReminders = await res.json();
      
      const stats = {
        total: allReminders.length,
        voice: allReminders.filter((r: any) => r.creation_mode === "voice").length,
        text: allReminders.filter((r: any) => r.creation_mode === "ai_text").length,
      };
      setUsage(stats);
      setReminders(allReminders.slice(0, 2)); // Just keep recent for home
    }
    setIsLoading(false);
  };

  useEffect(() => { fetchUserData(); }, []);

  // Audio Cleanup
  useEffect(() => {
    return () => { if (audioUrl) URL.revokeObjectURL(audioUrl); };
  }, [audioUrl]);

  // --- Recorder Logic (Same as before) ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) { alert("Microphone access denied"); }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const discardAudio = () => {
    setAudioBlob(null);
    setAudioUrl(null);
  };

  // --- Submit Logic ---
  const handleSubmit = async () => {
    let currentMode = 'manual';
    if (mode === 'ai') {
        currentMode = audioBlob ? 'voice' : 'ai_text';
    }
    console.log("Current Mode:", currentMode);
    if (!checkLimit(currentMode)) return;
    
    setIsSubmitting(true);
    const userId = getUserId();
    const formData = new FormData();
    formData.append("user_id", userId);

    if (mode === 'manual') {
      if (!title || !date) {
        setIsSubmitting(false);
        return alert("Please fill in Title and Date");
      }
      formData.append("title", title);
      formData.append("remind_at", date); // Sends "2023-10-25T14:30"
      formData.append("recurring_rule", rule);
      if (extraInfo) formData.append("extra_info", extraInfo);
    } else {
      // AI Mode
      if (!text.trim() && !audioBlob) {
        setIsSubmitting(false); 
        return;
      }
      if (audioBlob) formData.append("file", audioBlob, "voice.webm");
      else formData.append("text", text);
    }
    formData.append("mode", currentMode);

    try {
      await fetch(`${API_URL}/reminders/create`, { method: "POST", body: formData });
      
      // Reset All States
      setText("");
      discardAudio();
      setTitle("");
      setDate("");
      setRule("none");
      setMode("ai"); // Switch back to default
      fetchUserData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className={styles.section}>
        
        <div className={styles.inputGroup}>
          
          {/* Mode Switcher Tabs */}
          <div className={styles.modeSwitcher}>
            <button 
              className={`${styles.modeTab} ${mode === 'ai' ? styles.active : ''}`}
              onClick={() => setMode('ai')}
            >
              <Sparkles size={16} style={{display:'inline', marginRight:4}} />
              AI Assistant
            </button>
            <button 
              className={`${styles.modeTab} ${mode === 'manual' ? styles.active : ''}`}
              onClick={() => setMode('manual')}
            >
              <Edit3 size={16} style={{display:'inline', marginRight:4}} />
              Manual Form
            </button>
          </div>

          {/* === AI MODE UI === */}
          {mode === 'ai' && (
            <>
              {!audioUrl && (
                <textarea 
                  className={styles.textArea} 
                  placeholder="Just say it: 'Remind me to call Mom every Sunday at 5pm'..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  disabled={isRecording}
                />
              )}

              {audioUrl && (
                <div className={styles.audioPreviewContainer}>
                  <audio controls src={audioUrl} className={styles.audioPreview} />
                  <div className={styles.previewActions}>
                    <button className={styles.discardBtn} onClick={discardAudio}>
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* === MANUAL MODE UI === */}
          {mode === 'manual' && (
            <div className={styles.manualForm}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Title</label>
                <input 
                  className={styles.input} 
                  placeholder="e.g. Pay Rent"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>When?</label>
                <input 
                  type="datetime-local"
                  className={styles.input}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Extra Info</label>
                <textarea 
                  className={styles.input} 
                  placeholder="e.g. Call before 6pm"
                  value={extraInfo}
                  onChange={(e) => setExtraInfo(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Recurring?</label>
                <select 
                  className={styles.input} 
                  value={rule} 
                  onChange={(e) => setRule(e.target.value)}
                >
                  <option value="none">No Repeat</option>
                  <hr /> {/* Visual Separator */}
                  <option value="daily">Daily</option>
                  <option value="weekdays">Weekdays (Mon-Fri)</option>
                  <option value="weekends">Weekends (Sat-Sun)</option>
                  <hr />
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-Weekly (Every 2 weeks)</option>
                  <hr />
                  <option value="monthly">Monthly</option>
                  <option value="bimonthly">Every 2 Months</option>
                  <option value="quarterly">Quarterly (Every 3 Months)</option>
                  <option value="triannual">Every 4 Months</option>
                  <option value="biannual">Twice a Year (Every 6 Months)</option>
                  <hr />
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>
          )}

          {/* === FOOTER CONTROLS === */}
          <div className={styles.controls}>
            
            {/* Show Voice Button ONLY in AI Mode */}
            {mode === 'ai' ? (
               !audioUrl ? (
                <button 
                  className={`${styles.voiceBtn} ${isRecording ? styles.recording : ''}`}
                  onClick={isRecording ? stopRecording : startRecording}
                >
                  {isRecording ? <Square size={18} fill="currentColor" /> : <Mic size={18} />} 
                  {isRecording ? "Stop" : "Voice"}
                </button>
              ) : <div />
            ) : (
              <div /> // Spacer for manual mode
            )}

            <button 
              className={styles.submitBtn} 
              onClick={handleSubmit}
              disabled={isSubmitting || (mode === 'ai' && !text && !audioBlob)}
            >
              {isSubmitting ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
            </button>
          </div>
        </div>

        {/* === RECENT LIST === */}
        <div>
          <h2 className={styles.sectionTitle}>Recent Reminders</h2>
          {isLoading && (
            <div className={styles.emptyState}><Loader2 className="spin" size={20} /></div>
          )}
          
          {!isLoading && reminders.map((r: any) => (
            <ReminderCard key={r._id} data={r} />
          ))}

          {!isLoading && reminders.length === 0 && (
            <div className={styles.emptyState}>
              <p>You're all caught up! 🎉</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}