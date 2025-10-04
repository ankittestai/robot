import { createClient } from '@supabase/supabase-js'

// Replace these with YOUR keys from Step 4!
const supabaseUrl = 'https://ydawgpiiumqaxtyjjkfk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkYXdncGlpdW1xYXh0eWpqa2ZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0OTg2MjMsImV4cCI6MjA2NjA3NDYyM30.7Z8EYnIM2g7YFOZ4xRyZQoSGcyM6p3NLQiZy5PwUCuo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
