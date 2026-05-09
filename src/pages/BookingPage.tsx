import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShoppingBag, ArrowRight } from 'lucide-react';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

        <form onSubmit={handleSubmit} className="space-y-6">
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
    </div>
  );
}
