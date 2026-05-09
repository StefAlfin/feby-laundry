import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Tag, Copy, CheckCircle2, Loader2 } from 'lucide-react';
import type { Promo } from '../types';

export default function PromoPage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/promos')
      .then(async res => {
        if (!res.ok) throw new Error('Failed to fetch promos');
        return res.json();
      })
      .then(data => {
        setPromos(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (isLoading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;
  }

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-700 font-semibold mb-4"
          >
            <Tag size={18} /> Promo Spesial Untukmu
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight"
          >
            Lebih Hemat, Lebih Untung
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-500 max-w-2xl mx-auto"
          >
            Pilih dan gunakan kode promo di bawah ini untuk mendapatkan potongan harga eksklusif saat kamu melakukan pemesanan.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {promos.map((promo, idx) => (
            <motion.div
              key={promo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              className="bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow flex flex-col h-full"
            >
              <div className="flex-grow">
                <div className="bg-gradient-to-br from-orange-50 to-red-50 w-14 h-14 rounded-2xl flex items-center justify-center text-orange-600 mb-6">
                  <Tag size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{promo.title}</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">{promo.description}</p>
                
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-lg text-slate-800 tracking-wider disabled select-all">{promo.code}</span>
                    <button 
                      onClick={() => handleCopy(promo.code)}
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                      title="Copy Kode"
                    >
                      {copiedCode === promo.code ? <CheckCircle2 size={20} className="text-green-500" /> : <Copy size={20} />}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-slate-100 pt-6 mt-auto">
                <p className="text-sm font-semibold text-slate-900 mb-1">Berlaku Hingga: <span className="text-blue-600 font-bold">{promo.valid_until}</span></p>
                <p className="text-xs text-slate-500 leading-normal">*Syarat & Ketentuan: {promo.terms}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
