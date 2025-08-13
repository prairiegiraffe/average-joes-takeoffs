-- Diagnostic script - Run this first to see what tables and columns exist
-- Copy and paste this into Supabase SQL Editor

-- Check all existing tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check columns for each table (if they exist)
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
ORDER BY table_name, ordinal_position;