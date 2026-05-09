import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Package, CheckCircle2, ArrowRight, Calculator } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Service {
  id: string;
  name: string;
  priceBase: number;
  unit: string;
}

export default function PackagePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [estimateWeight, setEstimateWeight] = useState<number>(0);
  const [selectedService, setSelectedService] = useState<string>('kiloan');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem('token'));
    fetch('/api/services')
      .then(res => res.json())
      .then(data => {
        setServices(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const getEstimatedPrice = () => {
    const service = services.find(s => s.id === selectedService);
    if (!service) return 0;
    return service.priceBase * (estimateWeight || 0);
  };

  return (
    <div className="py-12 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Paket & Harga Laundry</h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          Pilih layanan terbaik untuk kebutuhan pakaian dan barang-barang Anda. Harga kompetitif dengan kualitas premium.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <motion.div 
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col hover:shadow-xl transition-shadow duration-300 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Package size={64} />
              </div>
              <div className="mb-6 relative z-10">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{service.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-blue-600">Rp {service.priceBase.toLocaleString('id-ID')}</span>
                  <span className="text-slate-500 font-medium">/{service.unit}</span>
                </div>
              </div>
              
              <ul className="space-y-3 mb-8 flex-grow relative z-10">
                <li className="flex items-start gap-2 text-slate-600">
                  <CheckCircle2 size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Pencucian bersih & higienis</span>
                </li>
                <li className="flex items-start gap-2 text-slate-600">
                  <CheckCircle2 size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Setrika rapi & lipat</span>
                </li>
                <li className="flex items-start gap-2 text-slate-600">
                  <CheckCircle2 size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Pilihan parfum premium</span>
                </li>
              </ul>

              <Link 
                to={token ? "/pesan" : "/dashboard"} 
                className="w-full py-3 px-4 bg-slate-50 hover:bg-blue-600 text-slate-700 hover:text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 relative z-10"
              >
                Pilih Paket <ArrowRight size={18} />
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Estimation Calculator */}
      {!loading && services.length > 0 && (
        <section className="mt-24 bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-14 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] w-full relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center gap-16 relative z-10">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-blue-600 text-white p-3 rounded-2xl shadow-lg shadow-blue-600/30">
                  <Calculator size={28} />
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Kalkulator Estimasi</h2>
              </div>
              <p className="text-slate-500 mb-8 text-lg leading-relaxed">Hitung perkiraan biaya dengan akurat sebelum kurir kami menjemput pakaian Anda.</p>
              
              <div className="space-y-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-slate-700 mb-2 transition-colors group-focus-within:text-blue-600">Jenis Layanan</label>
                  <select 
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full border-2 border-slate-200 rounded-xl py-3.5 px-4 focus:outline-none focus:border-blue-600 focus:ring-0 text-slate-800 bg-slate-50/50 transition-colors font-medium cursor-pointer"
                  >
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.name} - Rp {s.priceBase.toLocaleString('id-ID')}/{s.unit}</option>
                    ))}
                  </select>
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-slate-700 mb-2 transition-colors group-focus-within:text-blue-600">Perkiraan Jumlah ({services.find(s => s.id === selectedService)?.unit || 'kg'})</label>
                  <input 
                    type="number"
                    min="0"
                    placeholder="Contoh: 5"
                    value={estimateWeight || ''}
                    onChange={(e) => setEstimateWeight(Number(e.target.value))}
                    className="w-full border-2 border-slate-200 rounded-xl py-3.5 px-4 focus:outline-none focus:border-blue-600 focus:ring-0 text-slate-800 bg-slate-50/50 transition-colors placeholder:text-slate-400 font-medium"
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 w-full md:w-auto md:min-w-[340px] p-10 rounded-[2rem] shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Calculator size={100} className="text-white"/>
              </div>
              <span className="text-sm font-bold text-sky-400 mb-3 uppercase tracking-widest relative z-10">ESTIMASI BIAYA</span>
              <span className="text-5xl font-black text-white mb-8 relative z-10 tracking-tight">Rp {getEstimatedPrice().toLocaleString('id-ID')}</span>
              <Link to={token ? "/pesan" : "/dashboard"} className="w-full bg-blue-500 text-white py-4 rounded-xl font-bold hover:bg-blue-400 hover:-translate-y-0.5 transition-all shadow-lg shadow-blue-500/30 relative z-10">
                Pesan Sekarang
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
