import { NextResponse } from 'next/server'
import mammoth from 'mammoth'
import { Groq } from 'groq-sdk'
import pdf from 'pdf-parse'

// Helper function to extract text from PDF using pdf-parse
async function extractPDFText(buffer) {
  try {
    console.log('Attempting PDF extraction with pdf-parse, buffer size:', buffer.length)
    
    const data = await pdf(buffer)
    console.log('PDF info:', {
      pages: data.numpages,
      info: data.info,
      textLength: data.text.length
    })
    
    if (data.text && data.text.length > 100) {
      return data.text
    } else {
      return `PDF extraction returned limited content (${data.text?.length || 0} characters).
      
Please try:
1. Converting your PDF to a Word document (.docx) and uploading that instead
2. Copying and pasting the text content manually
3. Using a different PDF file

Extracted text:
${data.text || 'No text found'}`
    }
  } catch (error) {
    console.error('Error extracting PDF text:', error)
    
    // Fallback to basic extraction if pdf-parse fails
    try {
      const text = buffer.toString('utf8')
      const lines = []
      const chunks = text.split(/\n|\r/)
      
      for (const chunk of chunks) {
        const cleaned = chunk
          .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
        
        if (cleaned.length > 3) {
          lines.push(cleaned)
        }
      }
      
      const extractedText = lines.join('\n')
      return `PDF parsing encountered an error. Partial extraction (${extractedText.length} characters):
${extractedText.substring(0, 1000)}...

Please try converting to Word (.docx) format for better results.`
    } catch (fallbackError) {
      return 'Unable to extract text from this PDF. Please try converting to Word (.docx) format or paste the text manually.'
    }
  }
}

// Helper function to extract text from DOCX
async function extractDOCXText(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  } catch (error) {
    console.error('Error extracting DOCX text:', error)
    throw new Error('Failed to extract DOCX text')
  }
}

// JSON parsing helper functions (from the original Python code)
function extractJsonBoundaries(text) {
  // Remove markdown if present
  if (text.includes('```json')) {
    text = text.split('```json')[1].split('```')[0]
  } else if (text.includes('```')) {
    const parts = text.split('```')
    if (parts.length >= 3) {
      text = parts[1]
    }
  }
  
  // Find the first opening brace
  let startIdx = -1
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '{') {
      startIdx = i
      break
    }
  }
  
  if (startIdx === -1) {
    throw new Error('No JSON object found in response')
  }
  
  // Find the matching closing brace
  let braceCount = 0
  let inString = false
  let escapeNext = false
  let endIdx = -1
  
  for (let i = startIdx; i < text.length; i++) {
    const char = text[i]
    
    if (escapeNext) {
      escapeNext = false
      continue
    }
    
    if (char === '\\' && inString) {
      escapeNext = true
      continue
    }
    
    if (char === '"' && !escapeNext) {
      inString = !inString
      continue
    }
    
    if (!inString) {
      if (char === '{') {
        braceCount++
      } else if (char === '}') {
        braceCount--
        if (braceCount === 0) {
          endIdx = i
          break
        }
      }
    }
  }
  
  if (endIdx === -1) {
    throw new Error('No complete JSON object found - unmatched braces')
  }
  
  return { startIdx, endIdx }
}

function cleanControlCharacters(text) {
  let cleaned = ''
  let inString = false
  let escapeNext = false
  
  for (const char of text) {
    if (escapeNext) {
      cleaned += char
      escapeNext = false
      continue
    }
    
    if (char === '\\') {
      escapeNext = true
      cleaned += char
      continue
    }
    
    if (char === '"' && !escapeNext) {
      inString = !inString
      cleaned += char
      continue
    }
    
    if (inString) {
      const charCode = char.charCodeAt(0)
      if (charCode < 32 && ![9, 10, 13].includes(charCode)) {
        cleaned += ' '
      } else if ([10, 13, 9].includes(charCode)) {
        if (charCode === 10) cleaned += '\\n'
        else if (charCode === 13) cleaned += '\\r'
        else if (charCode === 9) cleaned += '\\t'
      } else {
        cleaned += char
      }
    } else {
      cleaned += char
    }
  }
  
  return cleaned
}

function fixJsonStructure(jsonText) {
  // Fix unquoted property names
  jsonText = jsonText.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
  
  // Remove trailing commas
  jsonText = jsonText.replace(/,(\s*[}\]])/g, '$1')
  
  // Fix single quotes
  jsonText = jsonText.replace(/(\w+)\s*:\s*'([^']*)'/g, '$1: "$2"')
  
  // Fix missing commas between properties
  jsonText = jsonText.replace(/(:\s*(?:"[^"]*"|\d+\.?\d*|true|false|null))\s+("[\\w_]+"\s*:)/g, '$1, $2')
  
  // Fix missing commas between array elements
  jsonText = jsonText.replace(/(\})\s+(\{)/g, '$1, $2')
  
  // Fix boolean and null values
  jsonText = jsonText.replace(/\b(True|TRUE)\b/g, 'true')
  jsonText = jsonText.replace(/\b(False|FALSE)\b/g, 'false')
  jsonText = jsonText.replace(/\b(None|NULL|null)\b/g, 'null')
  
  return jsonText
}

function enhancedCleanJsonResponse(responseText) {
  try {
    const { startIdx, endIdx } = extractJsonBoundaries(responseText)
    let jsonText = responseText.substring(startIdx, endIdx + 1)
    
    jsonText = cleanControlCharacters(jsonText)
    jsonText = fixJsonStructure(jsonText)
    
    // Try to parse
    JSON.parse(jsonText)
    return jsonText
  } catch (error) {
    throw error
  }
}

function parseWithFallback(responseText) {
  const strategies = [
    enhancedCleanJsonResponse,
    (text) => {
      // Simple extraction strategy
      const start = text.indexOf('{')
      const end = text.lastIndexOf('}')
      if (start !== -1 && end !== -1) {
        return text.substring(start, end + 1)
      }
      throw new Error('No JSON found')
    }
  ]
  
  for (const strategy of strategies) {
    try {
      const cleanedJson = strategy(responseText)
      const parsedData = JSON.parse(cleanedJson)
      return parsedData
    } catch (error) {
      continue
    }
  }
  
  return {
    parsing_error: true,
    error_message: 'All parsing strategies failed',
    event_info: {},
    meeting_rooms: [],
    sleeping_rooms: [],
    food_beverage: [],
    audio_visual: [],
    financial_terms: {},
    vat_details: {},
    totals: {}
  }
}

function calculateTotals(data) {
  const financialTerms = data.financial_terms || {}
  
  // Get rates
  let serviceRate = parseFloat(financialTerms.service_charge_rate || 0)
  if (serviceRate > 1) serviceRate = serviceRate / 100
  
  let taxRate = parseFloat(financialTerms.tax_rate || 0)
  if (taxRate > 1) taxRate = taxRate / 100
  
  let vatRate = parseFloat(financialTerms.vat_rate || 0)
  if (vatRate > 1) vatRate = vatRate / 100
  
  // Calculate totals
  const meetingRoomTotal = (data.meeting_rooms || []).reduce((sum, room) => 
    sum + parseFloat(room.room_rental || 0), 0)
  
  // Calculate sleeping room total
  let sleepingRoomTotal = 0
  for (const room of (data.sleeping_rooms || [])) {
    const numRooms = parseInt(room.number_of_rooms || 0)
    const numPersons = parseInt(room.number_of_persons || 0)
    const numNights = parseInt(room.number_of_nights || 0)
    const nightlyRate = parseFloat(room.nightly_rate || 0)
    const rateType = room.rate_type || 'per_room'
    
    let roomTotalCost
    if (rateType === 'per_person' && numPersons > 0) {
      roomTotalCost = numPersons * nightlyRate * numNights
    } else {
      roomTotalCost = numRooms * nightlyRate * numNights
    }
    
    room.total_room_cost = Math.round(roomTotalCost * 100) / 100
    sleepingRoomTotal += roomTotalCost
  }
  
  // Calculate F&B totals
  let fbSubtotal = 0
  for (const item of (data.food_beverage || [])) {
    const attendees = parseInt(item.attendees || 0)
    const perPersonCost = parseFloat(item.per_person_cost || 0)
    const calculatedTotal = attendees * perPersonCost
    const providedTotal = parseFloat(item.total_cost || 0)
    const finalTotal = Math.max(calculatedTotal, providedTotal)
    
    item.total_cost = Math.round(finalTotal * 100) / 100
    fbSubtotal += finalTotal
  }
  
  // Calculate AV totals
  let avTotal = 0
  for (const item of (data.audio_visual || [])) {
    const quantity = parseInt(item.quantity || 0)
    const unitCost = parseFloat(item.unit_cost || 0)
    const calculatedTotal = quantity * unitCost
    const providedTotal = parseFloat(item.total_cost || 0)
    const finalTotal = Math.max(calculatedTotal, providedTotal)
    
    item.total_cost = Math.round(finalTotal * 100) / 100
    avTotal += finalTotal
  }
  
  // Apply charges
  const serviceCharge = (meetingRoomTotal + fbSubtotal + avTotal) * serviceRate
  const taxAmount = (fbSubtotal + serviceCharge) * taxRate
  const vatAmount = (meetingRoomTotal + sleepingRoomTotal + fbSubtotal + avTotal + serviceCharge) * vatRate
  
  const fbTotal = fbSubtotal + serviceCharge + taxAmount
  const grandTotal = meetingRoomTotal + sleepingRoomTotal + fbTotal + avTotal + vatAmount
  
  data.totals = {
    meeting_room_rental_total: Math.round(meetingRoomTotal * 100) / 100,
    sleeping_room_total: Math.round(sleepingRoomTotal * 100) / 100,
    food_beverage_subtotal: Math.round(fbSubtotal * 100) / 100,
    audio_visual_total: Math.round(avTotal * 100) / 100,
    service_charge: Math.round(serviceCharge * 100) / 100,
    tax: Math.round(taxAmount * 100) / 100,
    vat: Math.round(vatAmount * 100) / 100,
    food_beverage_total: Math.round(fbTotal * 100) / 100,
    grand_total: Math.round(grandTotal * 100) / 100
  }
  
  return data
}

// Create the extraction prompt
function createExtractionPrompt(text) {
  return `You are an expert document parser specializing in event, hotel, and meeting documents. Your task is to extract ALL information with maximum precision and return it as valid JSON.

CRITICAL JSON OUTPUT RULES:
1. Return ONLY valid JSON - no explanations, commentary, or text outside the JSON object
2. Use double quotes for ALL property names and string values
3. Never use trailing commas
4. All dates must be in YYYY-MM-DD format (convert from any format you find)
5. All monetary values must be numbers without currency symbols, commas, or text
6. For missing/unknown values: use "" for strings, 0 for numbers, false for booleans

RETURN THIS EXACT STRUCTURE:

{
  "event_info": {
    "organization": "",
    "event_name": "",
    "venue": "",
    "customer": "",
    "phone": "",
    "contact_person": "",
    "event_dates": ""
  },
  "meeting_rooms": [
    {
      "date": "YYYY-MM-DD",
      "day_name": "",
      "time": "",
      "function": "",
      "room_setup": "",
      "location": "",
      "capacity": 0,
      "room_rental": 0.0,
      "event_order_number": ""
    }
  ],
  "sleeping_rooms": [
    {
      "check_in_date": "YYYY-MM-DD",
      "check_out_date": "YYYY-MM-DD",
      "room_type": "",
      "number_of_rooms": 0,
      "number_of_nights": 0,
      "number_of_persons": 0,
      "nightly_rate": 0.0,
      "rate_type": "per_room",
      "total_room_cost": 0.0,
      "guest_name": "",
      "special_requests": "",
      "event_order_number": ""
    }
  ],
  "food_beverage": [
    {
      "date": "YYYY-MM-DD",
      "day_name": "",
      "time": "",
      "product_name": "",
      "attendees": 0,
      "per_person_cost": 0.0,
      "total_cost": 0.0,
      "location": "",
      "meal_type": "",
      "event_order_number": ""
    }
  ],
  "audio_visual": [
    {
      "date": "YYYY-MM-DD",
      "time": "",
      "equipment_name": "",
      "description": "",
      "quantity": 0,
      "unit_cost": 0.0,
      "total_cost": 0.0,
      "location": "",
      "supplier": "",
      "event_order_number": ""
    }
  ],
  "financial_terms": {
    "tax_rate": 0.0,
    "vat_rate": 0.0,
    "service_charge_rate": 0.0,
    "food_beverage_minimum": 0.0,
    "currency": "USD"
  },
  "vat_details": {
    "vat_applicable": false,
    "vat_registration_number": "",
    "vat_exemption_details": ""
  },
  "totals": {
    "meeting_room_rental_total": 0.0,
    "sleeping_room_total": 0.0,
    "food_beverage_subtotal": 0.0,
    "audio_visual_total": 0.0,
    "service_charge": 0.0,
    "tax": 0.0,
    "vat": 0.0,
    "food_beverage_total": 0.0,
    "grand_total": 0.0
  }
}

Extract from this document:

${text.substring(0, 16000)}

Remember: Return ONLY the JSON object, no other text.`
}

export async function POST(request) {
  try {
    const url = new URL(request.url)
    const action = url.searchParams.get('action')
    
    if (action === 'extract') {
      // Handle text extraction only
      const formData = await request.formData()
      const file = formData.get('file')
      
      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 })
      }
      
      const buffer = Buffer.from(await file.arrayBuffer())
      let text = ''
      
      console.log('File type:', file.type)
      console.log('File size:', file.size)
      
      if (file.type === 'application/pdf') {
        text = await extractPDFText(buffer)
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        text = await extractDOCXText(buffer)
      } else {
        return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
      }
      
      return NextResponse.json({ text })
    } else {
      // Handle full parsing
      const body = await request.json()
      const { text, apiKey } = body
      
      if (!text || !apiKey) {
        return NextResponse.json({ error: 'Missing text or API key' }, { status: 400 })
      }
      
      console.log('Parsing text of length:', text.length)
      
      const groq = new Groq({ apiKey })
      
      // Call Groq API
      const prompt = createExtractionPrompt(text)
      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a precise JSON extraction assistant. Return only valid JSON with no explanations or text outside the JSON object.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.0,
        max_tokens: 6000
      })
      
      const responseText = response.choices[0].message.content.trim()
      console.log('LLM response length:', responseText.length)
      console.log('First 200 chars of LLM response:', responseText.substring(0, 200))
      
      // Parse and calculate totals
      let parsedData = parseWithFallback(responseText)
      parsedData = calculateTotals(parsedData)
      
      console.log('Parsed data keys:', Object.keys(parsedData))
      console.log('Event info:', parsedData.event_info)
      console.log('Meeting rooms count:', parsedData.meeting_rooms?.length || 0)
      console.log('Sleeping rooms count:', parsedData.sleeping_rooms?.length || 0)
      
      return NextResponse.json(parsedData)
    }
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      parsing_error: true,
      error_message: error.message,
      event_info: {},
      meeting_rooms: [],
      sleeping_rooms: [],
      food_beverage: [],
      audio_visual: [],
      financial_terms: {},
      vat_details: {},
      totals: {}
    }, { status: 500 })
  }
}