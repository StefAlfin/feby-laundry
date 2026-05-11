import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, ArrowRight, X } from 'lucide-react';

interface Service {
  id: string;
  name: string;
}

export default function BookingPage() {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [formData, setFormData] = useState({
    customer_name: localStorage.getItem('userName') || '',
    phone: '',
    address: '',
    service_type: 'kiloan',
    scent: 'sakura',
    notes: '',
    promo_code: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => setServices(data))
      .catch(console.error);

    const token = localStorage.getItem('token');
    if (token && !formData.customer_name) {
      try {
        const userPayload = JSON.parse(atob(token));
        if (userPayload && userPayload.username) {
          setFormData(prev => ({ ...prev, customer_name: userPayload.username }));
        }
      } catch (e) {}
    }
  }, []);

  const handleReviewOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const confirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload: any = { ...formData };
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userPayload = JSON.parse(atob(token));
          if (userPayload && userPayload.id) {
            payload.user_id = userPayload.id;
          }
        } catch (e) {}
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const order = await res.json();
        setIsModalOpen(false);
        navigate(`/lacak?id=${order.id}`, { state: { success: true } });
      } else {
        const err = await res.json();
        alert(err.error || 'Gagal membuat pesanan');
      }
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan jaringan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 px-4 max-w-3xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-200"
      >
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
          <div className="bg-blue-100 p-3 rounded-2xl text-blue-600">
            <ShoppingBag size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Pesan Antar-Jemput</h1>
            <p className="text-slate-500 mt-1">Kami jemput cucian Anda di lokasi.</p>
          </div>
        </div>

        <form onSubmit={handleReviewOrder} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Lengkap</label>
              <input 
                required
                type="text" 
                placeholder="Cth: Feby Aryanti"
                className="w-full border border-slate-300 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
                value={formData.customer_name}
                onChange={e => setFormData({...formData, customer_name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">No. WhatsApp</label>
              <input 
                required
                type="tel" 
                placeholder="Cth: 081234567890"
                className="w-full border border-slate-300 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Alamat Lengkap / Jemput</label>
            <textarea 
              required
              rows={3}
              placeholder="Jalan, RT/RW, Patokan Rumah..."
              className="w-full border border-slate-300 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-200">
             <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Jenis Layanan Utama</label>
              <select 
                className="w-full border border-slate-300 rounded-xl py-3 px-4 bg-white focus:ring-2 focus:ring-blue-500 text-slate-900"
                value={formData.service_type}
                onChange={e => setFormData({...formData, service_type: e.target.value})}
              >
                {services.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Pilihan Aroma Parfum</label>
              <select 
                className="w-full border border-slate-300 rounded-xl py-3 px-4 bg-white focus:ring-2 focus:ring-blue-500 text-slate-900"
                value={formData.scent}
                onChange={e => setFormData({...formData, scent: e.target.value})}
              >
                <option value="sakura">Sakura (Best Seller)</option>
                <option value="lavender">Lavender (Relaxing)</option>
                <option value="ocean">Ocean Fresh</option>
                <option value="none">Tanpa Parfum (Kulit Sensitif)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Catatan Tambahan (Opsional)</label>
              <input 
                type="text" 
                placeholder="Cth: Ada noda tinta di kemeja putih"
                className="w-full border border-slate-300 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Kode Promo (Opsional)</label>
              <input 
                type="text" 
                placeholder="Masukkan kode promo..."
                className="w-full border border-slate-300 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 uppercase font-mono"
                value={formData.promo_code}
                onChange={e => setFormData({...formData, promo_code: e.target.value.toUpperCase()})}
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-blue-600 text-white font-bold py-4 px-8 rounded-xl hover:bg-blue-700 transition flex items-center gap-2 shadow-lg disabled:opacity-70"
            >
              {isSubmitting ? 'Memproses...' : 'Kirim Pesanan Sekarang'} <ArrowRight size={20} />
            </button>
          </div>
        </form>
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
              onClick={() => setIsModalOpen(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-xl font-bold text-slate-900">Konfirmasi Pesanan</h3>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="text-slate-400 hover:text-slate-600 bg-white shadow-sm p-2 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-7 space-y-4">
                <p className="text-slate-600 mb-2">Mohon periksa kembali detail pesanan Anda sebelum kami proses.</p>
                
                <div className="bg-slate-50 rounded-2xl p-5 space-y-3 border border-slate-100">
                  <div className="grid grid-cols-3 gap-2 border-b border-slate-200 pb-2">
                    <span className="text-sm text-slate-500 col-span-1">Nama</span>
                    <span className="text-sm font-semibold text-slate-900 col-span-2">{formData.customer_name}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 border-b border-slate-200 pb-2">
                    <span className="text-sm text-slate-500 col-span-1">No. WA</span>
                    <span className="text-sm font-semibold text-slate-900 col-span-2">{formData.phone}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 border-b border-slate-200 pb-2">
                    <span className="text-sm text-slate-500 col-span-1">Layanan</span>
                    <span className="text-sm font-semibold text-slate-900 col-span-2 capitalize">{services.find(s => s.id === formData.service_type)?.name || formData.service_type}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 border-b border-slate-200 pb-2">
                    <span className="text-sm text-slate-500 col-span-1">Parfum</span>
                    <span className="text-sm font-semibold text-slate-900 col-span-2 capitalize">{formData.scent}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-sm text-slate-500 col-span-1">Alamat</span>
                    <span className="text-sm font-semibold text-slate-900 col-span-2 leading-relaxed">{formData.address}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={confirmSubmit}
                    disabled={isSubmitting}
                    className="flex-2 w-2/3 px-4 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
                  >
                    {isSubmitting ? 'Memproses...' : 'Ya, Kirim Pesanan'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
