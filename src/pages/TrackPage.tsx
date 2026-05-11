import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Loader2, CheckCircle2, Clock, CheckCircle, Star, X } from 'lucide-react';
import { Order } from '../types';

const STATUS_STEPS = [
  'Pesanan Diterima',
  'Sedang Dicuci',
  'Sedang Disetrika',
  'Siap Diambil/Diantar',
  'Selesai'
];

export default function TrackPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [hasSuccessMsg, setHasSuccessMsg] = useState(location.state?.success || false);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const checkReview = async (orderId: string) => {
    try {
      const res = await fetch(`/api/reviews/${orderId}`);
      if (res.ok) {
        const review = await res.json();
        setReviews(prev => ({...prev, [orderId]: review}));
      }
    } catch(e) {}
  };

  const fetchOrder = async (query: string, type: 'id' | 'phone') => {
    if (!query) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/track?${type}=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
        if (data.length === 0) setError('Pesanan tidak ditemukan.');
        else {
          data.forEach((o: Order) => {
            if (o.status === 'Selesai') checkReview(o.id);
          });
        }
      } else {
        const errData = await res.json();
        setError(errData.error || 'Gagal mencari pesanan');
        setOrders([]);
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewOrder) return;
    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: localStorage.getItem('userId') || undefined,
          customer_name: reviewOrder.customer_name || 'Guest',
          order_id: reviewOrder.id,
          rating: reviewRating,
          comment: reviewComment
        })
      });
      if (res.ok) {
        const newReview = await res.json();
        setReviews(prev => ({...prev, [reviewOrder.id]: newReview}));
        setIsReviewModalOpen(false);
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

  useEffect(() => {
    if (searchParams.get('id')) {
      fetchOrder(searchParams.get('id')!, 'id');
    }
  }, [searchParams]);

  return (
    <div className="py-12 px-4 max-w-4xl mx-auto">
      {hasSuccessMsg && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-2xl p-6 mb-8 flex items-start gap-4">
          <CheckCircle2 className="text-green-600 mt-1" size={24} />
          <div>
            <h3 className="font-bold text-lg">Pesanan Berhasil Dibuat!</h3>
            <p className="opacity-90">Tim kami akan segera menghubungi Anda untuk konfirmasi penjemputan. Berikut adalah status pesanan Anda.</p>
          </div>
        </div>
      )}

      {error && <p className="text-red-500 mt-4 font-medium text-center">{error}</p>}
      
      {!searchParams.get('id') && orders.length === 0 && !error && (
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Lacak Pesanan</h2>
          <p className="text-slate-500 mb-6">Silakan masuk ke menu Akun untuk melihat riwayat dan melacak pesanan Anda secara lengkap.</p>
          <a href="/dashboard" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition">
            Ke Menu Akun
          </a>
        </div>
      )}

      <div className="space-y-6">
        {orders.map((order, idx) => {
          const currentStepIdx = STATUS_STEPS.indexOf(order.status) !== -1 ? STATUS_STEPS.indexOf(order.status) : 0;

          return (
            <motion.div 
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200"
            >
              <div className="flex flex-col sm:flex-row gap-6 justify-between border-b border-slate-100 pb-6 mb-6">
                <div>
                  <div className="text-sm font-bold text-slate-400 mb-1">ID PESANAN</div>
                  <div className="font-mono text-xl text-slate-900 font-bold">{order.id}</div>
                </div>
                <div className="grid grid-cols-2 sm:flex sm:gap-12 gap-y-4">
                  <div>
                    <div className="text-sm font-bold text-slate-400 mb-1">LAYANAN</div>
                    <div className="font-semibold text-slate-800 capitalize">{order.service_type}</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-400 mb-1">PARFUM</div>
                    <div className="font-semibold text-slate-800 capitalize">{order.scent}</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-400 mb-1">BERAT/JUMLAH</div>
                    <div className="font-semibold text-slate-800">{order.weight ? `${order.weight}` : 'Menunggu timbangan'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-400 mb-1">TOTAL BIAYA</div>
                    <div className="font-bold text-blue-600">{order.total_price ? `Rp ${order.total_price.toLocaleString('id-ID')}` : 'Belum ditentukan'}</div>
                  </div>
                </div>
              </div>

              {/* Progress Tracker */}
              <div className="relative pt-4 pb-2">
                <div className="overflow-x-auto pb-4">
                  <div className="min-w-[600px] flex items-center justify-between relative">
                    {/* Connecting Line */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 rounded-full z-0"></div>
                    <motion.div 
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-500 rounded-full z-0 origin-left"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: Math.max(0, currentStepIdx) / (STATUS_STEPS.length - 1) }}
                      transition={{ duration: 1, ease: "easeInOut", delay: 0.2 }}
                    ></motion.div>

                    {STATUS_STEPS.map((step, index) => {
                      const isCompleted = index < currentStepIdx;
                      const isCurrent = index === currentStepIdx;
                      
                      return (
                         <motion.div 
                           key={index} 
                           initial={{ opacity: 0, y: 20 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                           className="relative z-10 flex flex-col items-center gap-3 w-32"
                         >
                          <motion.div 
                            animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                            transition={isCurrent ? { repeat: Infinity, duration: 2, ease: "easeInOut" } : {}}
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-white border-4 transition-colors duration-500 ${isCompleted ? 'border-blue-500 text-blue-600' : isCurrent ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-[0_0_0_4px_rgba(37,99,235,0.1)]' : 'border-slate-200 text-slate-400'}`}
                          >
                            {isCompleted ? (
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 + index * 0.1 }}>
                                <CheckCircle size={18} />
                              </motion.div>
                            ) : index + 1}
                          </motion.div>
                          <span className={`text-xs font-bold text-center transition-colors duration-500 ${isCurrent ? 'text-blue-700' : isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                            {step}
                          </span>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {order.status === 'Selesai' && !reviews[order.id] && (
                <div className="mt-8 flex justify-center">
                  <button 
                    onClick={() => {
                      setReviewOrder(order);
                      setReviewRating(5);
                      setReviewComment('');
                      setIsReviewModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-amber-50 text-amber-600 font-bold py-3 px-6 rounded-xl hover:bg-amber-100 transition-colors"
                  >
                    <Star size={20} /> Beri Nilai Layanan Ini
                  </button>
                </div>
              )}
              {order.status === 'Selesai' && reviews[order.id] && (
                <div className="mt-8 flex justify-center">
                  <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 font-bold py-3 px-6 rounded-xl">
                    <Star size={20} className="fill-current" /> Anda telah menilai pesanan ini
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
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
