# 🔄 News Forensic Pillar: Contextual Integrity (Description Analysis)

This document explains exactly how the **NeuralTrust** system defines whether a news **Description (Summary)** is **TRUE ✅** or **FALSE ❌**.

---

### 🧪 The Forensic Logic
Your system asks: *Does the body of the story match the headline?* It performs a **"Narrative Check"** to ensure the story is consistent.

#### 1. Narrative Alignment (The "Bait & Switch" Check) 🔄
This is the most important check. It looks at the words in the **Title** and compares them to the **Description**.
*   **True ✅:** If the Title says "Rain in India," the Description should mention "Rain," "India," or "Weather." 
*   **False ❌:** If the Title says "Rain in India," but the Description says "Click here for a 50% discount on shoes." 
*   **The Check:** Your system calculates a **"Similarity Score."** If the Title and Description are talking about different things, the trust score is instantly crashed!

#### 2. Information Density (The "Meat Check") 🥩
Fake news is often "thin"—it has lots of words but **no real facts**.
*   **True ✅:** Uses many **Nouns** (Prime Minister, World Bank, Mumbai).
*   **False ❌:** Uses many **Adjectives** (Bad, Evil, Secret, Terrible).
*   **Why?** Real journalism is built on **Nouns** (Facts). Fake news is built on **Adjectives** (Opinion and Fear).

#### 3. Linguistic Quality (The "Professionalism Check") ✍️
Top-tier journalists follow strict style guides. Fake news sites often have sloppy writing.
*   **True ✅:** Formal structure, proper punctuation, and correct grammar.
*   **False ❌:** Overly long sentences, missing periods, or "Chat Speak."

#### 4. Sentiment Drift (The "Mood Balance") ⚖️
We analyze the emotion of the description and see if it **matches** the tone of the headline. 
*   **True ✅:** If the Title is neutral, the Description is neutral. 
*   **False ❌:** If the Headline is neutral, but the Description is an angry rant or a suspicious advertisement.

---

### 🛡️ Quick Example of a "Fake Description Scan":
**Headline:** *"New Tax Law Announced by Parliament."*
**Description:** *"The evil elites are stealing our money again! This new law is a disaster for every citizen. We must stand up and fight back before it's too late!!!"*

1.  **Alignment:** Title says "Tax Law," but Description is about "Fighting" and "Evil Elites." → **Suspicious** 🚩
2.  **Density:** No names, no dates, no specific tax percentages (Just angry words). → **FRAUD DETECTED** ❌
3.  **Tone:** Extremely aggressive and biased compared to the headline. → **UNTRUSTED** 🚩

**Final Verdict:** The "Narrative Content" pod in your UI will show **"BIASED / OPINIONATED"** and turn **RED 🔴**.

---
*Powered by NeuralTrust Forensic Core // docs/forensics/DESCRIPTION_ANALYSIS.md*
