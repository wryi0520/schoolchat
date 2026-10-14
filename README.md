# 🏫 SchoolQ - School-Tailored Q&A & Real-Time 1:1 Study Chat Platform

> A hyper-localized academic community where students across grades and classes ask and answer school-specific curriculum questions, automatically unlocking safe 1:1 study mentoring chat channels upon answer adoption.

---

## 📌 Key Features

1. **School & Grade-Tailored Q&A Board**
   - **Teacher-Specific Style Linking**: Post questions tagged with specific teachers' exam tendencies (subjective grading criteria, supplementary material variation rates, etc.), syllabus page ranges, and difficulty levels.
   - **Grade & Subject Filtering**: Targeted filtering across 1st, 2nd, and 3rd grades and subjects including Mathematics, Korean, English, Science, Social Studies, and Computer Science.
   - **Answer Adoption Mechanism**: When the question author adopts the most helpful answer from a peer or senior, study points are rewarded and a 1:1 direct study chat room is activated instantly.

2. **Real-Time 1:1 Study Chat Server (Express + SSE)**
   - **Closed Same-School Safety Policy**: 1:1 direct messaging is strictly restricted to verified students within the exact same school; cross-school DM attempts are blocked.
   - **Adopt-to-Chat Flow**: 1:1 study mentoring rooms are unlocked only with adopted respondents or confirmed school friends, preventing unsolicited messaging.
   - **Real-Time Stream (SSE)**: Full-duplex live message streaming and synchronization powered by Server-Sent Events.
   - **Handwritten Solution Photos & LaTeX Formula Toolbar**: In-chat handwritten solution photo attachments with lightbox zoom, plus instant LaTeX mathematical formula insertion.
   - **25-Minute Pomodoro Study Timer**: Synchronized study timer between participants for co-studying sessions.

3. **AI Academic Specialization Engine (Google Gemini 3.8 Flash)**
   - **AI Teacher Rubric Grader**: Evaluates student draft solutions against specific teachers' strict grading rubrics, breaking down points lost and generating 10/10 model answers.
   - **Midterm Killer Question Predictor**: Cross-examines curriculum history to predict the top 3 highest-probability trap questions for upcoming exams.
   - **Socratic 3-Step Hints**: Guides learners through deductive problem-solving (Concept ➡️ Logical Step ➡️ Trap Warning) without prematurely spoiling the answer.

4. **School Verification & Trust Safety System**
   - **Student ID Camera OCR Auto-Scan**: Automated digital student identification card scanning with official school watermark badges.
   - **Real-Time Profanity Filtering**: Automated `***` masking of abusive or harmful language.
   - **1-Click Reporting & User Blocking**: Immediate reporting of questions, answers, and messages, with instant hiding of all content from blocked users.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React, Motion
- **Backend**: Node.js, Express, tsx
- **AI Engine**: Google GenAI SDK (`@google/genai`), Gemini 3.8 Flash (`gemini-3.8-flash`)
- **Real-Time Sync**: Server-Sent Events (SSE) + REST API
- **Audio Synthesizer**: Web Audio API

---

## 🚀 Getting Started

### 1. Clone Repository & Install Dependencies
```bash
git clone https://github.com/wryi0520/schoolchat.git
cd schoolchat
npm install
