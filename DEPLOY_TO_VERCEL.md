# 🚀 Quick Deployment to Vercel

This repository is ready for immediate deployment to Vercel!

## One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fpkumv1%2Fevent-document-parser-v2&env=GROQ_API_KEY&envDescription=Get%20your%20API%20key%20from%20https%3A%2F%2Fconsole.groq.com&project-name=event-document-parser&repository-name=event-document-parser)

## Manual Deployment Steps

1. **Fork or Clone this Repository**
   - Click the "Fork" button on GitHub, or
   - Clone: `git clone https://github.com/pkumv1/event-document-parser-v2.git`

2. **Get Your Groq API Key**
   - Sign up at [console.groq.com](https://console.groq.com)
   - Create a new API key
   - Keep it ready for the next step

3. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import this repository
   - Add environment variable:
     - Key: `GROQ_API_KEY`
     - Value: Your Groq API key
   - Click "Deploy"

4. **Done!** 
   - Your app will be live in about 2-3 minutes
   - Visit the provided URL to start using the parser

## Local Development

```bash
# Install dependencies
npm install

# Create .env.local file
cp .env.local.example .env.local
# Edit .env.local and add your GROQ_API_KEY

# Run development server
npm run dev

# Build for production
npm run build
```

## Features

- 📄 Parse PDF and DOCX event documents
- 🤖 AI-powered extraction using Groq LLM
- 📊 Extract meeting rooms, F&B, accommodations, AV, and financials
- 💾 Export to JSON
- 🎨 Beautiful Groupize-themed UI

## Support

For issues or questions, please open an issue on GitHub.