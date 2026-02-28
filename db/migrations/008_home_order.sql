ALTER TABLE users
ALTER COLUMN home_order
SET DEFAULT
'[
  {"id":"goals","position":1,"active":true},
  {"id":"day_counter","position":2,"active":true},
  {"id":"timer","position":3,"active":true},
  {"id":"stats","position":4,"active":true}
]'::jsonb;