-- PostgreSQL Schema for Portfolio

-- Drop existing tables
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS profile;

-- Create Profile Table (Singleton)
CREATE TABLE profile (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(100),
  email VARCHAR(100),
  avatar_url TEXT,
  base_image_url TEXT,
  status VARCHAR(100),
  location VARCHAR(100),
  bio TEXT,
  cv_url TEXT
);

-- Insert Default Profile
INSERT INTO profile (full_name, email, status, location, bio) 
VALUES (
  'M Saad Iqbal', 
  'saadiqbalbse067@gmail.com', 
  'Available for Projects', 
  'New York, NY',
  'Crafting digital narratives through code and design.'
);

-- Create Projects Table
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  category VARCHAR(100),
  tags TEXT, -- Comma-separated or stringified JSON
  live_url TEXT,
  github_url TEXT,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Contacts Table (Storing Messages)
CREATE TABLE contacts (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  subject VARCHAR(200),
  message TEXT NOT NULL,
  attachment_link TEXT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample Project
INSERT INTO projects (title, category, description, created_at)
VALUES ('Project Genesis', 'Web Design', 'The beginning of a new era in digital craftsmanship.', CURRENT_TIMESTAMP);

