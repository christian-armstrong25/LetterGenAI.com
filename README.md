# LetterGen - AI Cover Letter Generator

<div align="center">

![LetterGen Logo](public/LetterGen.ico)

Generate personalized cover letters in seconds using AI. Upload your resume, add a job description, and get a professional cover letter tailored to your style.

</div>

## Features

- 🤖 **AI-Powered**: Uses OpenAI to generate professional cover letters
- 📝 **Personalized**: Upload writing samples to match your voice
- 📄 **Multiple Formats**: Export as PDF, Word doc, or copy to clipboard
- 🔐 **Secure**: Firebase authentication and cloud storage
- 📱 **Responsive**: Works on desktop and mobile

## Quick Start

1. **Clone & Install**

```bash
git clone https://github.com/yourusername/LetterGen.git
cd LetterGen
pnpm install
```

2. **Set up Environment**
   Create a `.env` file:

```env
VITE_FB_API_KEY=your_firebase_api_key
VITE_FB_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FB_PROJECT_ID=your_project_id
VITE_FB_STORAGE_BUCKET=your_project.appspot.com
VITE_FB_MESSAGING_SENDER_ID=your_sender_id
VITE_FB_APP_ID=your_app_id
VITE_OPENAI_API_KEY=your_openai_api_key
```

3. **Run**

```bash
pnpm run dev
```

## Tech Stack

- **Frontend**: Svelte + TypeScript + Tailwind CSS
- **Backend**: Firebase (Auth + Database)
- **AI**: OpenAI GPT-4 + LangChain
- **Build**: Vite

## How It Works

1. Sign up/login with Firebase
2. Upload your resume (PDF)
3. Choose writing style or upload samples
4. Paste job description
5. Generate and export your cover letter

## License

MIT License
