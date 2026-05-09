import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin, Phone, Mail, Send, Loader2 } from 'lucide-react';

export default function ContactPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loadingConfig, setLoadingConfig] = useState(true);
  
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setLoadingConfig(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingConfig(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      if (res.ok) {
        setSuccess(true);
        setForm({ name: '', email: '', message: '' });
      } else {
        const data = await res.json();
        setError(data.error || 'Terjadi kesalahan, silahkan coba lagi');
      }
    } catch (err) {
      setError('Terjadi kesalahan, silahkan coba lagi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Hubungi Kami</h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          Ada pertanyaan seputar layanan kami? Tim kami siap membantu Anda kapan saja.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm"
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Informasi Kontak</h2>
          
          {loadingConfig ? (
             <div className="animate-pulse space-y-4">
               <div className="h-12 bg-slate-100 rounded-xl"></div>
               <div className="h-12 bg-slate-100 rounded-xl"></div>
             </div>
          ) : (
            <div className="space-y-6">
              {settings.contact_phone && (
                <div className="flex items-start gap-4">
                  <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">WhatsApp / Telepon</h3>
                    <p className="text-slate-600 mt-1">{settings.contact_phone}</p>
                  </div>
                </div>
              )}
              
              {settings.contact_address && (
                <div className="flex items-start gap-4">
                  <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Alamat Laundry</h3>
                    <p className="text-slate-600 mt-1">{settings.contact_address}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-12 bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-2">Jam Operasional</h3>
            <ul className="space-y-2 text-slate-600">
              <li className="flex justify-between"><span>Senin - Jumat</span> <span className="font-medium">08:00 - 20:00</span></li>
              <li className="flex justify-between"><span>Sabtu - Minggu</span> <span className="font-medium">09:00 - 18:00</span></li>
            </ul>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm"
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Kirim Pesan</h2>
          
          {success ? (
            <div className="bg-green-50 text-green-700 p-6 rounded-2xl border border-green-100 text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Pesan Berhasil Terkirim!</h3>
              <p>Terima kasih telah menghubungi kami. Tim kami akan segera menanggapi pesan Anda.</p>
              <button 
                onClick={() => setSuccess(false)}
                className="mt-6 text-green-600 font-semibold hover:text-green-700"
              >
                Kirim pesan lain
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">{error}</div>}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Lengkap</label>
                <input 
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  className="w-full border-2 border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-600 focus:ring-0 text-slate-800 bg-slate-50/50"
                  placeholder="Masukkan nama Anda"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                <input 
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
                  className="w-full border-2 border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-600 focus:ring-0 text-slate-800 bg-slate-50/50"
                  placeholder="Masukkan alamat email Anda"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Pesan</label>
                <textarea 
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({...form, message: e.target.value})}
                  className="w-full border-2 border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-600 focus:ring-0 text-slate-800 bg-slate-50/50 resize-none"
                  placeholder="Tulis pesan pertanyaan atau keluhan Anda di sini..."
                ></textarea>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-700 transition flex justify-center items-center gap-2 shadow-lg shadow-blue-600/30 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : <><Send size={20} /> Kirim Pesan</>}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
