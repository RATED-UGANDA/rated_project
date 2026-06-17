SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS editorial_reviews;
DROP TABLE IF EXISTS article_views;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS media;
DROP TABLE IF EXISTS stock_images;
DROP TABLE IF EXISTS articles;
DROP TABLE IF EXISTS scraped_sources;
DROP TABLE IF EXISTS districts;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS super_admin;
DROP TABLE IF EXISTS admin;
DROP TABLE IF EXISTS editors;
DROP TABLE IF EXISTS readers;
DROP TABLE IF EXISTS journalists;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone_number VARCHAR(50) NULL,
  profile_picture VARCHAR(512) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE roles (
  role_id INT AUTO_INCREMENT PRIMARY KEY,
  role_name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_roles (
  user_role_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  role_id INT NOT NULL,
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY ux_user_role (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE journalists (
  journalist_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  staff_number VARCHAR(50) NULL,
  specialization VARCHAR(100) NULL,
  employment_date DATE NULL,
  verification_status ENUM('pending','verified','rejected') DEFAULT 'pending',
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE readers (
  reader_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  preferences JSON NULL,
  subscription_status ENUM('free','paid') DEFAULT 'free',
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE editors (
  editor_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  editor_level ENUM('junior','senior','lead') DEFAULT 'junior',
  department VARCHAR(100) NULL,
  approval_limit INT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE admin (
  admin_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  admin_level ENUM('standard','supervisor') DEFAULT 'standard',
  permissions JSON NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE super_admin (
  super_admin_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  access_level ENUM('full','limited') DEFAULT 'full',
  system_permissions JSON NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE categories (
  category_id INT AUTO_INCREMENT PRIMARY KEY,
  category_name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255) NULL,
  admin_id INT NULL,
  FOREIGN KEY (admin_id) REFERENCES admin(admin_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE districts (
  district_id INT AUTO_INCREMENT PRIMARY KEY,
  district_name VARCHAR(100) NOT NULL UNIQUE,
  region VARCHAR(100) NULL,
  admin_id INT NULL,
  FOREIGN KEY (admin_id) REFERENCES admin(admin_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE scraped_sources (
  source_id INT AUTO_INCREMENT PRIMARY KEY,
  source_name VARCHAR(100) NOT NULL,
  feed_url VARCHAR(512) NOT NULL,
  site_url VARCHAR(512) NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_scraped_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE stock_images (
  image_id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  image_url VARCHAR(512) NOT NULL,
  thumbnail_url VARCHAR(512) NOT NULL,
  credit_text VARCHAR(255) NOT NULL,
  source_provider VARCHAR(50) DEFAULT 'pexels',
  fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE articles (
  article_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  status ENUM('draft','pending_review','returned','published','rejected') DEFAULT 'draft',
  llm_checked BOOLEAN DEFAULT FALSE,
  source_type ENUM('staff','scraped') DEFAULT 'staff',
  source_name VARCHAR(255) NULL,
  source_url VARCHAR(512) NULL,
  original_author VARCHAR(255) NULL,
  cover_image_url VARCHAR(512) NULL,
  cover_image_credit VARCHAR(255) NULL,
  published_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  journalist_id INT NULL,
  category_id INT NULL,
  district_id INT NULL,
  FOREIGN KEY (journalist_id) REFERENCES journalists(journalist_id) ON DELETE SET NULL,
  FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL,
  FOREIGN KEY (district_id) REFERENCES districts(district_id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_category (category_id),
  INDEX idx_district (district_id),
  INDEX idx_llm_checked (llm_checked),
  INDEX idx_source_type (source_type),
  INDEX idx_source_url (source_url),
  FULLTEXT INDEX idx_search (title, content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE media (
  media_id INT AUTO_INCREMENT PRIMARY KEY,
  file_url VARCHAR(512) NOT NULL,
  media_type VARCHAR(50) NULL,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  article_id INT NOT NULL,
  FOREIGN KEY (article_id) REFERENCES articles(article_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE comments (
  comment_id INT AUTO_INCREMENT PRIMARY KEY,
  comment_text TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  user_id INT NOT NULL,
  article_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (article_id) REFERENCES articles(article_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE article_views (
  view_id INT AUTO_INCREMENT PRIMARY KEY,
  viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  user_id INT NULL,
  article_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
  FOREIGN KEY (article_id) REFERENCES articles(article_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE editorial_reviews (
  review_id INT AUTO_INCREMENT PRIMARY KEY,
  review_status ENUM('approved','returned','rejected','auto_rejected') NOT NULL,
  feedback TEXT NULL,
  review_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  article_id INT NOT NULL,
  reviewer_id INT NULL,
  FOREIGN KEY (article_id) REFERENCES articles(article_id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
