-- Password for all seeded users is 'password' (bcrypt hashed)
INSERT INTO users (name, email, password, role, provider) VALUES
('Bhumi Admin', 'admin@bhumi.org', '$2a$10$gRstb8.w5jN9A59Q7P9dO.4gJ/WnN5V.m8lF/N90D11jH/9Y093jO', 'ROLE_ADMIN', 'LOCAL'),
('John Organizer', 'organizer@bhumi.org', '$2a$10$gRstb8.w5jN9A59Q7P9dO.4gJ/WnN5V.m8lF/N90D11jH/9Y093jO', 'ROLE_ORGANIZER', 'LOCAL'),
('Jane Participant', 'participant@bhumi.org', '$2a$10$gRstb8.w5jN9A59Q7P9dO.4gJ/WnN5V.m8lF/N90D11jH/9Y093jO', 'ROLE_PARTICIPANT', 'LOCAL'),
('Bob Visitor', 'visitor@bhumi.org', '$2a$10$gRstb8.w5jN9A59Q7P9dO.4gJ/WnN5V.m8lF/N90D11jH/9Y093jO', 'ROLE_VISITOR', 'LOCAL');

-- Insert events
INSERT INTO events (title, description, location, start_date, end_date, price, capacity, available_seats, status, image_url, category_id, organizer_id) VALUES
('Green Revolution: Tree Plantation Drive', 'Join us in planting 1000 saplings across Delhi NCR. Get a chance to contribute to environmental sustainability.', 'Central Park, Delhi', '2026-06-15 09:00:00+00', '2026-06-15 13:00:00+00', 0.00, 100, 98, 'PUBLISHED', 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09', 2, 2),
('Spring Boot & React Integration Workshop', 'Hands-on training session for building modern web applications using Spring Boot 3 backend and React frontend.', 'Zoom Online Meeting', '2026-07-20 14:00:00+00', '2026-07-20 17:00:00+00', 499.00, 50, 49, 'PUBLISHED', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97', 1, 2),
('Yoga & Mindfulness Session', 'Morning wellness session focusing on yoga and breathing techniques. Suitable for beginners.', 'Bhumi Community Center, Bangalore', '2026-06-10 07:00:00+00', '2026-06-10 08:30:00+00', 150.00, 30, 30, 'PUBLISHED', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b', 3, 2);

-- Insert registrations
INSERT INTO registrations (event_id, user_id, status, ticket_quantity, total_price, payment_status, payment_id) VALUES
(1, 3, 'CONFIRMED', 2, 0.00, 'COMPLETED', 'PAY-MOCK12345'),
(2, 3, 'CONFIRMED', 1, 499.00, 'COMPLETED', 'PAY-MOCK67890');

-- Insert tickets
INSERT INTO tickets (ticket_number, registration_id, event_id, attendee_name, attendee_email, is_checked_in) VALUES
('TKT-TREEPLANT-001', 1, 1, 'Jane Participant', 'participant@bhumi.org', false),
('TKT-TREEPLANT-002', 1, 1, 'Jane Friend', 'friend@bhumi.org', false),
('TKT-SPRINGBT-001', 2, 2, 'Jane Participant', 'participant@bhumi.org', false);

-- Insert reviews
INSERT INTO reviews (event_id, user_id, rating, comment) VALUES
(1, 3, 5, 'An excellent event! Very well-organized tree plantation drive.'),
(2, 3, 4, 'Very informative technical session. Learned a lot.');

-- Insert notifications
INSERT INTO notifications (user_id, title, message, type, is_read) VALUES
(3, 'Registration Confirmed', 'Your registration for Green Revolution: Tree Plantation Drive has been confirmed.', 'EVENT_REGISTRATION', false),
(3, 'Workshop Registration', 'Your registration for Spring Boot & React Integration Workshop has been confirmed.', 'EVENT_REGISTRATION', true);
