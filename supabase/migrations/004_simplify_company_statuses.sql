-- Align company statuses with the simplified deal pipeline.
update public.companies set status = 'Researching' where status = 'Not contacted' or status is null;
update public.companies set status = 'Contacted' where status = 'Ready to Contact';
update public.companies set status = 'Follow-up' where status = 'Waiting Reply';
update public.companies set status = 'Interested' where status = 'Media Kit Sent';
