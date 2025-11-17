import { createClient } from '@supabase/supabase-js';

// TODO: Substitua com a URL e a chave anônima do seu projeto Supabase
// FIX: Explicitly type as string to avoid literal type comparison error.
const supabaseUrl: string = 'https://mnlzeruerqwuhhgfaavy.supabase.co';
// FIX: Explicitly type as string to avoid literal type comparison error.
const supabaseAnonKey: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ubHplcnVlcnF3dWhoZ2ZhYXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MTkxMDUsImV4cCI6MjA3ODA5NTEwNX0.kIoiAQzdI5_xRWCWjUl-JX7D4D-PTCK2GA2ulksMF84';

if (supabaseUrl === 'SUA_URL_DO_SUPABASE' || supabaseAnonKey === 'SUA_CHAVE_ANON_DO_SUPABASE') {
    console.warn("Supabase não configurado. Por favor, adicione sua URL e chave anônima em supabaseClient.ts");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);