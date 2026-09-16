-- Remap removed deal stages to the simplified pipeline.
-- Run in Supabase SQL Editor after deploying the UI change.

update public.deals
set stage = 'Contacted'
where stage = 'Ready to Contact';

update public.deals
set stage = 'Follow-up'
where stage = 'Waiting Reply';

update public.deals
set stage = 'Interested'
where stage = 'Media Kit Sent';
