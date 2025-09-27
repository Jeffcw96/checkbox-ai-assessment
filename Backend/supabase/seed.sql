INSERT INTO users (email, name)
VALUES ('jeffdevslife@gmail.com', 'Jeff')
ON CONFLICT (email) DO NOTHING;