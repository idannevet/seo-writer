import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const GENERATION_MODEL = 'gpt-4o'
export const GENERATION_TEMPERATURE = 0.82
