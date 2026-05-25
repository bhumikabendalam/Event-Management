-- Update users
UPDATE users SET name = 'EventFlow Admin', email = 'admin@eventflow.org' WHERE email = 'admin@bhumi.org';
UPDATE users SET email = 'organizer@eventflow.org' WHERE email = 'organizer@bhumi.org';
UPDATE users SET email = 'participant@eventflow.org' WHERE email = 'participant@bhumi.org';
UPDATE users SET email = 'visitor@eventflow.org' WHERE email = 'visitor@bhumi.org';

-- Update events location
UPDATE events SET location = 'EventFlow Community Center, Bangalore' WHERE location = 'Bhumi Community Center, Bangalore';

-- Update tickets
UPDATE tickets SET attendee_email = 'participant@eventflow.org' WHERE attendee_email = 'participant@bhumi.org';
UPDATE tickets SET attendee_email = 'friend@eventflow.org' WHERE attendee_email = 'friend@bhumi.org';
