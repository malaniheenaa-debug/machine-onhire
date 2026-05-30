// MySQL query helpers
// To enable: npm install mysql2 and uncomment the code below

/*
import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export async function getMachineById(id: string) {
  const [rows] = await connection.execute('SELECT * FROM machines WHERE id = ?', [id]);
  return rows;
}

export async function cleanUpTestBookings(userId: string) {
  await connection.execute(
    'DELETE FROM bookings WHERE user_id = ? AND is_test = 1',
    [userId]
  );
}
*/

export {};
