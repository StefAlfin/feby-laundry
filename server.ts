import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import * as db from './src/db.js'; // Ensure to use .js extension in imports for Node ESM if needed, though tsx handles it

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // app.use((req, res, next) => {
  //   require('fs').appendFileSync('requests.log', `Got request: ${req.method} ${req.url}\n`);
  //   next();
  // });
  
  app.post('/api/auth/login', (req, res) => {
    console.log('LOGIN REQUEST EARLY:', req.body);
    const { username, password } = req.body;
    const user = db.getUserByUsername(username);
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }
    const tokenPayload = Buffer.from(JSON.stringify({ id: user.id, username: user.username, role: user.role })).toString('base64');
    return res.json({ success: true, token: tokenPayload, user: { id: user.id, username: user.username, role: user.role } });
  });

  app.post('/api/auth/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username dan password wajib diisi' });
    if (username.length < 3) return res.status(400).json({ error: 'Username minimal 3 karakter' });
    
    const newUser = db.createUser(username, password);
    if (!newUser) {
      return res.status(400).json({ error: 'Username sudah terdaftar' });
    }
    const tokenPayload = Buffer.from(JSON.stringify(newUser)).toString('base64');
    res.json({ success: true, token: tokenPayload, user: newUser });
  });

  // --- API Routes ---
  
  // 1. Get Service Catalog & Pricing
  app.get('/api/services', (req, res) => {
    res.json([
      { id: 'kiloan', name: 'Cuci Komplit (Kiloan)', priceBase: 6000, unit: 'kg' },
      { id: 'satuan', name: 'Cuci Satuan', priceBase: 15000, unit: 'pcs' },
      { id: 'sepatu', name: 'Cuci Sepatu', priceBase: 25000, unit: 'pasang' },
      { id: 'karpet', name: 'Cuci Karpet', priceBase: 12000, unit: 'meter' },
    ]);
  });

  // 2. Create Order (Booking)
  app.post('/api/orders', (req, res) => {
    try {
      const { customer_name, phone, address, service_type, scent, notes, promo_code, user_id } = req.body;
      if (!customer_name || !phone || !address || !service_type || !scent) {
        return res.status(400).json({ error: 'Data tidak lengkap' });
      }
      const newOrder = db.createOrder({ customer_name, phone, address, service_type, scent, notes, promo_code, user_id });
      res.json(newOrder);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Gagal membuat pesanan' });
    }
  });

  // 3. Track Order by ID or Phone
  app.get('/api/track', (req, res) => {
    const { phone, id, user_id } = req.query;
    try {
      if (id) {
        const order = db.getOrderById(id as string);
        if (order) return res.json([order]);
        return res.json([]);
      } else if (user_id) {
        const orders = db.getOrderByUserId(user_id as string);
        return res.json(orders);
      } else if (phone) {
        const orders = db.getOrderByPhone(phone as string);
        return res.json(orders);
      }
      res.status(400).json({ error: 'Masukkan ID pesanan atau Nomor HP' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Gagal mencari pesanan' });
    }
  });

  // Auth
  // 4. Admin: Get all orders
  app.get('/api/admin/orders', (req, res) => {
    try {
      const orders = db.getAllOrders();
      res.json(orders);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Gagal memuat pesanan' });
    }
  });

  // 5. Admin: Update order
  app.patch('/api/admin/orders/:id', (req, res) => {
    try {
      const { id } = req.params;
      const { status, weight, total_price } = req.body;
      const updated = db.updateOrderStatusAndWeight(id, { status, weight, total_price });
      if (!updated) {
        return res.status(404).json({ error: 'Pesanan tidak ditemukan' });
      }
      res.json(updated);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Gagal mengupdate pesanan' });
    }
  });

  // 6. Promos
  app.get('/api/promos', (req, res) => {
    try {
      const promos = db.getAllPromos();
      res.json(promos);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Gagal memuat promo' });
    }
  });

  app.post('/api/admin/promos', (req, res) => {
    try {
      const { title, description, code, valid_until, terms } = req.body;
      if (!title || !description || !code || !valid_until || !terms) {
        return res.status(400).json({ error: 'Data tidak lengkap' });
      }
      const newPromo = db.createPromo({ title, description, code, valid_until, terms });
      res.json(newPromo);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Gagal membuat promo' });
    }
  });

  app.patch('/api/admin/promos/:id', (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: 'ID tidak valid' });
      const updated = db.updatePromo(id, req.body);
      if (!updated) return res.status(404).json({ error: 'Promo tidak ditemukan' });
      res.json(updated);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Gagal mengupdate promo' });
    }
  });

  app.delete('/api/admin/promos/:id', (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: 'ID tidak valid' });
      const deleted = db.deletePromo(id);
      if (!deleted) return res.status(404).json({ error: 'Promo tidak ditemukan' });
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Gagal menghapus promo' });
    }
  });
  
  // 7. Settings
  app.get('/api/settings', (req, res) => {
    try {
      res.json(db.getSettings());
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Gagal memuat pengaturan' });
    }
  });

  app.post('/api/admin/settings', (req, res) => {
    try {
      const settings = req.body;
      for (const [key, value] of Object.entries(settings)) {
        if (typeof value === 'string') {
          db.updateSetting(key, value);
        }
      }
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Gagal menyimpan pengaturan' });
    }
  });

  // 8. Contact form
  app.post('/api/contact', (req, res) => {
    try {
      const { name, email, message } = req.body;
      if (!name || !email || !message) {
        return res.status(400).json({ error: 'Data tidak lengkap' });
      }
      db.saveMessage(name, email, message);
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Gagal mengirim pesan' });
    }
  });

  app.get('/api/admin/messages', (req, res) => {
    try {
      res.json(db.getMessages());
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Gagal memuat pesan' });
    }
  });

  // 9. Reviews
  app.post('/api/reviews', (req, res) => {
    try {
      const review = req.body;
      if (!review.customer_name || !review.order_id || !review.rating) {
        return res.status(400).json({ error: 'Data tidak lengkap' });
      }
      const existing = db.getReviewByOrderId(review.order_id);
      if (existing) {
        return res.status(400).json({ error: 'Review sudah ada' });
      }
      const newReview = db.createReview(review);
      res.json(newReview);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Gagal mengirim review' });
    }
  });

  app.get('/api/reviews', (req, res) => {
    try {
      res.json(db.getAllReviews());
    } catch (err) {
      res.status(500).json({ error: 'Gagal memuat review' });
    }
  });

  app.get('/api/top-reviews', (req, res) => {
    try {
      res.json(db.getTopReviews());
    } catch (err) {
      res.status(500).json({ error: 'Gagal memuat review' });
    }
  });

  app.get('/api/reviews/:order_id', (req, res) => {
    try {
      const review = db.getReviewByOrderId(req.params.order_id);
      if (review) res.json(review);
      else res.status(404).json({ error: 'Review tidak ditemukan' });
    } catch (err) {
      res.status(500).json({ error: 'Gagal memuat review' });
    }
  });

  // 10. Complaints
  app.post('/api/complaints', (req, res) => {
    try {
      const complaint = req.body;
      if (!complaint.customer_name || !complaint.description) {
        return res.status(400).json({ error: 'Data tidak lengkap' });
      }
      const newComplaint = db.createComplaint(complaint);
      res.json(newComplaint);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Gagal mengirim keluhan' });
    }
  });

  app.get('/api/admin/complaints', (req, res) => {
    try {
      res.json(db.getAllComplaints());
    } catch (err) {
      res.status(500).json({ error: 'Gagal memuat keluhan' });
    }
  });

  // --- Vite / Frontend Middleware ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT} WITH NEW ROUTES`);
  });
}

startServer();
