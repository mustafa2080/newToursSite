# Database Setup Guide

## Prerequisites

### 1. Install PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

**macOS:**
```bash
brew install postgresql
```

**Windows:**
Download and install from: https://www.postgresql.org/download/windows/

### 2. Start PostgreSQL Service

**Ubuntu/Debian:**
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql  # Enable auto-start
```

**macOS:**
```bash
brew services start postgresql
```

**Windows:**
PostgreSQL service should start automatically after installation.

### 3. Create Database and User

1. **Switch to postgres user and access PostgreSQL:**
   ```bash
   sudo -u postgres psql
   ```

2. **Create database and user:**
   ```sql
   CREATE DATABASE tours;
   CREATE USER postgres WITH PASSWORD 'postgres';
   GRANT ALL PRIVILEGES ON DATABASE tours TO postgres;
   ALTER USER postgres CREATEDB;
   \q
   ```

   Or if you prefer a different password, update the `.env` file accordingly.

### 4. Verify Connection

Test if you can connect to the database:
```bash
psql -h localhost -p 5432 -U postgres -d tours
```

## Database Schema Overview

Our database includes the following tables:

### Core Tables
- **users** - User accounts (customers and admins)
- **categories** - Countries/regions for organizing trips and hotels
- **trips** - Tour packages with itineraries and pricing
- **hotels** - Hotel listings with amenities and room types
- **bookings** - Trip and hotel reservations
- **reviews** - User reviews and ratings
- **wishlist** - User saved items
- **content_pages** - CMS content (About, Contact pages)
- **admin_logs** - Admin activity tracking

### Key Features
- **UUID primary keys** for better security and scalability
- **JSONB fields** for flexible data storage (itineraries, amenities)
- **Array fields** for lists (images, services, dates)
- **Enum types** for controlled values (user roles, booking status)
- **Comprehensive indexes** for optimal query performance
- **Automatic timestamps** with triggers
- **Data integrity** with foreign keys and constraints

## Initialize Database

Once PostgreSQL is running and accessible:

### 1. Initialize with Schema and Default Data
```bash
cd backend
npm run db:init
```

This will:
- Create all tables and relationships
- Set up indexes and triggers
- Insert default categories (countries)
- Create default admin user (admin@tours.com / admin123)
- Add default content pages

### 2. Reset Database (Development Only)
```bash
npm run db:reset
```

⚠️ **WARNING**: This will delete all data and recreate the database.

## Default Data

### Admin User
- **Email**: admin@tours.com
- **Password**: admin123
- **Role**: admin

### Categories (Countries)
- Egypt
- Turkey
- Greece
- Italy
- Spain
- France

### Content Pages
- About Us page with company information
- Contact Us page with contact details

## Environment Configuration

Make sure your `.env` file has the correct database settings:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tours
DB_USER=postgres
DB_PASSWORD=postgres
```

## Troubleshooting

### Connection Issues

1. **Check if PostgreSQL is running:**
   ```bash
   pg_isready -h localhost -p 5432
   ```

2. **Check PostgreSQL logs:**
   ```bash
   sudo tail -f /var/log/postgresql/postgresql-*.log
   ```

3. **Verify user permissions:**
   ```sql
   \du  -- List users and their roles
   ```

### Common Errors

**"database does not exist"**
- Create the database: `CREATE DATABASE tours;`

**"role does not exist"**
- Create the user: `CREATE USER postgres WITH PASSWORD 'postgres';`

**"permission denied"**
- Grant privileges: `GRANT ALL PRIVILEGES ON DATABASE tours TO postgres;`

**"connection refused"**
- Start PostgreSQL service
- Check if it's listening on the correct port

## Database Management

### Backup Database
```bash
pg_dump -h localhost -U postgres tours > backup.sql
```

### Restore Database
```bash
psql -h localhost -U postgres tours < backup.sql
```

### Connect to Database
```bash
psql -h localhost -U postgres -d tours
```

### Useful SQL Commands
```sql
-- List all tables
\dt

-- Describe table structure
\d table_name

-- Show table sizes
SELECT schemaname,tablename,pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size 
FROM pg_tables WHERE schemaname='public';

-- Count records in all tables
SELECT schemaname,tablename,n_tup_ins-n_tup_del as rowcount 
FROM pg_stat_user_tables 
ORDER BY rowcount DESC;
```

## Next Steps

After database setup is complete:

1. **Test the connection** by running the backend server
2. **Verify default data** by checking the admin user and categories
3. **Start building the API endpoints** for authentication and CRUD operations
4. **Test the frontend-backend integration**

The database is now ready for development!
