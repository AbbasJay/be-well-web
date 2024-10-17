-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS unique_idx ON users (email);

-- Create Businesses Table
CREATE TABLE IF NOT EXISTS businesses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  description TEXT,
  hours TEXT,
  email TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS unique_email_idx ON businesses (email);

-- Create Classes Table
CREATE TABLE IF NOT EXISTS classes (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  instructor TEXT,
  duration INTEGER NOT NULL,
  capacity INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (business_id) REFERENCES businesses(id)
);

-- Create Schedules Table
CREATE TABLE IF NOT EXISTS schedules (
  id SERIAL PRIMARY KEY,
  class_id INTEGER NOT NULL,
  day_of_week INTEGER NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (class_id) REFERENCES classes(id)
);
