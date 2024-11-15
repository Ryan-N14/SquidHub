import { createClient } from '@supabase/supabase-js';

// Replace with your Supabase URL and public API key
const supabaseUrl = 'https://jelcixkhjblpryomxnta.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplbGNpeGtoamJscHJ5b214bnRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE0NDg2MDgsImV4cCI6MjA0NzAyNDYwOH0.REPH9URQcfWVvwdOsRu9IJwMXauf0KvdsPC8Gb8Gu9g';

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;