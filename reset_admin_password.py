import bcrypt
import psycopg2

# Database connection details
conn = psycopg2.connect(
    dbname="postgres",
    user="postgres.hdwkpakorrnqeyfwzuoh",
    password="rishihood@123",
    host="aws-1-ap-south-1.pooler.supabase.com",
    port=6543
)

cur = conn.cursor()

# New password
new_password = "admin123"
hashed = bcrypt.hashpw(new_password.encode(), bcrypt.gensalt(12)).decode()

# Update admin password
cur.execute("""
    UPDATE "User"
    SET password = %s
    WHERE email = 'admin@sportsfest.com' AND role = 'ADMIN';
""", (hashed,))

conn.commit()
cur.close()
conn.close()
print("Admin password reset to 'admin123'")
