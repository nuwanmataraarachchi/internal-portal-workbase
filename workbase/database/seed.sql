INSERT INTO users (username, email, password_hash, name, role, details)
VALUES ('Admin', 'admin@example.com', '$2b$12$sm75Pt2ZhJfwTOA7heeStePFgAbQPIgFiitBNGgexIYqVZeXFQi9W', 'Admin', 'admin', '{"department":"Operations","title":"Portal administrator"}')
ON CONFLICT (username) DO NOTHING;

INSERT INTO users (username, email, password_hash, name, role, details)
VALUES ('kasun-dev', 'kasun@example.com', '$2b$12$W1qRNoxSoVutK13AaEn9y./Psfhe2pFaj.v3ApfxzKivZLQR2p0DG', 'Kasun Perera', 'software_engineer', '{"department":"Engineering","title":"Software Engineer"}')
ON CONFLICT (username) DO NOTHING;

INSERT INTO users (username, email, password_hash, name, role, details)
VALUES ('rosy-ba', 'rosy@example.com', '$2b$12$3EHoSMZ32SuQyamXqjJcLOUU6iXwQW.MMGYslbULOsPT3cjkKI1mK', 'Rosy', 'business_analyst', '{"department":"Product","title":"Business Analyst"}')
ON CONFLICT (username) DO NOTHING;

INSERT INTO announcements (title, body, author_name)
SELECT 'Welcome to Workbase', 'Use this space to share updates, launches, and reminders with the team.', 'Alex'
WHERE NOT EXISTS (SELECT 1 FROM announcements);
