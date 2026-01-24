-- Enable Row Level Security on all tables
-- This blocks direct access via Supabase's PostgREST API
-- Your app uses Payload CMS which connects via direct PostgreSQL connection,
-- so it bypasses RLS and will continue to work normally.

-- Users & Sessions
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users_sessions ENABLE ROW LEVEL SECURITY;

-- Content Tables
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_pages_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_pages_quick_summary_items ENABLE ROW LEVEL SECURITY;

-- Form Data
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses_q9 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Payload Internal Tables
ALTER TABLE public.payload_kv ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payload_locked_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payload_locked_documents_rels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payload_migrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payload_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payload_preferences_rels ENABLE ROW LEVEL SECURITY;

-- By default, RLS denies all access when enabled with no policies.
-- This is the desired behavior since Payload connects directly to PostgreSQL
-- and bypasses RLS entirely.

-- OPTIONAL: If you ever need to allow public read access to certain tables
-- (e.g., for a public API), you can create policies like this:
--
-- CREATE POLICY "Allow public read access" ON public.statistics
--   FOR SELECT USING (true);
--
-- CREATE POLICY "Allow public read access" ON public.faqs
--   FOR SELECT USING (true);
--
-- CREATE POLICY "Allow public read access" ON public.resources
--   FOR SELECT USING (true);

-- Verify RLS is enabled (run this after to confirm):
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
