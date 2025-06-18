  -- Initialize Atenas Backend Database
-- This script runs when PostgreSQL container starts

-- Create additional schemas if needed
CREATE SCHEMA IF NOT EXISTS app_schema;

-- Set default search path
ALTER DATABASE atenas_dev SET search_path TO "$user", public, app_schema;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE atenas_dev TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA app_schema TO postgres;