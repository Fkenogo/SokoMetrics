
import React, { useMemo, useState } from 'react';
import { Submission, SubmissionStatus } from '../types';
import { formatCurrency, calculateMedian } from '../utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ProductDetailPageProps {
  criteria: {
    brand: string;
    subCategory: string;
    detailValue: string;
  };
  submissions: Array<Submission>;
  onBack: () => void;
  onLoginContributor: () => void;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ criteria, submissions, onBack, onLoginContributor }) => {
  const [alertPrice, setAlertPrice] = useState('');
  const [alertType, setAlertType] = useState<'Email' | 'SMS' | 'WhatsApp'>('Email');

  const filteredSubs = useMemo(() => {
    return submissions.filter(s => 
      s.brand === criteria.brand && 
      s.subCategory === criteria.subCategory && 
      s.detailValue === criteria.detailValue &&
      s.status === SubmissionStatus.APPROVED
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [submissions, criteria]);

  const medianPrice = useMemo(() => calculateMedian(filteredSubs.map(s => s.priceLocal)), [filteredSubs]);
  const currency = filteredSubs[0]?.currency || 'RWF';
  const unit = filteredSubs[0]?.unit || 'unit';

  const priceRange = useMemo(() => {
    if (filteredSubs.length === 0) return { min: 0, max: 0 };
    const now = new Date();
    const last7Days = filteredSubs.filter(s => {
      const diff = (now.getTime() - new Date(s.timestamp).getTime()) / (1000 * 3600 * 24);
      return diff <= 7;
    });
    const target = last7Days.length > 0 ? last7Days : filteredSubs;
    const prices = target.map(s => s.priceLocal);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }, [filteredSubs]);

  // Mock trend data
  const trendData = useMemo(() => [
    { name: '4w ago', price: medianPrice * 0.95 },
    { name: '3w ago', price: medianPrice * 0.98 },
    { name: '2w ago', price: medianPrice * 1.02 },
    { name: '1w ago', price: medianPrice * 1.01 },
    { name: 'Today', price: medianPrice },
  ], [medianPrice]);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition"
      >
        <i className="fa-solid fa-arrow-left"></i> Back to results
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Product Identity */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[3rem] p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-8 items-center">
            <div className="w-full md:w-64 h-64 bg-slate-100 rounded-[2.5rem] flex items-center justify-center text-slate-300 relative overflow-hidden group">
              <i className="fa-solid fa-image text-6xl"></i>
              <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition duration-500"></div>
            </div>
            <div className="flex-grow space-y-4 text-center md:text-left">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
                {criteria.brand} {criteria.subCategory}
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                <span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{criteria.detailValue}</span>
                <span className="bg-slate-100 text-slate-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{unit}</span>
              </div>
              <div className="pt-4 grid grid-cols-2 gap-4 border-t border-slate-100 mt-6">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Median Price</p>
                  <p className="text-2xl font-black text-indigo-600">{formatCurrency(medianPrice, currency)}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">7D Range</p>
                  <p className="text-sm font-bold text-slate-900">
                    {formatCurrency(priceRange.min, currency)} - {formatCurrency(priceRange.max, currency)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Trend Chart */}
          <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-10">4-Week Price Trajectory</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorPriceDetail" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" fontSize={9} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 700}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 800, fontSize: '12px'}}
                  />
                  <Area type="monotone" dataKey="price" stroke="#4f46e5" fillOpacity={1} fill="url(#colorPriceDetail)" strokeWidth={4} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Quick Actions & Alert */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-[3rem] p-8 shadow-xl space-y-4">
             <button 
               onClick={onLoginContributor}
               className="w-full bg-indigo-600 hover:bg-indigo-700 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] transition shadow-lg shadow-indigo-500/20"
             >
               Submit New Price
             </button>
             <button className="w-full bg-white/10 hover:bg-white/20 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] transition">
               View All on Map
             </button>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 rounded-[3rem] p-8 space-y-6">
            <div>
              <h3 className="text-sm font-black text-indigo-900 uppercase tracking-widest mb-2">Set Price Alert</h3>
              <p className="text-[11px] text-indigo-700 font-bold opacity-70 mb-4">Get notified instantly when prices drop below your threshold.</p>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <input 
                  type="number" 
                  placeholder={`Target ${currency}`} 
                  className="w-full bg-white border border-indigo-200 rounded-2xl px-6 py-4 text-sm font-black outline-none focus:ring-4 focus:ring-indigo-100 transition"
                  value={alertPrice}
                  onChange={(e) => setAlertPrice(e.target.value)}
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">{currency}</span>
              </div>
              
              <div className="flex gap-2">
                {(['Email', 'SMS', 'WhatsApp'] as const).map(type => (
                  <button 
                    key={type}
                    onClick={() => setAlertType(type)}
                    className={`flex-1 py-3 rounded-xl border-2 text-[8px] font-black uppercase tracking-widest transition ${alertType === type ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-indigo-100 text-indigo-400 hover:border-indigo-400'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <button className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-200 transform active:scale-95 transition">
                Activate Alert
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Submissions Table */}
      <div className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-10 py-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Recent Market Submissions</h3>
          <span className="bg-slate-50 px-3 py-1 rounded-full text-[8px] font-black text-slate-400 uppercase tracking-widest">Showing last 10</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Store & Location</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Price</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Age</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubs.slice(0, 10).map(s => {
                const hoursAgo = Math.floor((new Date().getTime() - new Date(s.timestamp).getTime()) / (1000 * 3600));
                return (
                  <tr key={s.id} className="hover:bg-slate-50 transition group">
                    <td className="px-10 py-6">
                      <p className="font-black text-slate-900 group-hover:text-indigo-600 transition truncate">{s.supplierName}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.city}, {s.country}</p>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <p className="text-xl font-black text-slate-900 leading-none">{formatCurrency(s.priceLocal, s.currency)}</p>
                    </td>
                    <td className="px-10 py-6">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        {hoursAgo === 0 ? 'Recently' : `${hoursAgo}h ago`}
                      </p>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-emerald-500">
                        <i className="fa-solid fa-circle-check text-[10px]"></i>
                        <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredSubs.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-20 text-center text-slate-400 font-bold italic">No submissions available for this product yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
