-- Seed data for Rated Uganda
-- Run AFTER schema.sql

-- ============================================================
-- Roles
-- ============================================================
INSERT INTO roles (role_name, description) VALUES
('reader', 'Can read, comment, and manage preferences'),
('journalist', 'Can create and submit articles'),
('editor', 'Can review and approve articles'),
('administrator', 'Manages categories, districts, and user approvals'),
('super_admin', 'Manages editors, admin accounts, and system access');

-- ============================================================
-- Super admin user
-- Plaintext password: Admin123!
-- Bcrypt hash generated with cost 10
-- ============================================================
INSERT INTO users (full_name, email, password, phone_number) VALUES
('System Administrator', 'admin@rateduganda.ug', '$2b$10$lMt6sie9Yk/.fIoKCbW2TeSg8W3W/e6vkVo0SVCk3dmQT1ia5iE3S', '+256700000000');

SET @admin_user_id = LAST_INSERT_ID();

INSERT INTO user_roles (user_id, role_id) VALUES
(@admin_user_id, (SELECT role_id FROM roles WHERE role_name = 'super_admin'));

INSERT INTO super_admin (user_id, access_level, system_permissions) VALUES
(@admin_user_id, 'full', '{"users": true, "roles": true, "system": true}');

-- ============================================================
-- Demo plain administrator user
-- Plaintext password: AdminPass123!
-- ============================================================
INSERT INTO users (full_name, email, password, phone_number) VALUES
('Demo Administrator', 'demo.admin@rateduganda.ug', '$2b$10$lWK64LRdUxgp7CvFuSbHJ.T1cy4w202/Vx12dCZ9NZJ36X4V76d/u', '+256733333333');

SET @plain_admin_user_id = LAST_INSERT_ID();

INSERT INTO user_roles (user_id, role_id) VALUES
(@plain_admin_user_id, (SELECT role_id FROM roles WHERE role_name = 'administrator'));

INSERT INTO admin (user_id, admin_level, permissions) VALUES
(@plain_admin_user_id, 'standard', '{"categories": true, "districts": true, "users": true}');

-- ============================================================
-- Demo journalist user
-- Plaintext password: DemoPass123!
-- ============================================================
INSERT INTO users (full_name, email, password, phone_number) VALUES
('Diana Nakato', 'demo.journalist@rateduganda.ug', '$2b$10$ggOD2OsxeSmEiPcmlie5b.0/Yt/juMO4UGSsmNZ6eI/Y5XW7VZpGa', '+256711111111');

SET @journalist_user_id = LAST_INSERT_ID();

INSERT INTO user_roles (user_id, role_id) VALUES
(@journalist_user_id, (SELECT role_id FROM roles WHERE role_name = 'journalist'));

INSERT INTO journalists (user_id, staff_number, specialization, employment_date, verification_status) VALUES
(@journalist_user_id, 'J-1001', 'Politics', '2024-01-15', 'verified');

SET @demo_journalist_id = LAST_INSERT_ID();

-- ============================================================
-- Demo editor user
-- Plaintext password: EditorPass123!
-- ============================================================
INSERT INTO users (full_name, email, password, phone_number) VALUES
('Peter Okello', 'demo.editor@rateduganda.ug', '$2b$10$MQKBfjdSlHfx5wnR32M8r.g6JvtEJzR9LsplbmQvSaTq64bgs1RYi', '+256722222222');

SET @editor_user_id = LAST_INSERT_ID();

INSERT INTO user_roles (user_id, role_id) VALUES
(@editor_user_id, (SELECT role_id FROM roles WHERE role_name = 'editor'));

INSERT INTO editors (user_id, editor_level, department, approval_limit) VALUES
(@editor_user_id, 'senior', 'National Desk', 10);

-- ============================================================
-- Categories
-- ============================================================
INSERT INTO categories (category_name, description, admin_id) VALUES
('Politics', 'Political news, governance, and policy updates', 1),
('Business', 'Commerce, markets, investment, and economy', 1),
('Sports', 'Local and international sports coverage', 1),
('Technology', 'Innovation, startups, and digital affairs', 1),
('Health', 'Public health, medical news, and wellness', 1);

-- ============================================================
-- Districts
-- ============================================================
INSERT INTO districts (district_name, region, admin_id) VALUES
('Kampala', 'Central', 1),
('Mukono', 'Central', 1),
('Wakiso', 'Central', 1),
('Jinja', 'Eastern', 1),
('Mbarara', 'Western', 1);

-- ============================================================
-- Sample published articles (staff-written)
-- ============================================================
INSERT INTO articles (title, content, status, llm_checked, source_type, published_at, journalist_id, category_id, district_id, cover_image_url, cover_image_credit) VALUES
(
  'Kampala Unveils New Bus Terminal to Ease Rush-Hour Congestion',
  'Kampala Capital City Authority has opened a refurbished long-distance bus terminal on the edge of the central business district, aiming to reduce the morning and evening gridlock that has long plagued travellers leaving the city. Officials say the terminal will consolidate services for regional routes and provide dedicated loading bays, waiting areas, and sanitation blocks. Transport operators welcomed the move but called for stricter enforcement of lane discipline to prevent old habits from returning. Commuters using the terminal on the first day reported shorter boarding times, although some noted that signage is still limited and several kiosks remain unopened. City planners say phase two will add a digital ticketing office and a covered pedestrian walkway by the end of the financial year.',
  'published', TRUE, 'staff', NOW() - INTERVAL 1 DAY,
  @demo_journalist_id, 1, 1, '/assets/placeholder-cover.jpg', NULL
),
(
  'Ugandan Shilling Holds Steady as Exporters Return to the Market',
  'The Ugandan shilling showed little movement against the dollar on Wednesday as corporate exporters sold foreign currency to meet month-end obligations, offsetting demand from manufacturers importing raw materials. Currency traders in Kampala said the unit remained within a narrow band, supported by portfolio inflows into government securities. Analysts cautioned that global commodity price swings could test the currency next quarter, particularly if oil prices remain volatile. The central bank has reiterated its commitment to a flexible exchange-rate regime while stepping in only to smooth excessive short-term volatility. Small business owners in downtown Kampala said a stable shilling helps them plan purchases, though many still worry about high domestic borrowing costs.',
  'published', TRUE, 'staff', NOW() - INTERVAL 2 DAY,
  @demo_journalist_id, 2, 1, '/assets/placeholder-cover.jpg', NULL
),
(
  'Mbarara Hospital Expands Neonatal Unit with New Equipment',
  'Mbarara Regional Referral Hospital has commissioned an expanded neonatal intensive care unit fitted with incubators, phototherapy units, and patient monitors donated through a public-private partnership. Hospital administrators said the expansion will cut referrals of premature babies to facilities outside the region and improve survival rates for low-birth-weight infants. Nurses on the ward received refresher training ahead of the launch, and a biomedical engineer has been attached to the unit to maintain the new devices. Parents interviewed at the hospital praised the quieter, more spacious layout but urged the government to ensure a steady supply of oxygen and specialized medicines. District health officials said the upgrade is part of a broader effort to strengthen regional referral services across western Uganda.',
  'published', TRUE, 'staff', NOW() - INTERVAL 3 DAY,
  @demo_journalist_id, 5, 5, '/assets/placeholder-cover.jpg', NULL
);

-- ============================================================
-- Scraped sources (placeholder feed URLs, all inactive)
-- Agent 4 will verify real feed URLs and flip is_active=true
-- ============================================================
INSERT INTO scraped_sources (source_name, feed_url, site_url, is_active) VALUES
('Daily Monitor', 'PENDING_VERIFICATION', 'https://www.monitor.co.ug', FALSE),
('New Vision', 'PENDING_VERIFICATION', 'https://www.newvision.co.ug', FALSE),
('The Independent', 'PENDING_VERIFICATION', 'https://www.independent.co.ug', FALSE),
('Nile Post', 'PENDING_VERIFICATION', 'https://nilepost.co.ug', FALSE),
('PML Daily', 'PENDING_VERIFICATION', 'https://pmldaily.com', FALSE),
('Chimp Reports', 'PENDING_VERIFICATION', 'https://chimpreports.com', FALSE);
