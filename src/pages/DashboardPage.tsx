import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, Users, Receipt, AlertCircle, TrendingUp, Search, Loader2, Tag, Plus, Trash2, Edit2, X, Lock, LogOut, Settings, MessageSquare, Star, Frown, MessageCircle } from 'lucide-react';
import { Order, Promo } from '../types';

const STATUS_STEPS = [
  'Pesanan Diterima',
  'Sedang Dicuci',
  'Sedang Disetrika',
  'Siap Diambil/Diantar',
  'Selesai'
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'orders' | 'promos' | 'settings' | 'messages' | 'reviews'>('orders');
  const [userTab, setUserTab] = useState<'orders' | 'complaints'>('orders');
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'admin'|'user'>('user');
  const [userId, setUserId] = useState('');
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [services, setServices] = useState<any[]>([]);

  // Promo modal state
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promo | null>(null);
  const [promoForm, setPromoForm] = useState({ title: '', description: '', code: '', valid_until: '', terms: '' });

  // Review modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Complaint state
  const [complaintText, setComplaintText] = useState('');
  const [submittingComplaint, setSubmittingComplaint] = useState(false);
  const [complaintSuccess, setComplaintSuccess] = useState('');


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token));
        setUserId(payload.id);
        setUserRole(payload.role);
        setIsAuthenticated(true);
        fetchData(payload.id, payload.role);
      } catch (e) {
        localStorage.removeItem('token');
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    try {
      const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('userName', data.user.username);
        localStorage.setItem('userId', data.user.id);
        window.dispatchEvent(new Event('authChange'));
        setUserId(data.user.id);
        setUserRole(data.user.role);
        setIsAuthenticated(true);
        fetchData(data.user.id, data.user.role);
      } else {
        const data = await res.json();
        setLoginError(data.error || 'Autentikasi gagal');
      }
    } catch (err) {
      setLoginError('Terjadi kesalahan jaringan');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const fetchData = async (uid?: string, role?: string) => {
    setIsLoading(true);
    console.log('Starting fetchData', { uid, role, userId, userRole });
    try {
      const uId = uid || userId;
      const r = role || userRole;
      
      const fetchWithTimeout = (url: string, ms = 8000) => {
        return Promise.race([
          fetch(url),
          new Promise<Response>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
        ]);
      };

      if (r === 'admin') {
        const [ordersRes, servicesRes, promosRes, settingsRes, messagesRes, reviewsRes, complaintsRes] = await Promise.all([
          fetchWithTimeout('/api/admin/orders'),
          fetchWithTimeout('/api/services'),
          fetchWithTimeout('/api/promos'),
          fetchWithTimeout('/api/settings'),
          fetchWithTimeout('/api/admin/messages'),
          fetchWithTimeout('/api/reviews'),
          fetchWithTimeout('/api/admin/complaints')
        ]);
        if (ordersRes.ok) setOrders(await ordersRes.json());
        if (servicesRes.ok) setServices(await servicesRes.json());
        if (promosRes.ok) setPromos(await promosRes.json());
        if (settingsRes.ok) setSettings(await settingsRes.json());
        if (messagesRes.ok) setMessages(await messagesRes.json());
        if (reviewsRes.ok) setReviews(await reviewsRes.json());
        if (complaintsRes.ok) setComplaints(await complaintsRes.json());
      } else {
        // user fetch
        const [ordersRes, promosRes, reviewsRes] = await Promise.all([
          fetchWithTimeout(`/api/track?user_id=${uId}`),
          fetchWithTimeout('/api/promos'),
          fetchWithTimeout('/api/reviews') // user might also want to see their own reviews
        ]);
        if (ordersRes.ok) setOrders(await ordersRes.json());
        if (promosRes.ok) setPromos(await promosRes.json());
        if (reviewsRes.ok) setReviews(await reviewsRes.json());
      }
    } catch (err) {
      console.error('Error in fetchData:', err);
    } finally {
      setIsLoading(false);
      console.log('Finished fetchData, isLoading set to false');
    }
  };

  const updateOrder = async (id: string, updates: Partial<Order>) => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        fetchData();
      } else {
        alert('Gagal mengupdate');
      }
    } catch (e) {
      console.error(e);
      alert('Error updating order');
    }
  };

  const handleWeightChange = (order: Order, newWeightStr: string) => {
    const weight = parseFloat(newWeightStr);
    if (isNaN(weight)) return;
    
    // Calculate total price based on service
    const service = services.find(s => s.id === order.service_type);
    const total_price = service ? service.priceBase * weight : 0;

    updateOrder(order.id, { weight, total_price });
  };

  const handlePromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingPromo ? `/api/admin/promos/${editingPromo.id}` : '/api/admin/promos';
      const method = editingPromo ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promoForm)
      });
      if (res.ok) {
        setIsPromoModalOpen(false);
        setEditingPromo(null);
        setPromoForm({ title: '', description: '', code: '', valid_until: '', terms: '' });
        fetchData();
      } else {
        alert('Gagal menyimpan promo');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving promo');
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        alert('Pengaturan berhasil disimpan');
        fetchData();
      } else {
        alert('Gagal menyimpan pengaturan');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving settings');
    }
  };

  const handleDeletePromo = async (id: number) => {
    if (!confirm('Yakin ingin menghapus promo ini?')) return;
    try {
      const res = await fetch(`/api/admin/promos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      } else {
        alert('Gagal menghapus promo');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openPromoModal = (promo?: Promo) => {
    if (promo) {
      setEditingPromo(promo);
      setPromoForm({ title: promo.title, description: promo.description, code: promo.code, valid_until: promo.valid_until, terms: promo.terms });
    } else {
      setEditingPromo(null);
      setPromoForm({ title: '', description: '', code: '', valid_until: '', terms: '' });
    }
    setIsPromoModalOpen(true);
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-100"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <Lock size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{isRegistering ? 'Daftar Akun' : 'Masuk Akun'}</h1>
            <p className="text-slate-500 text-sm mt-2 text-center">
              {isRegistering ? 'Buat akun baru untuk melacak pesanan Anda.' : 'Masukkan username dan password Anda.'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Masukkan username"
                className="w-full border border-slate-300 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="********"
                className="w-full border border-slate-300 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                required
              />
            </div>
            
            {loginError && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
                <AlertCircle size={16} /> {loginError}
              </div>
            )}
            
            <button 
              type="submit" 
              disabled={isLoggingIn}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-md disabled:bg-blue-400 flex items-center justify-center"
            >
              {isLoggingIn ? <Loader2 className="animate-spin" size={20} /> : (isRegistering ? 'Daftar' : 'Masuk')}
            </button>
            <div className="text-center mt-4">
              <button 
                type="button" 
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-sm text-blue-600 hover:underline font-semibold"
              >
                {isRegistering ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewOrder) return;
    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          customer_name: localStorage.getItem('userName') || 'User',
          order_id: reviewOrder.id,
          rating: reviewRating,
          comment: reviewComment
        })
      });
      if (res.ok) {
        setIsReviewModalOpen(false);
        fetchData();
        alert('Terima kasih atas ulasan Anda!');
      } else {
        const data = await res.json();
        alert(data.error || 'Gagal mengirim ulasan');
      }
    } catch (e) {
      alert('Terjadi kesalahan jaringan');
    } finally {
      setSubmittingReview(false);
    }
  };

  const openReviewModal = (order: Order) => {
    setReviewOrder(order);
    setReviewRating(5);
    setReviewComment('');
    setIsReviewModalOpen(true);
  };

  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingComplaint(true);
    setComplaintSuccess('');
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          customer_name: localStorage.getItem('userName') || 'User',
          description: complaintText
        })
      });
      if (res.ok) {
        setComplaintSuccess('Keluhan berhasil dikirim. Kami akan menindaklanjutinya secepatnya.');
        setComplaintText('');
      } else {
        alert('Gagal mengirim keluhan');
      }
    } catch (e) {
      alert('Terjadi kesalahan jaringan');
    } finally {
      setSubmittingComplaint(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('authChange'));
    setIsAuthenticated(false);
  };

  // User Dashboard render
  if (userRole === 'user') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Dashboard Anda</h1>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors"
          >
            <LogOut size={18} /> Keluar
          </button>
        </div>
        
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Ingin Laundry?</h2>
            <p className="text-slate-500">Pesan langsung layanan dari kami dan dapatkan update status tanpa perlu masukkan no. HP.</p>
          </div>
          <a href="/pesan" className="flex-shrink-0 bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition-colors shadow-md">
            Pesan Sekarang
          </a>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-6">Riwayat Pesanan</h2>
        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
            <Receipt className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Belum ada pesanan</h3>
            <p className="text-slate-500 max-w-sm mx-auto">Anda belum pernah melakukan pemesanan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map(order => {
                const currentStepIdx = STATUS_STEPS.indexOf(order.status);
                const progressWidth = Math.max(0, currentStepIdx) / (STATUS_STEPS.length - 1) * 100;

                return (
                <div key={order.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4">
                     <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                      {order.id}
                    </span>
                  </div>
                  <div className="mb-4 pt-2">
                    <h3 className="font-bold text-lg text-slate-900 capitalize">{order.service_type}</h3>
                    <p className="text-slate-500 text-sm mt-1">{new Date(order.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric'})}</p>
                  </div>
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-slate-700">{order.status}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progressWidth}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="bg-blue-600 h-full rounded-full"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <a href={`/lacak?id=${order.id}`} className="flex items-center justify-center w-full gap-2 text-sm font-bold text-blue-600 bg-blue-50 py-3 rounded-xl hover:bg-blue-100 transition-colors">
                      Lihat Detail
                    </a>
                    {order.status === 'Selesai' && !reviews.find(r => r.order_id === order.id) && (
                      <button 
                        onClick={() => openReviewModal(order)}
                        className="flex items-center justify-center w-full gap-2 text-sm font-bold text-amber-600 bg-amber-50 py-3 rounded-xl hover:bg-amber-100 transition-colors"
                      >
                        <Star size={16} /> Beri Nilai
                      </button>
                    )}
                    {order.status === 'Selesai' && reviews.find(r => r.order_id === order.id) && (
                      <div className="flex items-center justify-center w-full gap-2 text-sm font-bold text-emerald-600 bg-emerald-50 py-3 rounded-xl">
                        <Star size={16} className="fill-current" /> Telah Dinilai
                      </div>
                    )}
                  </div>
                </div>
              )
            }
            )}
          </div>
        )}

        {promos.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Promo Spesial Untukmu</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {promos.map(promo => (
                <div key={promo.id} className="bg-white border flex flex-col h-full border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow relative">
                  <div className="flex-grow">
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 w-12 h-12 rounded-xl flex items-center justify-center text-orange-600 mb-4">
                      <Tag size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{promo.title}</h3>
                    <p className="text-slate-600 text-sm mb-4 leading-relaxed">{promo.description}</p>
                    
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4 text-center">
                      <span className="font-mono font-bold text-lg text-slate-800 tracking-wider select-all">{promo.code}</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-slate-100 pt-4 mt-auto">
                    <p className="text-xs font-semibold text-slate-900 mb-1">Berlaku Hingga: <span className="text-blue-600 font-bold">{promo.valid_until}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center"><Frown size={24} /></div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Ada Keluhan?</h2>
              <p className="text-slate-500">Sampaikan keluhan atau masalah terkait layanan kami. Kami siap membantu.</p>
            </div>
          </div>
          
          {complaintSuccess && (
            <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl mb-6 font-semibold flex items-center gap-2">
              <MessageCircle size={20} />
              {complaintSuccess}
            </div>
          )}

          <form onSubmit={handleComplaintSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Deskripsi Keluhan</label>
              <textarea 
                value={complaintText}
                onChange={e => setComplaintText(e.target.value)}
                placeholder="Ceritakan detail masalah yang Anda alami..."
                className="w-full border border-slate-300 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow min-h-[120px]"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={submittingComplaint}
              className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submittingComplaint ? 'Mengirim...' : 'Kirim Keluhan'}
            </button>
          </form>
        </div>

        {/* Review Modal */}
        <AnimatePresence>
          {isReviewModalOpen && reviewOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsReviewModalOpen(false)} />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="text-xl font-bold text-slate-900">Beri Nilai Pesanan</h3>
                  <button onClick={() => setIsReviewModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white shadow-sm p-2 rounded-full transition-colors"><X size={20} /></button>
                </div>
                <div className="p-6">
                  <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-sm text-slate-500 mb-1">ID Pesanan</p>
                    <p className="font-bold text-slate-900">{reviewOrder.id} - <span className="capitalize">{reviewOrder.service_type}</span></p>
                  </div>
                  <form onSubmit={handleReviewSubmit}>
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-slate-700 mb-3 text-center">Berapa bintang untuk layanan ini?</label>
                      <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="p-1 transition-transform hover:scale-110"
                          >
                            <Star 
                              size={40} 
                              className={star <= reviewRating ? "fill-amber-400 text-amber-400" : "text-slate-200"} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Pesan & Kesan (Opsional)</label>
                      <textarea 
                        value={reviewComment}
                        onChange={e => setReviewComment(e.target.value)}
                        placeholder="Bagaimana hasil cucian kami?"
                        className="w-full border border-slate-300 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow min-h-[100px]"
                      />
                    </div>
                    <button type="submit" disabled={submittingReview} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50">
                      {submittingReview ? 'Menyimpan...' : 'Kirim Ulasan'}
                    </button>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Stats
  const newOrders = orders.filter(o => o.status === 'Pesanan Diterima').length;
  const inProgress = orders.filter(o => ['Sedang Dicuci', 'Sedang Disetrika'].includes(o.status)).length;
  const completedToday = orders.filter(o => o.status === 'Selesai' && new Date(o.updated_at).toDateString() === new Date().toDateString()).length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_price || 0), 0);

  return (
    <div className="flex w-full h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <LayoutDashboard size={24} />
            </div>
            <span className="font-extrabold text-xl text-slate-900 tracking-tight">AdminPanel</span>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button 
            onClick={() => setActiveTab('orders')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'orders' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <Receipt size={20} />
            Data Pesanan
          </button>
          <button 
            onClick={() => setActiveTab('promos')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'promos' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <Tag size={20} />
            Manajemen Promo
          </button>
          <button 
            onClick={() => setActiveTab('messages')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'messages' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <MessageSquare size={20} />
            Pesan & Keluhan
          </button>
          <button 
            onClick={() => setActiveTab('reviews')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'reviews' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <Star size={20} />
            Penilaian (Review)
          </button>
          <button 
            onClick={() => setActiveTab('settings')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'settings' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <Settings size={20} />
            Pengaturan Info
          </button>
        </nav>
        <div className="p-4 border-t border-slate-200">
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
          >
            <LogOut size={18} /> Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header (visible only on small screens) */}
        <div className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg"><LayoutDashboard size={20} /></div>
            <span className="font-extrabold text-lg text-slate-900">AdminPanel</span>
          </div>
          <button onClick={handleLogout} className="text-red-600 p-2"><LogOut size={20} /></button>
        </div>

        {/* Mobile Nav Tabs */}
        <div className="md:hidden flex bg-white border-b border-slate-200 px-4 pt-2 gap-4 overflow-x-auto hide-scrollbar">
          <button onClick={() => setActiveTab('orders')} className={`whitespace-nowrap pb-3 text-sm font-bold border-b-2 ${activeTab === 'orders' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}>Pesanan</button>
          <button onClick={() => setActiveTab('promos')} className={`whitespace-nowrap pb-3 text-sm font-bold border-b-2 ${activeTab === 'promos' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}>Promo</button>
          <button onClick={() => setActiveTab('messages')} className={`whitespace-nowrap pb-3 text-sm font-bold border-b-2 ${activeTab === 'messages' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}>Pesan & Keluhan</button>
          <button onClick={() => setActiveTab('reviews')} className={`whitespace-nowrap pb-3 text-sm font-bold border-b-2 ${activeTab === 'reviews' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}>Penilaian</button>
          <button onClick={() => setActiveTab('settings')} className={`whitespace-nowrap pb-3 text-sm font-bold border-b-2 ${activeTab === 'settings' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}>Pengaturan</button>
        </div>

        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          <div className="mb-8 hidden md:block">
            <h1 className="text-3xl font-bold text-slate-900">
              {activeTab === 'orders' ? 'Dashboard Pesanan' : activeTab === 'promos' ? 'Manajemen Promo' : activeTab === 'reviews' ? 'Penilaian Pelanggan' : activeTab === 'messages' ? 'Pesan & Keluhan' : 'Pengaturan Informasi'}
            </h1>
            <p className="text-slate-500 mt-2">
              {activeTab === 'orders' ? 'Pantau dan kelola seluruh transaksi laundry Anda.' : activeTab === 'promos' ? 'Kelola kode promo diskon untuk pelanggan.' : activeTab === 'reviews' ? 'Lihat ulasan dan penilaian layanan dari pelanggan.' : activeTab === 'messages' ? 'Pantau pesan kontak dan keluhan dari pelanggan.' : 'Atur informasi kontak untuk ditampilkan pada halaman situs.'}
            </p>
          </div>

          {activeTab === 'orders' ? (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><AlertCircle size={24} /></div>
                  <div>
                    <div className="text-sm font-semibold text-slate-500">Pesanan Baru</div>
                    <div className="text-2xl font-black text-slate-900">{newOrders}</div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center"><Loader2 size={24} /></div>
                  <div>
                    <div className="text-sm font-semibold text-slate-500">Sedang Diproses</div>
                    <div className="text-2xl font-black text-slate-900">{inProgress}</div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center"><Receipt size={24} /></div>
                  <div>
                    <div className="text-sm font-semibold text-slate-500">Selesai (Hari Ini)</div>
                    <div className="text-2xl font-black text-slate-900">{completedToday}</div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center"><TrendingUp size={24} /></div>
                  <div>
                    <div className="text-sm font-semibold text-slate-500">Total Pendapatan</div>
                    <div className="text-xl font-black text-slate-900">Rp {totalRevenue.toLocaleString('id-ID')}</div>
                  </div>
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col mb-12">
                <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-xl font-bold text-slate-900">Daftar Pesanan</h2>
                  <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" placeholder="Cari nota/nama..." className="w-full sm:w-64 pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                        <th className="px-6 py-4 font-semibold whitespace-nowrap">ID / Waktu</th>
                        <th className="px-6 py-4 font-semibold whitespace-nowrap">Pelanggan</th>
                        <th className="px-6 py-4 font-semibold whitespace-nowrap">Layanan & Berat</th>
                        <th className="px-6 py-4 font-semibold whitespace-nowrap">Status Lengkap</th>
                        <th className="px-6 py-4 font-semibold text-right whitespace-nowrap">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders.map(order => (
                        <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-mono text-sm font-bold text-slate-900">{order.id}</div>
                            <div className="text-xs text-slate-500 mt-1">{new Date(order.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-900 text-sm">{order.customer_name}</div>
                            <div className="text-xs text-slate-500 mt-1">{order.phone}</div>
                            <div className="text-xs text-slate-400 max-w-[150px] truncate" title={order.address}>{order.address}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-2 mb-2">
                               <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 capitalize">
                                {order.service_type}
                              </span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-800 capitalize">
                                {order.scent}
                              </span>
                              {order.promo_code && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-orange-100 text-orange-800 uppercase">
                                  <Tag size={12} className="mr-1" /> {order.promo_code}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <input 
                                type="number" 
                                defaultValue={order.weight || ''}
                                disabled={order.status === 'Selesai'}
                                placeholder="Berat/Jml"
                                className="w-20 px-2 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                                onBlur={(e) => handleWeightChange(order, e.target.value)}
                              />
                              {order.total_price && (
                                <span className="text-sm font-bold text-slate-900 border-l border-slate-200 pl-2 whitespace-nowrap">Rp {order.total_price.toLocaleString('id-ID')}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                           <select 
                              value={order.status}
                              disabled={order.status === 'Selesai'}
                              onChange={(e) => updateOrder(order.id, { status: e.target.value })}
                              className={`text-sm font-semibold rounded-lg px-3 py-1.5 border focus:outline-none focus:ring-2 appearance-none 
                                ${order.status === 'Selesai' ? 'bg-green-50 text-green-700 border-green-200' : 
                                  order.status === 'Pesanan Diterima' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                  'bg-blue-50 text-blue-700 border-blue-200'
                                }`}
                            >
                              {STATUS_STEPS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {/* Placeholder for future action like sending WA invoice manually */}
                            <button className="text-slate-400 hover:text-blue-600 mx-1" title="Lihat Detail/Catatan">
                              <Search size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {orders.length === 0 && (
                        <tr><td colSpan={5} className="py-12 text-center text-slate-500">Belum ada pesanan masuk.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : activeTab === 'promos' ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col mb-12">
              <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-bold text-slate-900">Daftar Promo</h2>
                <button 
                  onClick={() => openPromoModal()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus size={18} /> Tambah Promo
                </button>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {promos.map(promo => (
                  <div key={promo.id} className="border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow relative group">
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <button onClick={() => openPromoModal(promo)} className="p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDeletePromo(promo.id)} className="p-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-orange-600 mb-3">
                      <Tag size={20} />
                      <span className="font-mono font-bold bg-orange-50 px-2 py-0.5 rounded text-sm">{promo.code}</span>
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 mb-1">{promo.title}</h3>
                    <p className="text-sm text-slate-600 line-clamp-2 mb-3">{promo.description}</p>
                    <div className="text-xs text-slate-500">
                      <p>Berlaku s/d: <strong className="text-slate-800">{promo.valid_until}</strong></p>
                    </div>
                  </div>
                ))}
                {promos.length === 0 && (
                  <div className="col-span-full py-12 text-center text-slate-500">Belum ada promo.</div>
                )}
              </div>
            </div>
          ) : activeTab === 'settings' ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 flex flex-col mb-12">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Informasi Kontak</h2>
              <form onSubmit={handleSettingsSubmit} className="space-y-6 max-w-2xl">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nomor Telepon (WhatsApp)</label>
                  <input 
                    type="text" 
                    value={settings.contact_phone || ''} 
                    onChange={e => setSettings({...settings, contact_phone: e.target.value})} 
                    className="w-full border-2 border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-600 focus:ring-0 text-slate-800 bg-slate-50/50" 
                    placeholder="Misal: 0812-3456-7890" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Alamat Laundry</label>
                  <textarea 
                    rows={3} 
                    value={settings.contact_address || ''} 
                    onChange={e => setSettings({...settings, contact_address: e.target.value})} 
                    className="w-full border-2 border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-600 focus:ring-0 text-slate-800 bg-slate-50/50" 
                    placeholder="Misal: Jl. Mawar No. 10..." 
                  ></textarea>
                </div>
                <div className="flex justify-end pt-4">
                  <button type="submit" className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition">
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          ) : null}
          {activeTab === 'messages' && (
            <div className="space-y-8 mb-12">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-200 bg-red-50 text-red-700">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Frown size={24} />
                    Keluhan Pelanggan ({complaints?.length || 0})
                  </h2>
                </div>
                <div className="divide-y divide-slate-100">
                  {complaints?.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">Belum ada keluhan masuk.</div>
                  ) : (
                    complaints?.map((complaint) => (
                      <div key={complaint.id} className="p-6 hover:bg-slate-50 transition-colors">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
                          <h3 className="font-bold text-slate-900 text-lg">{complaint.customer_name}</h3>
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{new Date(complaint.created_at).toLocaleString('id-ID')}</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-500 mb-2">ID Pengguna: {complaint.user_id}</p>
                        <p className="text-slate-700 bg-white p-4 rounded-xl border border-red-200 whitespace-pre-wrap">{complaint.description}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-200 bg-blue-50 text-blue-700">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <MessageSquare size={24} />
                    Pesan Masuk ({messages.length})
                  </h2>
                </div>
                <div className="divide-y divide-slate-100">
                  {messages.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">Belum ada pesan masuk.</div>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg.id} className="p-6 hover:bg-slate-50 transition-colors">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
                          <h3 className="font-bold text-slate-900 text-lg">{msg.name}</h3>
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{new Date(msg.created_at).toLocaleString('id-ID')}</span>
                        </div>
                        <a href={`mailto:${msg.email}`} className="text-sm text-blue-600 hover:underline mb-4 inline-block font-medium">{msg.email}</a>
                        <p className="text-slate-700 bg-white p-4 rounded-xl border border-slate-200 whitespace-pre-wrap">{msg.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
          {activeTab === 'reviews' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col mb-12">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900">Ulasan & Penilaian ({reviews.length})</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {reviews.length === 0 ? (
                  <div className="p-12 text-center text-slate-500">Belum ada penilaian untuk saat ini.</div>
                ) : (
                  reviews.map((r) => (
                    <div key={r.id} className="p-6 hover:bg-slate-50 transition-colors">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-slate-900 text-lg">{r.customer_name}</h3>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} size={16} className={i < r.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"} />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{new Date(r.created_at).toLocaleDateString('id-ID')}</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-500 mb-2">ID Pesanan: {r.order_id}</p>
                      {r.comment && (
                        <p className="text-slate-700 bg-white p-4 rounded-xl border border-slate-200 whitespace-pre-wrap italic">"{r.comment}"</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Promo Modal */}
      <AnimatePresence>
        {isPromoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl overflow-hidden relative"
            >
              <button 
                onClick={() => setIsPromoModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              
              <h2 className="text-2xl font-bold text-slate-900 mb-6">{editingPromo ? 'Edit Promo' : 'Tambah Promo Baru'}</h2>
              
              <form onSubmit={handlePromoSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Judul Promo</label>
                  <input required type="text" value={promoForm.title} onChange={e => setPromoForm({...promoForm, title: e.target.value})} className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Misal: Diskon Merdeka" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Kode Promo</label>
                  <input required type="text" value={promoForm.code} onChange={e => setPromoForm({...promoForm, code: e.target.value.toUpperCase()})} className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono uppercase" placeholder="Misal: MERDEKA20" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Deskripsi</label>
                  <textarea required value={promoForm.description} onChange={e => setPromoForm({...promoForm, description: e.target.value})} className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} placeholder="Deskripsikan promo singkat..."></textarea>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Berlaku Hingga</label>
                  <input required type="text" value={promoForm.valid_until} onChange={e => setPromoForm({...promoForm, valid_until: e.target.value})} className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Misal: 17 Agustus 2026" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Syarat & Ketentuan</label>
                  <textarea required value={promoForm.terms} onChange={e => setPromoForm({...promoForm, terms: e.target.value})} className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} placeholder="Syarat dan ketentuan berlaku..."></textarea>
                </div>
                
                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition shadow-md mt-4">
                  {editingPromo ? 'Simpan Perubahan' : 'Buat Promo'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
