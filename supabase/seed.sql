-- Optional seed for local/dev after creating your admin user in Auth.
-- Replace USER_ID with your auth.users.id, then run in SQL Editor.
--
-- Example:
--   select id from auth.users;
--
-- Or leave user_id to auth.uid() and run while authenticated via the app.

-- Ground News sample (one company + contact + deal + activity)
-- Uncomment and set :user_id if running from SQL editor as service role.

/*
insert into public.companies (
  user_id, name, website, category, priority,
  youtube_fit, instagram_fit, creator_spend, thematic_fit, contactability, score,
  evidence, comparable_channels, personalization_hook, exclusivity_conflicts,
  evidence_url, evidence_confidence, status, next_action, notes
) values (
  'USER_ID'::uuid,
  'Ground News',
  'https://ground.news',
  'News / media literacy',
  'A+',
  5, 5, 5, 5, 5, 5,
  'Repeated sponsor across geopolitics, defence, politics and long-form analysis channels.',
  'Perun; The Operations Room; Search Party; TLDR Daily; Rationality Rules',
  'Audience already comes to understand complex international stories; position Ground News as a natural research habit, not an inserted ad.',
  'News/media-analysis category may conflict with direct competitors.',
  'https://sponsorradar.com/channels/perunau',
  'Verified – comparable channels',
  'Not contacted',
  'Review contacts + personalize first touch',
  'Best first non-Proton target. Strong evidence of creator-led acquisition and long-form YouTube sponsorships.'
)
on conflict (user_id, name) do nothing;

insert into public.contacts (
  user_id, company_id, name, contact_rank, job_title, employer, contact_type,
  why_this_contact, linkedin_url, verification_confidence, source_url,
  personalization, outreach_status, notes, is_placeholder
)
select
  c.user_id, c.id, 'Matt Forner', 1, 'Creator Partnerships', 'Ground News', 'Internal',
  'Builds and scales creator partnership programs; publicly discusses YouTube sponsorship economics and audience alignment.',
  'https://www.linkedin.com/in/mattforner', 'High', 'https://www.linkedin.com/in/mattforner',
  'Lead with audience trust/alignment rather than projected views alone.',
  'Not contacted', 'Named contact verified from current public profile/search evidence.', false
from public.companies c
where c.name = 'Ground News' and c.user_id = 'USER_ID'::uuid
limit 1;

insert into public.deals (
  user_id, company_id, name, stage, priority, category, score,
  currency, next_action, exclusivity, evidence_url, notes
)
select
  c.user_id, c.id, 'Ground News — Sponsorship', 'Researching', 'A+',
  'News / media literacy', 5, 'EUR',
  'Review contacts + personalize first touch',
  'News/media-analysis category may conflict with direct competitors.',
  'https://sponsorradar.com/channels/perunau',
  'Best first non-Proton target.'
from public.companies c
where c.name = 'Ground News' and c.user_id = 'USER_ID'::uuid
limit 1;

insert into public.activities (user_id, company_id, type, comment)
select c.user_id, c.id, 'note', 'Seed note: start outreach with LinkedIn to Creator Partnerships.'
from public.companies c
where c.name = 'Ground News' and c.user_id = 'USER_ID'::uuid
limit 1;
*/
