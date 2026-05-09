import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calculator, CheckCircle2, Truck, Droplets, Search, Star } from 'lucide-react';
import { motion } from 'motion/react';

interface Service {
  id: string;
  name: string;
  priceBase: number;
  unit: string;
}

export default function HomePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [estimateWeight, setEstimateWeight] = useState<number>(0);
  const [selectedService, setSelectedService] = useState<string>('kiloan');
  const [topReviews, setTopReviews] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => {
        setServices(data);
      })
      .catch(console.error);
      
    fetch('/api/top-reviews')
      .then(res => res.json())
      .then(data => setTopReviews(data))
      .catch(console.error);
  }, []);

  const getEstimatedPrice = () => {
    const service = services.find(s => s.id === selectedService);
    if (!service) return 0;
    return service.priceBase * (estimateWeight || 0);
  };

  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem('token'));
  }, []);

  return (
    <div className="flex flex-col bg-slate-50 font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-8 lg:pt-16 pb-32 px-4 border-b border-slate-100">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-transparent to-transparent opacity-80"></div>
        <div className="absolute -left-20 top-20 w-96 h-96 bg-blue-100/50 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-1/4 w-72 h-72 bg-sky-100/50 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50/80 text-blue-700 text-sm font-semibold mb-6 border border-blue-100 backdrop-blur-sm"
            >
              ✨ Premium Laundry Service
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight"
            >
              Laundry Bersih,<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-400">Gak Pake Ribet.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-slate-500 mb-10 max-w-xl leading-relaxed"
            >
              Kami jemput cucian kotor Anda, rawat dengan sepenuh hati menggunakan bahan premium, dan kembalikan wangi serta rapi siap pakai.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <Link to={token ? "/pesan" : "/dashboard"} className="group relative inline-flex justify-center items-center gap-2 overflow-hidden rounded-full bg-blue-600 px-8 py-4 text-white font-bold text-lg hover:bg-blue-700 transition shadow-xl shadow-blue-600/20 w-fit">
                  <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></span>
                  <span className="relative flex items-center gap-2">Pesan Antar-Jemput <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></span>
                </Link>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm border border-slate-100 p-4 rounded-2xl shadow-sm flex items-center gap-4 w-fit">
                <div className="bg-gradient-to-br from-green-400 to-emerald-500 text-white p-3 rounded-xl shadow-sm">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-slate-900">Garansi Bersih 100%</p>
                  <p className="text-xs text-slate-600 font-medium">Baju Rapi, Wangi Tahan Lama</p>
                </div>
              </div>
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative lg:h-[600px] flex gap-4 lg:gap-6 mt-12 lg:mt-0 justify-center w-full max-w-2xl lg:max-w-none mx-auto lg:ml-auto"
          >
            <div className="flex flex-col gap-4 lg:gap-6 w-1/2 pt-8 lg:pt-16">
              <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl shadow-slate-300/40 group">
                <img 
                  src="https://images.unsplash.com/photo-1545173168-9f1947eebb7f?q=80&w=800&auto=format&fit=crop" 
                  alt="Handuk bersih" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              <div className="relative w-full aspect-square rounded-3xl overflow-hidden shadow-2xl shadow-slate-300/40 group">
                <img 
                  src="https://images.unsplash.com/photo-1582735689369-4fe89db7114c?q=80&w=800&auto=format&fit=crop" 
                  alt="Mesin cuci" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-4 lg:gap-6 w-1/2 pb-8 lg:pb-16 -mt-8">
              <div className="relative w-full aspect-square rounded-3xl overflow-hidden shadow-2xl shadow-slate-300/40 group">
                <img 
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1KFB3lW6CDzdqidmapHiwwsGA5sLOIZ3p0Q&s" 
                  alt="Pakaian rapi" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                />
              </div>
              <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 to-sky-500 shadow-2xl shadow-blue-500/30 flex flex-col justify-center items-center text-center p-6 text-white group">
                <Droplets size={48} className="mb-4 text-blue-100 group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500" />
                <h3 className="font-extrabold text-3xl mb-2">100%</h3>
                <p className="text-blue-100 font-medium text-sm lg:text-base leading-tight">Kepuasan<br/>Pelanggan</p>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent opacity-50"></div>
              </div>
            </div>
            
            {/* Decorative blob behind */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-blue-200/50 rounded-full mix-blend-multiply filter blur-3xl -z-10"></div>
          </motion.div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Kenapa Harus Feby Laundry?</h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">Keunggulan pelayanan kami untuk kepuasan Anda</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <motion.div 
            whileHover={{ y: -5 }}
            className="text-center p-8 bg-white rounded-3xl border border-slate-100 shadow-sm transition-all"
          >
            <div className="bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ring-4 ring-white shadow-sm">
              <Truck size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4 pb-4 border-b border-slate-100">Antar Jemput Gratis</h3>
            <p className="text-slate-500 leading-relaxed font-medium">Radius 5km dari outlet kami. Pesan via web, kurir sigap datang ke rumah, tanpa ribet keluar rumah.</p>
          </motion.div>
          <motion.div 
            whileHover={{ y: -5 }}
            className="text-center p-8 bg-blue-600 rounded-3xl shadow-xl shadow-blue-600/20 text-white transition-all transform md:-translate-y-4"
          >
            <div className="bg-white/20 backdrop-blur-sm text-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ring-4 ring-blue-500">
              <CheckCircle2 size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-4 pb-4 border-b border-blue-500/30">Pilihan Parfum Eksklusif</h3>
            <p className="text-blue-100 leading-relaxed font-medium">Bebas pilih parfum Sakura, Lavender Premium, atau pilihan 'tanpa parfum' khusus untuk kulit sensitif.</p>
          </motion.div>
          <motion.div 
            whileHover={{ y: -5 }}
            className="text-center p-8 bg-white rounded-3xl border border-slate-100 shadow-sm transition-all"
          >
            <div className="bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ring-4 ring-white shadow-sm">
              <Search size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4 pb-4 border-b border-slate-100">Lacak Status Real-Time</h3>
            <p className="text-slate-500 leading-relaxed font-medium">Pantau transparan proses cucian Anda dari penjemputan hingga selesai disetrika lewat website tracking kami.</p>
          </motion.div>
        </div>
      </section>

      {/* Top Reviews Section */}
      {topReviews.length > 0 && (
        <section className="py-24 px-4 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Apa Kata Pelanggan Kami?</h2>
              <p className="text-slate-500 max-w-2xl mx-auto text-lg">Kepuasan Anda adalah prioritas utama pelayanan kami.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {topReviews.slice(0, 6).map((review) => (
                <div key={review.id} className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex flex-col items-center text-center hover:shadow-lg transition-shadow duration-300">
                  <div className="flex gap-1 mb-6">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        size={24} 
                        className={i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"} 
                      />
                    ))}
                  </div>
                  <p className="text-slate-700 italic flex-grow mb-6">
                    "{review.comment || 'Pelayanan sangat memuaskan dan cepat'}"
                  </p>
                  <div className="mt-auto">
                    <h4 className="font-bold text-slate-900 text-lg">{review.customer_name}</h4>
                    <p className="text-sm text-slate-500 font-medium">{new Date(review.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
