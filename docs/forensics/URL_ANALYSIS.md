# 📡 News Forensic Pillar: URL Authenticity (Source Credibility)

This document explains exactly how the **NeuralTrust** system defines whether a news **URL (Link)** is **TRUE ✅** or **FALSE ❌**.

---

### 🧪 The Forensic Logic
Your system doesn't just "read" the URL—it performs a **"Digital ID Scan"** on the domain to see if it is a professional news provider or a "trick" link.

#### 1. The "Reputation Database" (Gold Standard Domains) 🏛️
The core of URL trust is built on **Tiers**.
*   **True ✅ (Tier-1):** `bbc.com`, `reuters.com`, `nytimes.com`, `aljazeera.com`.
*   **Neutral 🧐 (Tier-2):** Newly emerging local blogs or specialized sites.
*   **Untrusted ❌ (Tier-3):** Domains often linked to misinformation or newly registered "buzz" sites.

#### 2. Typosquatting Check (The "Fake ID" Scan) 🕵️‍♂️
Fake news often tries to **impersonate** real news by changing one or two letters to trick your eyes.
*   **Real ✅:** `google.com`
*   **Fake ❌:** `gooogle.com` (3 o's)
*   **Fake ❌:** `reutters.com` (Extra 't'—Very common trick!)
*   **The Check:** We use the `tldextract` library to "peel" the domain and see if it is a known "impersonator."

#### 3. Protocol & SSL Security (The "Lock") 🔒
A professional news site always uses modern, secure connections.
*   **True ✅:** `https://` (The 'S' stands for Secure). It shows the site has an SSL certificate.
*   **False ❌:** `http://` (Missing the Secure lock icon in your browser). Professional outlets rarely send traffic this way anymore.

#### 4. TLD Suffix Analysis (The "Suffix Check") 📁
The "suffix" of a URL tells us who the site is for.
*   **High Trust ✅:** `.com`, `.org`, `.gov`, `.edu`.
*   **Suspicious 🧐:** `.xyz`, `.info`, `.top`, `.click`.
*   **Why?** High-quality news outlets rarely use `.click` or `.xyz` because those domains are cheap and easy for "throwaway" fake sites to buy.

---

### 🛡️ Quick Example of a "Fake URL Scan":
**Link:** `http://reutters-news.top/article`

1.  **Protocol:** Only `http` (No lock) → **Suspicious** 🚩
2.  **Name:** `reutters` (Copycat of Reuters) → **FRAUD DETECTED** ❌
3.  **TLD:** Ends in `.top` (Suspicious suffix) → **UNTRUSTED** 🚩

**Final Verdict:** The "Source Authenticity" pod in your UI will instantly turn **RED 🔴** and show **"UNTRUSTED"**.

---
*Powered by NeuralTrust Forensic Core // docs/forensics/URL_ANALYSIS.md*
