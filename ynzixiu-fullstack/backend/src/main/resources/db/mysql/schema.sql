-- ============================================================
-- 云南自修学校 · 五站合一 Java 版后端 表结构
-- 由 tools/gen_schema.py 自动生成，请勿手工修改
-- 方言：MySQL 8.0
-- ============================================================

DROP TABLE IF EXISTS users;
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  phone VARCHAR(32) NOT NULL UNIQUE,
  nickname VARCHAR(64),
  avatar VARCHAR(255),
  role VARCHAR(16) DEFAULT 'user',
  inviter_id INT DEFAULT NULL,
  invite_code VARCHAR(32) UNIQUE,
  password_hash VARCHAR(128),
  balance INT DEFAULT 0,
  created_at DATETIME,
  updated_at DATETIME,
  KEY idx_users_inviter (inviter_id)
);

DROP TABLE IF EXISTS sms_codes;
CREATE TABLE IF NOT EXISTS sms_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  phone VARCHAR(32) NOT NULL,
  code VARCHAR(16) NOT NULL,
  purpose VARCHAR(16) DEFAULT 'login',
  expired_at DATETIME NOT NULL,
  used TINYINT DEFAULT 0,
  created_at DATETIME,
  KEY idx_sms_phone (phone, purpose)
);

DROP TABLE IF EXISTS businesses;
CREATE TABLE IF NOT EXISTS businesses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(32),
  name VARCHAR(64) NOT NULL,
  char VARCHAR(8),
  color VARCHAR(16),
  tint VARCHAR(16),
  summary VARCHAR(128),
  tags TEXT,
  audience VARCHAR(255),
  intro TEXT,
  offers TEXT,
  sort INT DEFAULT 0
);

DROP TABLE IF EXISTS banners;
CREATE TABLE IF NOT EXISTS banners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kicker VARCHAR(64),
  title VARCHAR(255),
  action VARCHAR(32),
  to_url VARCHAR(255),
  theme VARCHAR(16) DEFAULT 'ink',
  is_tab TINYINT DEFAULT 0,
  sort INT DEFAULT 0,
  status TINYINT DEFAULT 1
);

DROP TABLE IF EXISTS courses;
CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bid INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  short VARCHAR(64),
  type VARCHAR(16) DEFAULT 'recorded',
  price INT DEFAULT 0,
  orig_price INT DEFAULT 0,
  teacher VARCHAR(64),
  teacher_note VARCHAR(128),
  sales INT DEFAULT 0,
  intro TEXT,
  highlights TEXT,
  status TINYINT DEFAULT 1,
  stock INT DEFAULT 100,
  KEY idx_courses_bid (bid)
);

DROP TABLE IF EXISTS chapters;
CREATE TABLE IF NOT EXISTS chapters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  title VARCHAR(255),
  dur VARCHAR(16),
  trial TINYINT DEFAULT 0,
  sort INT DEFAULT 0,
  video_url VARCHAR(255),
  KEY idx_chapters_course (course_id)
);

DROP TABLE IF EXISTS news;
CREATE TABLE IF NOT EXISTS news (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bid INT DEFAULT 0,
  category VARCHAR(32),
  top TINYINT DEFAULT 0,
  date VARCHAR(16),
  views INT DEFAULT 0,
  title VARCHAR(255),
  summary VARCHAR(255),
  content TEXT,
  KEY idx_news_bid (bid)
);

DROP TABLE IF EXISTS subjects;
CREATE TABLE IF NOT EXISTS subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bid INT DEFAULT 0,
  name VARCHAR(64) NOT NULL
);

DROP TABLE IF EXISTS questions;
CREATE TABLE IF NOT EXISTS questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sid INT NOT NULL,
  stem TEXT,
  opts TEXT,
  answer VARCHAR(8),
  analysis TEXT,
  KEY idx_questions_sid (sid)
);

DROP TABLE IF EXISTS stories;
CREATE TABLE IF NOT EXISTS stories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(32),
  bid INT DEFAULT 0,
  tag VARCHAR(64),
  result VARCHAR(128),
  quote VARCHAR(255)
);

DROP TABLE IF EXISTS teachers;
CREATE TABLE IF NOT EXISTS teachers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bid INT DEFAULT 0,
  name VARCHAR(32),
  title VARCHAR(128),
  years INT DEFAULT 0,
  students INT DEFAULT 0,
  tags TEXT,
  intro TEXT
);

DROP TABLE IF EXISTS reviews;
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bid INT DEFAULT 0,
  name VARCHAR(32),
  tag VARCHAR(64),
  course VARCHAR(128),
  rating INT DEFAULT 5,
  date VARCHAR(16),
  content TEXT,
  status VARCHAR(16) DEFAULT 'approved',
  KEY idx_reviews_bid (bid)
);

DROP TABLE IF EXISTS campus;
CREATE TABLE IF NOT EXISTS campus (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(64),
  addr VARCHAR(255),
  phone VARCHAR(32),
  areas TEXT,
  lat DECIMAL(10,6),
  lng DECIMAL(10,6),
  sort INT DEFAULT 0
);

DROP TABLE IF EXISTS materials;
CREATE TABLE IF NOT EXISTS materials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bid INT DEFAULT 0,
  name VARCHAR(255),
  cat VARCHAR(32),
  format VARCHAR(16) DEFAULT 'PDF',
  size VARCHAR(16),
  member TINYINT DEFAULT 0,
  file_url VARCHAR(255),
  downloads INT DEFAULT 0,
  sort INT DEFAULT 0
);

DROP TABLE IF EXISTS material_downloads;
CREATE TABLE IF NOT EXISTS material_downloads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  material_id INT NOT NULL,
  created_at DATETIME,
  KEY idx_md_user (user_id)
);

DROP TABLE IF EXISTS coupons;
CREATE TABLE IF NOT EXISTS coupons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bid INT DEFAULT 0,
  name VARCHAR(64),
  amount INT DEFAULT 0,
  min_spend INT DEFAULT 0,
  days INT DEFAULT 30,
  stock INT DEFAULT 0,
  claimed INT DEFAULT 0,
  status TINYINT DEFAULT 1
);

DROP TABLE IF EXISTS coupon_claims;
CREATE TABLE IF NOT EXISTS coupon_claims (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  coupon_id INT NOT NULL,
  status VARCHAR(16) DEFAULT 'claimed',
  order_id INT DEFAULT NULL,
  claimed_at DATETIME,
  used_at DATETIME DEFAULT NULL
);

DROP TABLE IF EXISTS orders;
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_no VARCHAR(32) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  bid INT DEFAULT 0,
  plan VARCHAR(16) DEFAULT 'full',
  amount INT DEFAULT 0,
  paid INT DEFAULT 0,
  coupon_claim_id INT DEFAULT NULL,
  group_id INT DEFAULT NULL,
  status VARCHAR(16) DEFAULT 'unpaid',
  created_at DATETIME,
  paid_at DATETIME DEFAULT NULL,
  final_paid_at DATETIME DEFAULT NULL,
  remark VARCHAR(255),
  version INT DEFAULT 0,
  request_id VARCHAR(64),
  KEY idx_orders_user (user_id),
  KEY idx_orders_status (status),
  KEY idx_orders_request_id (request_id)
);

DROP TABLE IF EXISTS payments;
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  pay_no VARCHAR(32) UNIQUE,
  channel VARCHAR(16) DEFAULT 'demo',
  amount INT DEFAULT 0,
  status VARCHAR(16) DEFAULT 'pending',
  transaction_id VARCHAR(64),
  created_at DATETIME,
  paid_at DATETIME DEFAULT NULL,
  KEY idx_payments_order (order_id)
);

DROP TABLE IF EXISTS group_rules;
CREATE TABLE IF NOT EXISTS group_rules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  size INT DEFAULT 2,
  price INT DEFAULT 0,
  hours INT DEFAULT 24
);

DROP TABLE IF EXISTS groups;
CREATE TABLE IF NOT EXISTS groups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_no VARCHAR(32) UNIQUE,
  course_id INT NOT NULL,
  leader_id INT NOT NULL,
  size INT DEFAULT 2,
  price INT DEFAULT 0,
  joined INT DEFAULT 1,
  status VARCHAR(16) DEFAULT 'open',
  expires_at DATETIME,
  created_at DATETIME,
  version INT DEFAULT 0,
  KEY idx_groups_course (course_id, status)
);

DROP TABLE IF EXISTS group_members;
CREATE TABLE IF NOT EXISTS group_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_id INT NOT NULL,
  user_id INT NOT NULL,
  order_id INT DEFAULT NULL,
  created_at DATETIME
);

DROP TABLE IF EXISTS referrals;
CREATE TABLE IF NOT EXISTS referrals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  referee_id INT DEFAULT NULL,
  referee_phone VARCHAR(32),
  order_id INT DEFAULT NULL,
  level INT DEFAULT 1,
  amount INT DEFAULT 0,
  status VARCHAR(16) DEFAULT 'pending',
  created_at DATETIME,
  KEY idx_ref_user (user_id)
);

DROP TABLE IF EXISTS withdraws;
CREATE TABLE IF NOT EXISTS withdraws (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  amount INT DEFAULT 0,
  status VARCHAR(16) DEFAULT 'pending',
  account VARCHAR(128),
  created_at DATETIME,
  handled_at DATETIME DEFAULT NULL
);

DROP TABLE IF EXISTS signups;
CREATE TABLE IF NOT EXISTS signups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  name VARCHAR(32),
  phone VARCHAR(32),
  bid INT DEFAULT 0,
  course_id INT DEFAULT NULL,
  source VARCHAR(16) DEFAULT 'h5',
  note VARCHAR(255),
  status VARCHAR(16) DEFAULT 'new',
  created_at DATETIME,
  KEY idx_signups_status (status)
);

DROP TABLE IF EXISTS service_messages;
CREATE TABLE IF NOT EXISTS service_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  phone VARCHAR(32),
  content TEXT,
  reply TEXT,
  from_user TINYINT DEFAULT 1,
  created_at DATETIME
);

DROP TABLE IF EXISTS quiz_records;
CREATE TABLE IF NOT EXISTS quiz_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  sid INT DEFAULT 0,
  question_id INT NOT NULL,
  chosen VARCHAR(8),
  correct TINYINT DEFAULT 0,
  created_at DATETIME,
  KEY idx_quiz_user (user_id, question_id)
);

DROP TABLE IF EXISTS exam_records;
CREATE TABLE IF NOT EXISTS exam_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  sid INT DEFAULT 0,
  total INT DEFAULT 0,
  right INT DEFAULT 0,
  duration INT DEFAULT 0,
  created_at DATETIME
);

DROP TABLE IF EXISTS error_book;
CREATE TABLE IF NOT EXISTS error_book (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  question_id INT NOT NULL,
  wrong_count INT DEFAULT 1,
  last_chosen VARCHAR(8),
  created_at DATETIME,
  updated_at DATETIME
);

DROP TABLE IF EXISTS study_progress;
CREATE TABLE IF NOT EXISTS study_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  chapter_id INT NOT NULL,
  progress INT DEFAULT 0,
  finished TINYINT DEFAULT 0,
  updated_at DATETIME
);

DROP TABLE IF EXISTS push_logs;
CREATE TABLE IF NOT EXISTS push_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  title VARCHAR(128),
  content VARCHAR(255),
  type VARCHAR(16) DEFAULT 'system',
  is_read TINYINT DEFAULT 0,
  created_at DATETIME
);

DROP TABLE IF EXISTS settings;
CREATE TABLE IF NOT EXISTS settings (
  k VARCHAR(64) PRIMARY KEY,
  v TEXT
);

-- 电子收据：支付成功后自动生成，学员端可下载
DROP TABLE IF EXISTS receipts;
CREATE TABLE IF NOT EXISTS receipts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  receipt_no VARCHAR(32) NOT NULL,
  order_no VARCHAR(32) NOT NULL,
  user_id INT NOT NULL,
  course_id INT,
  bid INT DEFAULT 0,
  amount INT DEFAULT 0,
  channel VARCHAR(16),
  pay_no VARCHAR(64),
  paid_at DATETIME,
  created_at DATETIME,
  KEY idx_receipts_order (order_no),
  KEY idx_receipts_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
