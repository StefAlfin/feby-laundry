import Database from 'better-sqlite3';
import path from 'path';
import type { Order, Promo } from './types.js';

const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV || process.env.NODE_ENV === 'production';
const dbPath = isVercel ? path.join('/tmp', 'laundry.db') : path.resolve(process.cwd(), 'laundry.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    service_type TEXT NOT NULL,
    scent TEXT NOT NULL,
    weight REAL,
    status TEXT NOT NULL DEFAULT 'Pesanan Diterima',
    total_price REAL,
    notes TEXT,
    promo_code TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS promos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    code TEXT NOT NULL,
    valid_until TEXT NOT NULL,
    terms TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    customer_name TEXT NOT NULL,
    order_id TEXT NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS complaints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    customer_name TEXT NOT NULL,
    order_id TEXT,
    description TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed default settings if empty
const settingsCount = db.prepare("SELECT COUNT(*) as count FROM settings").get() as { count: number };
if (settingsCount.count === 0) {
  const insertSetting = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
  insertSetting.run('contact_phone', '0812-3456-7890');
  insertSetting.run('contact_address', 'Jl. Cinta Kasih No. 99, Jakarta Selatan');
}

// Seed default admin if missing
const adminCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get() as { count: number };
if (adminCount.count === 0) {
  const insertUser = db.prepare('INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)');
  insertUser.run('USR-ADMIN', 'admin', 'admin123', 'admin');
}

// Seed default promos if table is empty
const promoCount = db.prepare('SELECT COUNT(*) as count FROM promos').get() as { count: number };
if (promoCount.count === 0) {
  const insertPromo = db.prepare(`
    INSERT INTO promos (title, description, code, valid_until, terms) 
    VALUES (?, ?, ?, ?, ?)
  `);
  insertPromo.run('Diskon Pengguna Baru', 'Dapatkan diskon 20% untuk transaksi pertama Anda minimal Rp 50.000.', 'FEBYBARU20', '31 Des 2026', 'Khusus pengguna baru. Maksimal diskon Rp 20.000.');
  insertPromo.run('Gratis Ongkir Weekend', 'Bebas biaya antar-jemput untuk layanan cuci kilat di hari Sabtu & Minggu.', 'WEEKENDCEPAT', 'Setiap Weekend', 'Minimal cuci 3kg layanan Cuci Kilat/Express.');
  insertPromo.run('Cuci Bedcover Hemat', 'Potongan harga spesial Rp 10.000 untuk setiap cuci bedcover ukuran King/Queen.', 'BEDCOVERNYAMAN', '30 Jun 2026', 'Berlaku kelipatan. Tanpa minimum transaksi.');
}

// Migration to add promo_code if it doesn't exist
try {
  db.exec('ALTER TABLE orders ADD COLUMN promo_code TEXT');
} catch (e) {
  // column exists
}

// Migration to add user_id to orders
try {
  db.exec('ALTER TABLE orders ADD COLUMN user_id TEXT');
} catch (e) {
  // column exists
}

export type { Order, Promo };

export function createOrder(order: Omit<Order, 'id' | 'created_at' | 'updated_at' | 'status' | 'weight' | 'total_price'> & { user_id?: string }) {
  const id = 'ORD-' + Math.random().toString(36).substring(2, 9).toUpperCase();
  let stmt;
  try {
    stmt = db.prepare(`
      INSERT INTO orders (id, customer_name, phone, address, service_type, scent, notes, promo_code, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, order.customer_name, order.phone, order.address, order.service_type, order.scent, order.notes || null, order.promo_code || null, order.user_id || null);
  } catch (err) {
    // Fallback if user_id migration somehow missed
    stmt = db.prepare(`
      INSERT INTO orders (id, customer_name, phone, address, service_type, scent, notes, promo_code)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, order.customer_name, order.phone, order.address, order.service_type, order.scent, order.notes || null, order.promo_code || null);
  }
  return getOrderById(id);
}

export function getOrderById(id: string): Order | undefined {
  const stmt = db.prepare('SELECT * FROM orders WHERE id = ?');
  return stmt.get(id) as Order | undefined;
}

export function getOrderByPhone(phone: string): Order[] {
  const stmt = db.prepare('SELECT * FROM orders WHERE phone = ? ORDER BY created_at DESC');
  return stmt.all(phone) as Order[];
}

export function getOrderByUserId(user_id: string): Order[] {
  const stmt = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC');
  return stmt.all(user_id) as Order[];
}

export function getAllOrders(): Order[] {
  const stmt = db.prepare('SELECT * FROM orders ORDER BY created_at DESC');
  return stmt.all() as Order[];
}

export function updateOrderStatusAndWeight(id: string, update: { status?: string; weight?: number; total_price?: number }) {
  const current = getOrderById(id);
  if (!current) return null;

  const newStatus = update.status !== undefined ? update.status : current.status;
  const newWeight = update.weight !== undefined ? update.weight : current.weight;
  const newPrice = update.total_price !== undefined ? update.total_price : current.total_price;

  const stmt = db.prepare(`
    UPDATE orders 
    SET status = ?, weight = ?, total_price = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  stmt.run(newStatus, newWeight, newPrice, id);
  return getOrderById(id);
}

// Promo operations
export function getAllPromos(): Promo[] {
  const stmt = db.prepare('SELECT * FROM promos ORDER BY created_at DESC');
  return stmt.all() as Promo[];
}

export function createPromo(promo: Omit<Promo, 'id' | 'created_at'>): Promo {
  const stmt = db.prepare(`
    INSERT INTO promos (title, description, code, valid_until, terms)
    VALUES (?, ?, ?, ?, ?)
  `);
  const info = stmt.run(promo.title, promo.description, promo.code, promo.valid_until, promo.terms);
  return getPromoById(info.lastInsertRowid as number) as Promo;
}

export function updatePromo(id: number, promo: Partial<Omit<Promo, 'id' | 'created_at'>>): Promo | null {
  const current = getPromoById(id);
  if (!current) return null;

  const newTitle = promo.title !== undefined ? promo.title : current.title;
  const newDesc = promo.description !== undefined ? promo.description : current.description;
  const newCode = promo.code !== undefined ? promo.code : current.code;
  const newValidUntil = promo.valid_until !== undefined ? promo.valid_until : current.valid_until;
  const newTerms = promo.terms !== undefined ? promo.terms : current.terms;

  const stmt = db.prepare(`
    UPDATE promos
    SET title = ?, description = ?, code = ?, valid_until = ?, terms = ?
    WHERE id = ?
  `);
  stmt.run(newTitle, newDesc, newCode, newValidUntil, newTerms, id);
  return getPromoById(id);
}

export function deletePromo(id: number): boolean {
  const stmt = db.prepare('DELETE FROM promos WHERE id = ?');
  const info = stmt.run(id);
  return info.changes > 0;
}

export function getPromoById(id: number): Promo | undefined {
  const stmt = db.prepare('SELECT * FROM promos WHERE id = ?');
  return stmt.get(id) as Promo | undefined;
}

// User operations
export function getUserByUsername(username: string): any {
  const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
  return stmt.get(username);
}

export function createUser(username: string, password: string): any {
  const id = 'USR-' + Math.random().toString(36).substring(2, 9).toUpperCase();
  const stmt = db.prepare('INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)');
  try {
    stmt.run(id, username, password, 'user');
    return { id, username, role: 'user' };
  } catch (err) {
    return null; // likely unique constraint failed
  }
}

// Settings operations
export function getSettings(): Record<string, string> {
  const stmt = db.prepare('SELECT * FROM settings');
  const rows = stmt.all() as { key: string; value: string }[];
  return rows.reduce((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {} as Record<string, string>);
}

export function updateSetting(key: string, value: string): void {
  const stmt = db.prepare(`
    INSERT INTO settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `);
  stmt.run(key, value);
}

// Contact messages operations
export function saveMessage(name: string, email: string, message: string): void {
  const stmt = db.prepare('INSERT INTO messages (name, email, message) VALUES (?, ?, ?)');
  stmt.run(name, email, message);
}

export function getMessages(): any[] {
  const stmt = db.prepare('SELECT * FROM messages ORDER BY created_at DESC');
  return stmt.all();
}

// Review operations
export function createReview(review: { user_id?: string, customer_name: string, order_id: string, rating: number, comment?: string }): any {
  const stmt = db.prepare('INSERT INTO reviews (user_id, customer_name, order_id, rating, comment) VALUES (?, ?, ?, ?, ?)');
  const info = stmt.run(review.user_id || null, review.customer_name, review.order_id, review.rating, review.comment || '');
  return getReviewById(info.lastInsertRowid as number);
}

export function getReviewById(id: number): any {
  const stmt = db.prepare('SELECT * FROM reviews WHERE id = ?');
  return stmt.get(id);
}

export function getReviewByOrderId(order_id: string): any {
  const stmt = db.prepare('SELECT * FROM reviews WHERE order_id = ?');
  return stmt.get(order_id);
}

export function getAllReviews(): any[] {
  const stmt = db.prepare('SELECT * FROM reviews ORDER BY created_at DESC');
  return stmt.all();
}

export function getTopReviews(): any[] {
  const stmt = db.prepare('SELECT * FROM reviews WHERE rating >= 4 ORDER BY created_at DESC LIMIT 10');
  return stmt.all();
}

// Complaint operations
export function createComplaint(complaint: { user_id?: string, customer_name: string, order_id?: string, description: string }): any {
  const stmt = db.prepare('INSERT INTO complaints (user_id, customer_name, order_id, description) VALUES (?, ?, ?, ?)');
  const info = stmt.run(complaint.user_id || null, complaint.customer_name, complaint.order_id || null, complaint.description);
  return getComplaintById(info.lastInsertRowid as number);
}

export function getComplaintById(id: number): any {
  const stmt = db.prepare('SELECT * FROM complaints WHERE id = ?');
  return stmt.get(id);
}

export function getAllComplaints(): any[] {
  const stmt = db.prepare('SELECT * FROM complaints ORDER BY created_at DESC');
  return stmt.all();
}

export default db;
