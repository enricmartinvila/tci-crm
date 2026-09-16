-- Add meeting activity type for call/meeting writeups.
alter type public.activity_type add value if not exists 'meeting';
