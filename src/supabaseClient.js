import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ltbamwvcrxazixjpvpav.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0YmFtd3Zjcnhheml4anB2cGF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3NjYwODMsImV4cCI6MjA4ODM0MjA4M30.7Shu6tJ7ELXv4h7AR9n0MU86kKM1UCdqwkAs4yGVLcU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
