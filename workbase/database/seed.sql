INSERT INTO announcements (title, body, author_name)
SELECT 'Welcome to Workbase', 'Use this space to share updates, launches, and reminders with the team.', 'Alex'
WHERE NOT EXISTS (SELECT 1 FROM announcements);
