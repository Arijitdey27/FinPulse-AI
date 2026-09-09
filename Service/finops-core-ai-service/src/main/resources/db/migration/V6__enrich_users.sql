ALTER TABLE users
ADD COLUMN IF NOT EXISTS name VARCHAR(100);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS description VARCHAR(255);

UPDATE users
SET name = COALESCE(
    NULLIF(name, ''),
    NULLIF(initcap(replace(split_part(email, '@', 1), '.', ' ')), ''),
    'User'
)
WHERE name IS NULL OR name = '';

ALTER TABLE users
ALTER COLUMN name SET NOT NULL;
