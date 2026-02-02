"use client";
import AppLayout from "@/components/Layout/AppLayout";
import styles from "./about.module.css";
import { CheckCircle, Code, Smartphone, Zap } from "lucide-react";

export default function AboutPage() {
  return (
    <AppLayout>
      <div className={styles.container}>
        
        {/* Hero Section */}
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>Reminda</h1>
          <p className={styles.heroSubtitle}>
            Intelligent Cross-Platform Reminders
          </p>
        </div>

        {/* The Brief Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionHeader}>The Mission</h2>
          <p style={{ lineHeight: '1.6', fontSize: '0.95rem' }}>
            Sam lives by reminders, but switching OS means losing them. 
            Reminda solves this with a <strong>True Sync</strong> backend 
            and AI-powered natural language processing.
          </p>
        </section>

        {/* Features Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionHeader}>Key Features</h2>
          <ul className={styles.list}>
            <li className={styles.listItem}>
              <Zap size={20} className={styles.icon} />
              <span><strong>AI Voice Parsing:</strong> Speak naturally, we handle the dates.</span>
            </li>
            <li className={styles.listItem}>
              <Smartphone size={20} className={styles.icon} />
              <span><strong>Cross Platform:</strong> Works seamlessly on iOS & Android.</span>
            </li>
            <li className={styles.listItem}>
              <CheckCircle size={20} className={styles.icon} />
              <span><strong>True Sync:</strong> Dismiss once, clear everywhere.</span>
            </li>
          </ul>
        </section>

        {/* Tech Stack Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionHeader}>Tech Stack</h2>
          <ul className={styles.list}>
            <li className={styles.listItem}>
              <Code size={18} className={styles.icon} />
              <span>FastAPI (Async Python)</span>
            </li>
            <li className={styles.listItem}>
              <Code size={18} className={styles.icon} />
              <span>MongoDB & Motor</span>
            </li>
            <li className={styles.listItem}>
              <Code size={18} className={styles.icon} />
              <span>Gemini AI (Vertex AI)</span>
            </li>
            <li className={styles.listItem}>
              <Code size={18} className={styles.icon} />
              <span>Next.js & Capacitor</span>
            </li>
          </ul>
        </section>

        <div className={styles.footer}>
          Built for the Hackathon • {new Date().getFullYear()}
        </div>

      </div>
    </AppLayout>
  );
}