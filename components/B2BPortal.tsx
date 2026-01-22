
import React, { useState, useMemo } from 'react';
import { Submission, SubmissionStatus, Category, SubscriptionTier } from '../types';
import { 
  PRODUCT_HIERARCHY, MOCK_B2B, MOCK_PRICE_MOVEMENTS, MOCK_ARBITRAGE, 
  MOCK_B2B_ALERTS, COUNTRY_CURRENCY, REGIONS 
} from '../constants';
import { formatCurrency, calculateMedian } from '../utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  submissions: Submission[];
}

type B2BView = 'overview' | 'comparison' | 'trends' | 'arbitrage' | 'alerts';

const B2BPortal: React.FC<Props> = ({ submissions }) => {
  const [activeView, setActiveView] = useState<B2BView>('overview');
  const userTier = MOCK_B2B.subscriptionTier || SubscriptionTier.BRONZE;

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      {/* Premium Header */}
      <div className="bg-white rounded-[3rem] border border-slate-200 p-8 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-sm ${
              userTier === SubscriptionTier.GOLD ? 'bg-amber-100 text-amber-600' : 
              userTier === SubscriptionTier.SILVER ? 'bg-slate-100 text-slate-600' : 'bg-amber-50 text-amber-800'
            }`}>
              {userTier} Tier Access
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">B2B Intelligence</h2>
          </div>
          <p className="text-slate-500 font-medium text-sm">
            Active in: {MOCK_B2B.countries?.join(', ')} • Expiry: {MOCK_B2B.expiryDate}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {userTier !== SubscriptionTier.GOLD && (
            <button className="bg-amber-100 text-amber-700 border border-amber-200 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 hover:text-white transition">
              Upgrade to Gold
            </button>
          )}
          <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-200 hover:bg-slate-800 transition">
            Manage Subscription
          </button>
        </div>
      </div>

      {/* Internal Navigation */}
      <div className="flex bg-white/50 backdrop-blur p-2 rounded-[2.5rem] overflow-x-auto no-scrollbar shadow-sm border border-slate-200 max-w-4xl mx-auto">
        <NavTab active={activeView === 'overview'} onClick={() => setActiveView('overview')} icon="fa-chart-pie" label="Overview" />
        <NavTab active={activeView === 'comparison'} onClick={() => setActiveView('comparison')} icon="fa-scale-balanced" label="Comparison" />
        <NavTab active={activeView === 'trends'} onClick={() => setActiveView('trends')} icon="fa-chart-line" label="Trends" />
        <NavTab active={activeView === 'arbitrage'} onClick={() => setActiveView('arbitrage')} icon="fa-hand-holding-dollar" label="Arbitrage" />
        <NavTab active={activeView === 'alerts'} onClick={() => setActiveView('alerts')} icon="fa-bell" label="Alerts" />
      </div>

      <div className="space-y-12">
        {activeView === 'overview' && <OverviewSection />}
        {activeView === 'comparison' && <ComparisonTool submissions={submissions} />}
        {activeView === 'trends' && <TrendsSection submissions={submissions} tier={userTier} />}
        {activeView === 'arbitrage' && <ArbitrageSection tier={userTier} />}
        {activeView === 'alerts' && <AlertsSection tier={userTier} />}
      </div>
    </div>
  );
};

// --- Sub-components ---

const NavTab: React.FC<{ active: boolean, onClick: () => void, icon: string, label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex-1 flex items-center justify-center py-4 px-6 rounded-[2rem] text-[10px] font-black transition-all whitespace-nowrap uppercase tracking-widest ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
  >
    <i className={`fa-solid ${icon} mr-2 text-sm`}></i> {label}
  </button>
);

const OverviewSection: React.FC = () => (
  <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
    {/* Key KPI Row */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatsCard label="Last Updated" value="Jan 23, 2026" subValue="11:45 AM EAT" icon="fa-clock" color="text-indigo-600" />
      <StatsCard label="Validated Data" value="1,252" subValue="Price points this week" icon="fa-database" color="text-emerald-600" />
      <StatsCard label="Market Coverage" value="92%" subValue="15 Cities monitored" icon="fa-earth-africa" color="text-amber-600" />
    </div>

    {/* Price Movements & Alerts */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm space-y-8">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Key Price Movements (This Week)</h3>
        <div className="space-y-6">
          {MOCK_PRICE_MOVEMENTS.map(pm => (
            <div key={pm.id} className="flex gap-6 items-start p-4 hover:bg-slate-50 rounded-2xl transition border border-transparent hover:border-slate-100">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                pm.trend === 'up' ? 'bg-rose-50 text-rose-500' : pm.trend === 'down' ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-400'
              }`}>
                <i className={`fa-solid ${pm.trend === 'up' ? 'fa-arrow-trend-up' : pm.trend === 'down' ? 'fa-arrow-trend-down' : 'fa-minus'}`}></i>
              </div>
              <div className="space-y-1">
                <p className="font-black text-slate-900 leading-tight">{pm.product} ({pm.market})</p>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-black ${pm.trend === 'up' ? 'text-rose-600' : pm.trend === 'down' ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {pm.trend === 'up' ? '+' : ''}{pm.change}% → {formatCurrency(pm.currentPrice, pm.currency)}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">Prev: {formatCurrency(pm.previousPrice, pm.currency)}</span>
                </div>
                <p className="text-xs font-medium text-slate-500 italic">Reason: {pm.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-rose-50 border border-rose-100 rounded-[3rem] p-10 space-y-6">
          <h3 className="text-xs font-black text-rose-800 uppercase tracking-widest flex items-center gap-2">
            <i className="fa-solid fa-triangle-exclamation"></i> Volatility Alerts
          </h3>
          <div className="space-y-4">
            <AlertBox type="warning" text="High volatility detected in Fertilizer category (DAP, Urea) - 7-12% swings." />
            <AlertBox type="warning" text="Cross-border arbitrage opportunity: Steel prices 18% cheaper in Uganda vs Rwanda." />
            <AlertBox type="success" text="Construction materials relatively stable across Kenya, Tanzania." />
          </div>
        </div>
        <div className="bg-slate-900 text-white rounded-[3rem] p-10 space-y-6 shadow-xl">
           <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Weekly Reports (Jan 15-22)</h3>
           <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/10 group cursor-pointer hover:bg-white/10 transition">
              <div className="flex items-center gap-4">
                 <i className="fa-solid fa-file-pdf text-rose-400 text-2xl"></i>
                 <div>
                    <p className="font-black">Weekly Market Bulletin</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PDF • 4.2 MB</p>
                 </div>
              </div>
              <i className="fa-solid fa-download group-hover:translate-y-1 transition-transform"></i>
           </div>
           <button className="w-full py-4 bg-indigo-600 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition">
             Schedule Regular Delivery
           </button>
        </div>
      </div>
    </div>
  </div>
);

const ComparisonTool: React.FC<{ submissions: Submission[] }> = ({ submissions }) => {
  const [selectedProduct, setSelectedProduct] = useState('Cement');

  // Real data-driven comparison based on current state
  const comparisonResults = useMemo(() => {
    const markets = ['Kigali', 'Kampala', 'Nairobi', 'Dar es Salaam'];
    return markets.map(city => {
      const citySubs = submissions.filter(s => 
        s.city === city && 
        s.subCategory === selectedProduct && 
        s.status === SubmissionStatus.APPROVED
      );
      
      const median = calculateMedian(citySubs.map(s => s.priceLocal));
      const currency = citySubs[0]?.currency || COUNTRY_CURRENCY[city === 'Kigali' ? 'Rwanda' : city === 'Kampala' ? 'Uganda' : city === 'Nairobi' ? 'Kenya' : 'Tanzania'];
      const usd = citySubs[0]?.priceUSD || (median / 1300); // Rough fallback

      return {
        city,
        price: median,
        currency,
        usd,
        diff: median === 0 ? 'N/A' : (city === 'Kampala' ? 'LOWEST' : '+15%'), // Mock diff logic
        trend: city === 'Kigali' ? 5.2 : -2.1
      };
    });
  }, [submissions, selectedProduct]);

  return (
    <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
      <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <h3 className="text-xl font-black text-slate-900 tracking-tight">Compare Prices Across Markets</h3>
        <div className="flex gap-2">
           <button className="px-5 py-2.5 bg-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition">Export to Excel</button>
           <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 transition">Set Alert</button>
        </div>
      </div>

      <div className="p-10 bg-slate-50/50 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="space-y-4">
           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
           <select className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-black text-xs outline-none">
             {Object.values(Category).map(c => <option key={c}>{c}</option>)}
           </select>
        </div>
        <div className="space-y-4">
           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Type</label>
           <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-black text-xs outline-none">
             <option>Cement</option>
             <option>Steel</option>
             <option>Fertilizers</option>
           </select>
        </div>
        <div className="space-y-4">
           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Brand (Auto-detected)</label>
           <div className="p-4 bg-slate-100 border border-slate-200 rounded-2xl font-black text-xs text-slate-500">
             Regional Major Brands
           </div>
        </div>
        <div className="space-y-4">
           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reference Unit</label>
           <div className="p-4 bg-slate-100 border border-slate-200 rounded-2xl font-black text-xs text-slate-500">
             Standard (e.g. 50kg bag)
           </div>
        </div>
      </div>

      <div className="p-10 grid grid-cols-1 lg:grid-cols-4 gap-12">
        <div className="space-y-6">
           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Regional Filter</label>
           <div className="space-y-3">
             {['Kigali, Rwanda', 'Kampala, Uganda', 'Bujumbura, Burundi', 'Nairobi, Kenya', 'Dar es Salaam, Tanzania'].map(m => (
               <label key={m} className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" defaultChecked={m !== 'Bujumbura, Burundi' && m !== 'Dar es Salaam, Tanzania'} className="h-5 w-5 rounded-lg border-2 border-slate-200 text-indigo-600 focus:ring-0" />
                  <span className="text-sm font-bold text-slate-600 group-hover:text-indigo-600 transition">{m}</span>
               </label>
             ))}
           </div>
           <button className="w-full mt-4 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-indigo-100">
             Recalculate Insight
           </button>
        </div>

        <div className="lg:col-span-3">
           <div className="overflow-x-auto border border-slate-100 rounded-[2rem]">
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                   <tr>
                      <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">City</th>
                      <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Median Price</th>
                      <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">USD Eq.</th>
                      <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Benchmark</th>
                      <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Trend</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {comparisonResults.map(r => (
                    <tr key={r.city} className="hover:bg-slate-50 transition">
                       <td className="px-8 py-6 font-black text-slate-900">{r.city}</td>
                       <td className="px-8 py-6 font-bold text-slate-700">{r.price === 0 ? '---' : formatCurrency(r.price, r.currency)}</td>
                       <td className="px-8 py-6 font-black text-indigo-600">{r.price === 0 ? '---' : formatCurrency(r.usd, 'USD')}</td>
                       <td className="px-8 py-6">
                         <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${r.diff === 'LOWEST' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{r.diff}</span>
                       </td>
                       <td className="px-8 py-6 flex items-center gap-2">
                          <i className={`fa-solid ${r.trend > 0 ? 'fa-arrow-up text-rose-500' : r.trend < 0 ? 'fa-arrow-down text-emerald-500' : 'fa-minus text-slate-300'}`}></i>
                          <span className={`text-[10px] font-black uppercase ${r.trend > 0 ? 'text-rose-600' : r.trend < 0 ? 'text-emerald-600' : 'text-slate-400'}`}>{r.trend === 0 ? 'Stable' : `${r.trend > 0 ? '+' : ''}${r.trend}%`}</span>
                       </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
           <div className="mt-8 bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100">
             <p className="text-xs font-bold text-indigo-900 leading-relaxed">
               <i className="fa-solid fa-lightbulb mr-2 text-indigo-600"></i>
               Data Analysis: {selectedProduct} prices are showing significant regional variance. Kampala remains the regional price leader for most construction commodities.
             </p>
           </div>
        </div>
      </div>
    </div>
  );
};

const TrendsSection: React.FC<{ submissions: Submission[], tier: SubscriptionTier }> = ({ submissions, tier }) => {
  const isBronze = tier === SubscriptionTier.BRONZE;
  
  const trendData = useMemo(() => [
    { name: 'Jan 25', price: 17500 },
    { name: 'Feb 25', price: 17800 },
    { name: 'Mar 25', price: 19800 },
    { name: 'Apr 25', price: 19200 },
    { name: 'May 25', price: 18900 },
    { name: 'Jun 25', price: 18500 },
    { name: 'Jul 25', price: 18100 },
    { name: 'Aug 25', price: 17800 },
    { name: 'Sep 25', price: 17100 },
    { name: 'Oct 25', price: 17500 },
    { name: 'Nov 25', price: 18000 },
    { name: 'Dec 25', price: 18400 },
    { name: 'Jan 26', price: 18800 },
  ], []);

  if (isBronze) {
    return <LockedView tier="Silver" section="Historical Trends Analysis" />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500">
       <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm space-y-10">
          <div className="flex justify-between items-center">
             <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-1">Price Trends - Last 12 Months</h3>
                <p className="text-sm font-bold text-slate-500">Bamburi Cement 32.5R (50kg) • Regional Aggregated Data</p>
             </div>
             <button className="bg-slate-100 p-3 rounded-xl hover:bg-slate-200 transition">
                <i className="fa-solid fa-ellipsis-vertical"></i>
             </button>
          </div>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={trendData}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis dataKey="name" fontSize={9} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 700}} />
                 <YAxis fontSize={9} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 700}} tickFormatter={v => `${v/1000}k`} />
                 <Tooltip contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 800, fontSize: '12px'}} />
                 <Area type="monotone" dataKey="price" stroke="#4f46e5" fillOpacity={0.1} fill="#4f46e5" strokeWidth={4} />
               </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-50">
             <SummaryBox label="12-Month Average" value="RWF 18,200" />
             <SummaryBox label="Highest Peak" value="RWF 19,800" sub="Mar 2025" />
             <SummaryBox label="Volatility Index" value="Medium" sub="7.2% Std Dev" />
          </div>
       </div>

       <div className="space-y-6">
          <div className="bg-indigo-900 text-white rounded-[3rem] p-8 shadow-xl">
             <h4 className="text-xs font-black uppercase tracking-widest text-indigo-300 mb-6">Chart Annotations</h4>
             <div className="space-y-6">
                <AnnotationItem date="March 2025" text="Price spike (+12%) - Global fuel cost increase impacting logistics." color="bg-rose-500" />
                <AnnotationItem date="August 2025" text="Gradual decline - Increased local production from new plants." color="bg-emerald-500" />
                <AnnotationItem date="Jan 2026" text="Recent uptick - Cross-border supply disruptions." color="bg-amber-500" />
             </div>
          </div>
          <button className="w-full py-5 bg-white border border-slate-200 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition shadow-sm">
             Download Historical Data
          </button>
       </div>
    </div>
  );
};

const ArbitrageSection: React.FC<{ tier: SubscriptionTier }> = ({ tier }) => {
  if (tier !== SubscriptionTier.GOLD) {
    return <LockedView tier="Gold" section="Regional Arbitrage & Logistics Analysis" />;
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
       <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Cross-Border Price Spreads</h3>
            <p className="text-sm font-bold text-slate-500">Live opportunities identified with >15% price difference.</p>
          </div>
          <button className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100">Export Analysis</button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_ARBITRAGE.map((op, idx) => (
            <div key={op.id} className="bg-white rounded-[3rem] border border-slate-200 p-8 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
               <div className="absolute -top-4 -right-4 h-24 w-24 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600/10 text-6xl group-hover:scale-125 transition">
                 <i className="fa-solid fa-sack-dollar"></i>
               </div>
               
               <div className="space-y-6 relative z-10">
                 <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black bg-slate-900 text-white px-3 py-1 rounded-full uppercase tracking-tighter">OP #{idx + 1}</span>
                    <h4 className="text-lg font-black text-slate-900">{op.product}</h4>
                 </div>

                 <div className="flex flex-col gap-4">
                    <MarketStep type="Buy" market={op.buyMarket} price={formatCurrency(op.buyPriceUSD, 'USD')} />
                    <div className="flex justify-center py-2">
                       <i className="fa-solid fa-arrow-down text-slate-200 text-xl"></i>
                    </div>
                    <MarketStep type="Sell" market={op.sellMarket} price={formatCurrency(op.sellPriceUSD, 'USD')} />
                 </div>

                 <div className="pt-6 border-t border-slate-50">
                    <div className="flex justify-between items-end mb-4">
                       <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Gross Spread</p>
                          <p className="text-4xl font-black text-emerald-600 tracking-tighter">{op.spread}%</p>
                       </div>
                       <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">High Opportunity</span>
                    </div>
                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Considerations</p>
                       {op.considerations.map((c, i) => (
                         <div key={i} className="flex gap-2 text-xs font-bold text-slate-600">
                           <i className="fa-solid fa-circle-check text-indigo-400 mt-0.5"></i>
                           <span>{c}</span>
                         </div>
                       ))}
                    </div>
                 </div>
               </div>
            </div>
          ))}
       </div>
    </div>
  );
};

const AlertsSection: React.FC<{ tier: SubscriptionTier }> = ({ tier }) => {
  if (tier === SubscriptionTier.BRONZE) {
    return <LockedView tier="Silver" section="Automated Market Alerts" />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
       <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-2">Market Watchlist</h3>
            <p className="text-sm font-bold text-slate-500">Managing 2/10 active notification triggers.</p>
          </div>
          <button className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-100 hover:scale-105 transition">
             Create New Alert
          </button>
       </div>

       <div className="space-y-4">
          {MOCK_B2B_ALERTS.map(alert => (
            <div key={alert.id} className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm hover:border-indigo-100 transition flex items-center justify-between">
               <div className="flex items-center gap-6">
                  <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-xl shadow-sm ${alert.active ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                    <i className="fa-solid fa-bolt"></i>
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 mb-1">{alert.product}</h4>
                    <p className="text-xs font-bold text-slate-500">{alert.trigger}</p>
                    <div className="flex gap-2 mt-2">
                       {alert.method.map(m => (
                         <span key={m} className="text-[8px] font-black uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-md text-slate-400">{m}</span>
                       ))}
                    </div>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <button className={`h-12 w-12 rounded-xl flex items-center justify-center transition border ${alert.active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                    <i className="fa-solid fa-toggle-on text-xl"></i>
                  </button>
                  <button className="h-12 w-12 rounded-xl flex items-center justify-center text-slate-300 hover:text-rose-600 transition">
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
               </div>
            </div>
          ))}
       </div>
    </div>
  );
};

const SummaryBox: React.FC<{ label: string, value: string, sub?: string }> = ({ label, value, sub }) => (
  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-xl font-black text-slate-900">{value}</p>
    {sub && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{sub}</p>}
  </div>
);

const AnnotationItem: React.FC<{ date: string, text: string, color: string }> = ({ date, text, color }) => (
  <div className="flex gap-4">
    <div className={`h-2 w-2 rounded-full mt-1.5 flex-shrink-0 ${color}`}></div>
    <div>
      <p className="text-[10px] font-black uppercase text-indigo-200 tracking-widest mb-1">{date}</p>
      <p className="text-xs font-bold text-indigo-100 leading-relaxed opacity-80">{text}</p>
    </div>
  </div>
);

const MarketStep: React.FC<{ type: string, market: string, price: string }> = ({ type, market, price }) => (
  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
     <div>
        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400">{type}</span>
        <p className="text-sm font-black text-slate-900 leading-none mt-1">{market}</p>
     </div>
     <p className="text-lg font-black text-slate-900">{price}</p>
  </div>
);

const AlertBox: React.FC<{ type: 'warning' | 'success', text: string }> = ({ type, text }) => (
  <div className={`flex gap-4 p-5 rounded-3xl border ${
    type === 'warning' ? 'bg-rose-100/30 border-rose-100 text-rose-800' : 'bg-emerald-100/30 border-emerald-100 text-emerald-800'
  }`}>
    <i className={`fa-solid ${type === 'warning' ? 'fa-circle-exclamation' : 'fa-circle-check'} text-lg mt-0.5`}></i>
    <p className="text-sm font-black leading-tight">{text}</p>
  </div>
);

const StatsCard: React.FC<{ label: string, value: string, subValue: string, icon: string, color: string }> = ({ label, value, subValue, icon, color }) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm group hover:border-indigo-100 transition">
    <div className="flex items-center justify-between mb-4">
      <div className={`h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xl shadow-sm group-hover:bg-white transition ${color}`}>
        <i className={`fa-solid ${icon}`}></i>
      </div>
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
    <p className="text-2xl font-black text-slate-900 tracking-tighter mb-1">{value}</p>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{subValue}</p>
  </div>
);

const LockedView: React.FC<{ tier: string, section: string }> = ({ tier, section }) => (
  <div className="py-24 text-center bg-white rounded-[4rem] border-4 border-dashed border-slate-100 shadow-sm max-w-4xl mx-auto space-y-8">
     <div className="h-24 w-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-4xl text-slate-300">
        <i className="fa-solid fa-lock"></i>
     </div>
     <div className="space-y-3">
        <h3 className="text-3xl font-black text-slate-900 tracking-tight">{section}</h3>
        <p className="text-slate-500 font-medium max-w-sm mx-auto">This tool is exclusive to <strong>{tier} Tier</strong> subscribers and above.</p>
     </div>
     <button className="bg-amber-100 text-amber-700 px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-[11px] shadow-xl shadow-amber-100 hover:bg-amber-600 hover:text-white transition">
       Upgrade to {tier} Access
     </button>
  </div>
);

export default B2BPortal;
