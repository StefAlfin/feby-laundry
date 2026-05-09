import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, Loader2, CheckCircle2, Clock, CheckCircle } from 'lucide-react';
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [hasSuccessMsg, setHasSuccessMsg] = useState(location.state?.success || false);

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
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
