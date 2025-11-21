Anivise — AI-Powered Anime Recommendation Website

Anivise is a modern web application that provides personalized anime recommendations using Google Gemini (Generative Language API). Users can enter prompts such as specific genres, release years, themes, or preferences, and the system generates curated anime suggestions in a structured format.

This project is built with Next.js 14, React, and TypeScript, using server-side API routes to securely communicate with Gemini without exposing API keys to the client.

Features:
- Natural-language anime recommendation using Google Gemini.
- Clean and modern UI with a dark theme.
- JSON-structured AI responses for easy rendering in the frontend.
- Anime result cards with title, genre tags, synopsis, and reason.
- Secure server-side API integration (no API keys in the frontend).
- Fully extensible for future features like genre filters, history, and more.

Installation & Setup:
1. Clone the Repository:
   git clone https://github.com/Saji6787/Project-Anivise.git, and then cd anivise

2. Install Dependencies:
   npm install

3. Create Environment File:
   Create `.env.local` in the root:
   GEMINI_API_KEY=your_api_key_here

4. Start Development Server:
   npm run dev
   Visit http://localhost:3000
