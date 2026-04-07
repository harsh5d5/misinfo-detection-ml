# 📝 News Forensic Pillar: Headline Verification (Title Analysis)

This document explains exactly how the **NeuralTrust** system defines whether a news **Title (Headline)** is **TRUE ✅** or **FALSE ❌**.

---

### 🧪 The Forensic Logic
Your system doesn't just "read" the words—it performs a **"Linguistic Scan"** on the headline to see if its tone is factual or "sensational."

#### 1. Clickbait Shield (The "Traps Check") 🪤
Fake news titles are designed to **trick** you into clicking by leaving out the main facts. 
*   **True ✅:** Tells you the news (e.g., *"Prime Minister announces new solar energy policy"*). 
*   **False ❌:** Uses "Action Phrasing" or "Teaser" words like:
    *   *"You won't believe..."*
    *   *"Shocking news..."*
    *   *"The secret they don't want you to know..."*
*   **The Check:** Your system has a list of **"Clickbait Trigger Words."** If the title hits 2 or more, the trust score is automatically reduced.

#### 2. Formatting Anomalies (The "Screaming Check") 📢
Professional journalists follow strict grammar and style rules. Fake news often **shouts** to get your attention.
*   **True ✅:** Starts with a capital letter and uses standard grammar. 
*   **False ❌:** *"SHOCKING NEWS!!! ELECTION STOLEN??? CLICK NOW!!!"*
*   **The Red Flags:** 
    *   **ALL CAPS** (The "shouting" tone).
    *   **Multiple Exclamations** (!!!).
    *   **Multiple Question Marks** (???).

#### 3. Sentiment & Tone (The "Neutrality Check") ⚖️
We use Natural Language Processing to measure the "Emotional Pulse" of the headline.
*   **True ✅:** Neutral and Factual. It just gives the facts without taking sides.
*   **False ❌:** Overly Positive or Negative. It uses "Emotion-Loaded" words like *"Devastating," "Evil," "Brilliant," or "Disgusting."*
*   **Why?** Real headlines are usually boringly factual. Fake headlines try to make you feel **Angry** or **Scared**.

#### 4. Information Density (The "Substance Check") 🧬
Does the headline describe a real event, or is it just "empty words"?
*   **True ✅:** Mentions specific names, places, and actions.
*   **False ❌:** Vague or mysterious. It refers to "the truth" or "secrets" without giving any names or places.

---

### 🛡️ Quick Example of a "Fake Title Scan":
**Headline:** *"URGENT!!! YOU MUST SEE THE SECRET DOCUMENTS THE GOVERNMENT IS HIDING FROM YOU!!!"*

1.  **Format:** ALL CAPS + Triple Exclamation → **Suspicious** 🚩
2.  **Clickbait:** "You must see," "Secret documents" → **FRAUD DETECTED** ❌
3.  **Tone:** Highly alarmist (Urgent, Hiding) → **UNTRUSTED** 🚩

**Final Verdict:** Your "Headline Verification" pod in the UI will show **"SENSATIONAL / ALERT"** and turn **RED 🔴**.

---
*Powered by NeuralTrust Forensic Core // docs/forensics/TITLE_ANALYSIS.md*
