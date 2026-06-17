# Backend Database Setup — Rated Uganda

This directory contains the MySQL schema and seed data for the project.

## Files

- `schema.sql` — creates all 16 tables with foreign keys, indexes, and full-text search.
- `seed.sql` — inserts default roles, categories, districts, demo users, sample articles, and scraped-source placeholders.

## Prerequisites

- MySQL 8.0+ running locally.
- A database named `ratedug` created first:

```bash
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p -e "CREATE DATABASE IF NOT EXISTS ratedug CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

## Running the schema and seed

```bash
cd backend/db
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p ratedug < schema.sql
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p ratedug < seed.sql
```

## Placeholder cover image

The backend serves a fallback cover image at:

```
/assets/placeholder-cover.jpg
```

The physical file is located at:

```
backend/src/assets/placeholder-cover.jpg
```

It is used when an article has no uploaded media or no matching stock image is available.
