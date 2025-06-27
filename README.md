# Event Document Parser

A modern web application that extracts structured data from event PDFs and Word documents using AI. Built with React, Next.js, and powered by Groq's LLM API.

![Event Document Parser](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## Features

- 📄 **Multi-format Support**: Parse PDF and DOCX files
- 🤖 **AI-Powered Extraction**: Uses Groq's Llama 3.3 70B model for intelligent parsing
- 📊 **Comprehensive Data Extraction**:
  - Event information and details
  - Meeting room bookings
  - Food & beverage orders
  - Accommodation details
  - Audio-visual equipment
  - Financial summaries with tax calculations
- 🎨 **Modern UI**: Beautiful Groupize-themed interface
- 📥 **Export Options**: Download parsed data as JSON
- 🔄 **Smart Retry Logic**: Multiple parsing strategies for reliability

## Tech Stack

- **Frontend**: React 18, Next.js 14
- **Styling**: Custom CSS with CSS Variables
- **AI/LLM**: Groq API (Llama 3.3 70B)
- **Document Processing**: pdf-parse, mammoth
- **Deployment**: Optimized for Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Groq API key (get one at [console.groq.com](https://console.groq.com))

### Installation

1. Clone the repository:
```bash
git clone https://github.com/pkumv1/event-document-parser-v2.git
cd event-document-parser-v2
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
GROQ_API_KEY=your_groq_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment to Vercel

### Option 1: Deploy with Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

### Option 2: Deploy via GitHub

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add environment variable:
   - Name: `GROQ_API_KEY`
   - Value: Your Groq API key
5. Deploy!

## Usage

1. **Configure API Key**: Enter your Groq API key in the sidebar
2. **Upload Document**: Drag and drop or click to upload a PDF/DOCX file
3. **Extract & Analyze**: Click "Analyze Document" to process
4. **View Results**: Browse extracted data in organized tabs
5. **Export**: Download the parsed data as JSON

## Project Structure

```
event-document-parser/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── parse/          # API endpoint for document parsing
│   │   ├── layout.js           # Root layout
│   │   ├── page.js             # Main page component
│   │   └── globals.css         # Global styles
│   └── components/             # React components
│       ├── Sidebar.js
│       ├── MainHeader.js
│       ├── FileUpload.js
│       ├── DocumentPreview.js
│       ├── AnalysisControls.js
│       ├── DataTabs.js
│       ├── MetricCards.js
│       ├── DataTable.js
│       └── ExportOptions.js
├── public/                     # Static assets
├── package.json
├── next.config.js
└── README.md
```

## API Documentation

### POST /api/parse

Parses uploaded documents and extracts structured event data.

**Request Body:**
```json
{
  "text": "Document text content",
  "apiKey": "Your Groq API key"
}
```

**Response:**
```json
{
  "event_info": {...},
  "meeting_rooms": [...],
  "sleeping_rooms": [...],
  "food_beverage": [...],
  "audio_visual": [...],
  "financial_terms": {...},
  "totals": {...}
}
```

### POST /api/parse?action=extract

Extracts text from uploaded files.

**Request:** FormData with file
**Response:** `{ "text": "Extracted text content" }`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GROQ_API_KEY` | Your Groq API key for LLM access | Yes |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with the Groupize design system
- Powered by Groq's Llama 3.3 70B model
- Inspired by enterprise event management needs

## Support

For issues and feature requests, please use the GitHub Issues page.

---

Made with ❤️ by the Groupize team