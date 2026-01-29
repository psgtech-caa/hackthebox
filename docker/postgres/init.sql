-- Initialize PostgreSQL database for Hack-The-Box
-- This file is executed on first container startup

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set timezone
SET timezone = 'UTC';
