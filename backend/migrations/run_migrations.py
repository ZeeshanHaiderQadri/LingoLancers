#!/usr/bin/env python3
"""
Database migration runner for Blog Writing Team
"""
import os
import sys
import psycopg2
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://localhost/blog_writing_team")


def get_connection():
    """Get database connection"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        sys.exit(1)


def run_migration(conn, migration_file: Path):
    """Run a single migration file"""
    print(f"Running migration: {migration_file.name}")
    
    with open(migration_file, 'r') as f:
        sql = f.read()
    
    try:
        cursor = conn.cursor()
        cursor.execute(sql)
        conn.commit()
        cursor.close()
        print(f"✓ Migration {migration_file.name} completed successfully")
        return True
    except Exception as e:
        conn.rollback()
        print(f"✗ Migration {migration_file.name} failed: {e}")
        return False


def main():
    """Run all migrations"""
    migrations_dir = Path(__file__).parent
    migration_files = sorted(migrations_dir.glob("*.sql"))
    
    if not migration_files:
        print("No migration files found")
        return
    
    print(f"Found {len(migration_files)} migration(s)")
    print("-" * 50)
    
    conn = get_connection()
    
    success_count = 0
    for migration_file in migration_files:
        if run_migration(conn, migration_file):
            success_count += 1
        else:
            print("\nStopping migrations due to error")
            break
    
    conn.close()
    
    print("-" * 50)
    print(f"Completed {success_count}/{len(migration_files)} migrations")
    
    if success_count == len(migration_files):
        print("✓ All migrations completed successfully!")
    else:
        print("✗ Some migrations failed")
        sys.exit(1)


if __name__ == "__main__":
    main()
