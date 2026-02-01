
import React, { useState, useMemo } from 'react';
import { 
  Submission, SubmissionStatus, Category, SubscriptionTier, 
  PriceMovement, ArbitrageOpportunity, B2BAlert, StockStatus 
} from '../types';
import { 
  PRODUCT_HIERARCHY, MOCK_B2B, MOCK_PRICE_MOVEMENTS, MOCK_ARBITRAGE, 
  MOCK_B2B_ALERTS, COUNTRY_CURRENCY, REGIONS, CURRENCIES 
} from '../constants';
import { formatCurrency, calculateMedian } from '../utils';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, Cell,
  PieChart, Pie, Legend, ComposedChart
} from 'recharts';

interface Props {
  submissions: Submission[];
}

type MainModule = 'overview' | 'intelligence' | 'supply_chain' | 'dynamics' | 'quality' | 'reporting' | 'alerts' | 'support';

const B2BPortal: React.FC<Props> = ({ submissions }) => {
  const [activeModule, setActiveModule] = useState<MainModule>('overview');
  const userTier = MOCK_B2B.subscriptionTier || SubscriptionTier.BRONZE;

  const isGold = userTier === SubscriptionTier.GOLD;
  const isSilver = userTier === SubscriptionTier.SILVER || isGold;

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[800px] animate-in fade-in duration-700">
      {/* Sidebar Navigation */}
      <aside className="lg:w-72 flex-shrink-0 space-y-2">
        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <i className="fa-solid fa-gem text-sm"></i>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Subscriber</p>
              <p className="text-sm font-black text-slate-900">{MOCK_B2B.name}</p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-center border ${
            isGold ? 'bg-amber-100 text-amber-700 border-amber-200' : 
            isSilver ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-orange-50 text-orange-700 border-orange-100'
          }`}>
            {userTier} Tier Access
          </div>
        </div>

        <nav className="space-y-1">
          <NavButton active={activeModule === 'overview'} onClick={() => setActiveModule('overview')} icon="fa-chart-pie" label="Executive Overview" />
          <NavButton active={activeModule === 'intelligence'} onClick={() => setActiveModule('intelligence')} icon="fa-magnifying-glass-chart" label="Price Intelligence" />
          <NavButton active={activeModule === 'supply_chain'} onClick={() => setActiveModule('supply_chain')} icon="fa-truck-ramp-box" label="Supply Chain" />
          <NavButton active={activeModule === 'dynamics'} onClick={() => setActiveModule('dynamics')} icon="fa-wave-square" label="Market Dynamics" />
          <NavButton active={activeModule === 'quality'} onClick={() => setActiveModule('quality')} icon="fa-shield-check" label="Data Quality" />
          <NavButton active={activeModule === 'reporting'} onClick={() => setActiveModule('reporting')} icon="fa-file-invoice-dollar" label="Custom Reports" lock={!isSilver} />
          <NavButton active={activeModule === 'alerts'} onClick={() => setActiveModule('alerts')} icon="fa-bell" label="Alert Center" />
          <div className="pt-4 mt-4 border-t border-slate-200">
            <NavButton active={activeModule === 'support'} onClick={() => setActiveModule('support')} icon="fa-headset" label="Help & Glossary" />
          </div>
        </nav>

        {!isGold && (
          <div className="mt-8 bg-indigo-900 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition duration-500">
              <i className="fa-solid fa-crown text-6xl"></i>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-2">Upgrade Path</p>
            <p className="text-sm font-bold mb-4">Unlock Regional Arbitrage & API Access.</p>
            <button className="w-full py-3 bg-white text-indigo-900 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-indigo-50 transition shadow-lg">
              View Gold Plans
            </button>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow space-y-8">
        {activeModule === 'overview' && <OverviewDashboard submissions={submissions} />}
        {activeModule === 'intelligence' && <PriceIntelligenceModule submissions={submissions} tier={userTier} />}
        {activeModule === 'supply_chain' && <SupplyChainModule submissions={submissions} />}
        {activeModule === 'dynamics' && <MarketDynamicsModule submissions={submissions} tier={userTier} />}
        {activeModule === 'quality' && <DataQualityModule submissions={submissions} tier={userTier} />}
        {activeModule === 'reporting' && (isSilver ? <ReportingModule /> : <LockedView tier="Silver" section="Custom Report Builder" />)}
        {activeModule === 'alerts' && <AlertCenterModule />}
        {activeModule === 'support' && <SupportGlossary />}
      </main>
    </div>
  );
};

// --- Helper Components ---

const NavButton: React.FC<{ active: boolean, onClick: () => void, icon: string, label: string, lock?: boolean }> = ({ active, onClick, icon, label, lock }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between py-4 px-6 rounded-2xl text-xs font-black transition-all group ${
      active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-500 hover:bg-white hover:shadow-sm'
    }`}
  >
    <div className="flex items-center gap-3">
      <i className={`fa-solid ${icon} w-5 text-center`}></i>
      <span>{label}</span>
    </div>
    {lock && <i className="fa-solid fa-lock text-[10px] opacity-40"></i>}
  </button>
);

const LockedView: React.FC<{ tier: string, section: string }> = ({ tier, section }) => (
  <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-6 bg-white rounded-[3rem] border-4 border-dashed border-slate-100 p-12">
    <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center text-4xl text-slate-300">
      <i className="fa-solid fa-lock"></i>
    </div>
    <div>
      <h3 className="text-2xl font-black text-slate-900 tracking-tight">{section} Locked</h3>
      <p className="text-slate-500 font-medium max-w-sm mx-auto mt-2">Upgrade to <strong>{tier} Tier</strong> to access deep regional analytics and forecasting.</p>
    </div>
    <button className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition">
      Upgrade to {tier} Access
    </button>
  </div>
);

const SectionHeader: React.FC<{ title: string, subtitle: string, badge?: string }> = ({ title, subtitle, badge }) => (
  <header className="mb-8">
    <div className="flex items-center gap-3 mb-1">
      {badge && <span className="bg-indigo-50 text-indigo-600 text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-tighter">{badge}</span>}
      <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{title}</h2>
    </div>
    <p className="text-slate-500 font-medium">{subtitle}</p>
  </header>
);

// --- Module: Executive Overview ---

const OverviewDashboard: React.FC<{ submissions: Submission[] }> = ({ submissions }) => {
  const approvedCount = submissions.filter(s => s.status === SubmissionStatus.APPROVED).length;

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <SectionHeader title="Executive Overview" subtitle="Immediate situational awareness across East African markets." />
      
      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <KPICard label="Regional Price Points" value={approvedCount.toLocaleString()} change="+12%" positive icon="fa-database" />
        <KPICard label="Market Coverage Index" value="92%" change="+5%" positive icon="fa-earth-africa" />
        <KPICard label="Avg Market Volatility" value="7.2%" change="-2%" positive icon="fa-wave-square" />
        <KPICard label="Active Price Alerts" value="8" sub="4 triggered" icon="fa-bell" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Movements Table */}
        <div className="xl:col-span-2 bg-white rounded-[3rem] border border-slate-200 p-8 shadow-sm">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-8">Top Market Movements</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product / Region</th>
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Median</th>
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Change</th>
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {MOCK_PRICE_MOVEMENTS.slice(0, 4).map(pm => (
                  <tr key={pm.id} className="group hover:bg-slate-50 transition">
                    <td className="py-5">
                      <p className="font-black text-slate-900 text-sm">{pm.product}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{pm.market}</p>
                    </td>
                    <td className="py-5">
                      <p className="font-black text-slate-900 text-sm">{formatCurrency(pm.currentPrice, pm.currency)}</p>
                    </td>
                    <td className="py-5 text-center">
                      <span className={`px-2 py-1 rounded text-[10px] font-black ${
                        pm.trend === 'up' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {pm.trend === 'up' ? '+' : ''}{pm.change}%
                      </span>
                    </td>
                    <td className="py-5 text-right">
                      <span className="text-[10px] font-medium text-slate-500 italic">{pm.reason}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Volatility Heatmap Grid */}
        <div className="bg-white rounded-[3rem] border border-slate-200 p-8 shadow-sm flex flex-col">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-8">Volatility Heatmap</h3>
          <div className="grid grid-cols-6 gap-2 flex-grow">
            <div className="col-span-1"></div>
            {['RW', 'UG', 'KE', 'TZ', 'BI'].map(c => <div key={c} className="text-center text-[9px] font-black text-slate-400">{c}</div>)}
            
            {['Cement', 'Steel', 'Roofing', 'Agri'].map(cat => (
              <React.Fragment key={cat}>
                <div className="text-[9px] font-black text-slate-400 flex items-center">{cat}</div>
                {[1,2,3,4,5].map(i => {
                  const val = Math.random();
                  const color = val > 0.8 ? 'bg-rose-500' : val > 0.5 ? 'bg-amber-400' : 'bg-emerald-500';
                  return <div key={i} className={`h-8 rounded-lg ${color} opacity-80 hover:opacity-100 transition cursor-help relative group`}>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-24 bg-slate-900 text-white text-[8px] p-2 rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none z-50">
                      7-Day Std Dev: {(val * 15).toFixed(1)}%
                    </div>
                  </div>
                })}
              </React.Fragment>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between text-[8px] font-black uppercase text-slate-400 tracking-widest pt-6 border-t border-slate-50">
            <span>Stable</span>
            <div className="flex gap-1">
              <div className="h-2 w-4 bg-emerald-500 rounded-full"></div>
              <div className="h-2 w-4 bg-amber-400 rounded-full"></div>
              <div className="h-2 w-4 bg-rose-500 rounded-full"></div>
            </div>
            <span>Volatile</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const KPICard: React.FC<{ label: string, value: string, change?: string, positive?: boolean, icon: string, sub?: string }> = ({ label, value, change, positive, icon, sub }) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm group hover:border-indigo-100 transition">
    <div className="flex items-center justify-between mb-4">
      <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xl text-indigo-600 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition">
        <i className={`fa-solid ${icon}`}></i>
      </div>
      {change && (
        <span className={`text-[10px] font-black uppercase tracking-tighter ${positive ? 'text-emerald-600' : 'text-rose-600'}`}>
          {change} <i className={`fa-solid ${positive ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'} ml-1`}></i>
        </span>
      )}
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{label}</p>
    <p className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{value}</p>
    {sub && <p className="text-[10px] font-bold text-slate-400 mt-2">{sub}</p>}
  </div>
);

// --- Module: Price Intelligence ---

const PriceIntelligenceModule: React.FC<{ submissions: Submission[], tier: SubscriptionTier }> = ({ submissions, tier }) => {
  const [selectedProduct, setSelectedProduct] = useState('Cement');
  
  const matrixData = useMemo(() => {
    return ['Kigali', 'Kampala', 'Nairobi', 'Dar es Salaam', 'Bujumbura'].map(city => {
      const citySubs = submissions.filter(s => s.city === city && s.subCategory === selectedProduct && s.status === SubmissionStatus.APPROVED);
      const median = calculateMedian(citySubs.map(s => s.priceLocal));
      const currency = citySubs[0]?.currency || COUNTRY_CURRENCY[city === 'Kigali' ? 'Rwanda' : city === 'Kampala' ? 'Uganda' : city === 'Nairobi' ? 'Kenya' : city === 'Tanzania' ? 'Tanzania' : 'Burundi'];
      return { city, median, currency, count: citySubs.length };
    });
  }, [submissions, selectedProduct]);

  return (
    <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
      <SectionHeader title="Price Intelligence" subtitle="Deep-dive comparison and historical trajectory analysis." />

      {/* Comparison Matrix */}
      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <h3 className="text-xl font-black text-slate-900">Regional Matrix</h3>
            <select 
              value={selectedProduct} 
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black outline-none focus:ring-4 focus:ring-indigo-50"
            >
              <option>Cement</option>
              <option>Steel</option>
              <option>Fertilizers</option>
              <option>Seeds</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button className="px-5 py-2.5 bg-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition">Export CSV</button>
            <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 transition">Download PDF</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Market Cluster</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Median Price</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">USD Equivalent</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Positioning</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {matrixData.map((r, idx) => (
                <tr key={r.city} className="hover:bg-slate-50 transition">
                  <td className="px-10 py-6 font-black text-slate-900">{r.city}</td>
                  <td className="px-10 py-6 font-bold text-slate-700">{r.median === 0 ? '---' : formatCurrency(r.median, r.currency)}</td>
                  <td className="px-10 py-6 font-black text-indigo-600">{r.median === 0 ? '---' : formatCurrency(r.median / (idx === 1 ? 3800 : 1300), 'USD')}</td>
                  <td className="px-10 py-6">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${idx === 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {idx === 1 ? 'MARKET LOW' : idx === 3 ? 'MARKET HIGH' : 'WITHIN MEDIAN'}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <span className="text-xs font-bold text-slate-400">{r.count} subs</span>
                      <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{ width: `${Math.min(100, r.count * 10)}%` }}></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historical Trends (Silver+) */}
      {tier !== SubscriptionTier.BRONZE ? (
        <div className="bg-white rounded-[3rem] border border-slate-200 p-10 shadow-sm">
          <div className="flex justify-between items-start mb-12">
            <div>
              <h3 className="text-xl font-black text-slate-900">Historical Benchmarking</h3>
              <p className="text-sm font-bold text-slate-500">Trailing 12-month median trajectory for {selectedProduct}.</p>
            </div>
            <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1">
              <button className="px-4 py-2 bg-white text-indigo-600 rounded-xl text-[10px] font-black shadow-sm uppercase">Weekly</button>
              <button className="px-4 py-2 text-slate-400 rounded-xl text-[10px] font-black uppercase">Monthly</button>
            </div>
          </div>
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { name: 'Feb 25', p1: 17200, p2: 15500 },
                { name: 'Mar 25', p1: 18100, p2: 16200 },
                { name: 'Apr 25', p1: 17800, p2: 15900 },
                { name: 'May 25', p1: 18500, p2: 16500 },
                { name: 'Jun 25', p1: 18200, p2: 16100 },
                { name: 'Jul 25', p1: 18000, p2: 15800 },
                { name: 'Aug 25', p1: 18800, p2: 16400 },
                { name: 'Sep 25', p1: 19500, p2: 17000 },
                { name: 'Oct 25', p1: 19100, p2: 16800 },
                { name: 'Nov 25', p1: 18900, p2: 16500 },
                { name: 'Dec 25', p1: 18700, p2: 16300 },
                { name: 'Jan 26', p1: 18800, p2: 16400 },
              ]}>
                <defs>
                  <linearGradient id="colorP1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/><stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/></linearGradient>
                  <linearGradient id="colorP2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={9} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 800}} />
                <YAxis fontSize={9} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 800}} />
                <Tooltip contentStyle={{borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontWeight: 900}} />
                <Legend iconType="circle" />
                <Area type="monotone" name="Kigali Median" dataKey="p1" stroke="#4f46e5" fillOpacity={1} fill="url(#colorP1)" strokeWidth={4} />
                <Area type="monotone" name="Kampala Median" dataKey="p2" stroke="#10b981" fillOpacity={1} fill="url(#colorP2)" strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <LockedView tier="Silver" section="Historical Benchmarking & Multi-Product Charts" />
      )}
    </div>
  );
};

// --- Module: Supply Chain Intelligence ---

const SupplyChainModule: React.FC<{ submissions: Submission[] }> = ({ submissions }) => {
  return (
    <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
      <SectionHeader title="Supply Chain Monitor" subtitle="Tracking inventory health and depletion velocity across regional hubs." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inventory Status Grid */}
        <div className="bg-white rounded-[3rem] border border-slate-200 p-10 shadow-sm">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-10">Real-Time Inventory Health</h3>
          <div className="grid grid-cols-5 gap-4">
            <div className="col-span-1"></div>
            {['KGL', 'KMP', 'NBI', 'DAR'].map(c => <div key={c} className="text-center text-[10px] font-black text-slate-400">{c}</div>)}
            
            {['Cement', 'Steel', 'Seeds', 'Paints'].map(cat => (
              <React.Fragment key={cat}>
                <div className="text-[10px] font-black text-slate-700 flex items-center">{cat}</div>
                {[1,2,3,4].map(i => {
                  const status = i === 2 ? 'Low' : i === 4 ? 'Out' : 'In';
                  return (
                    <div key={i} className={`h-12 rounded-2xl flex items-center justify-center border-2 transition ${
                      status === 'In' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 
                      status === 'Low' ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-rose-50 border-rose-100 text-rose-600'
                    }`}>
                      <i className={`fa-solid ${status === 'In' ? 'fa-check' : status === 'Low' ? 'fa-hourglass-half' : 'fa-xmark'} text-xs`}></i>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
          <div className="mt-10 flex gap-6 pt-8 border-t border-slate-50">
            <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-emerald-500"></div><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">In Stock</span></div>
            <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-amber-500"></div><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Low Stock</span></div>
            <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-rose-500"></div><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Out of Stock</span></div>
          </div>
        </div>

        {/* Depletion Predictor */}
        <div className="bg-indigo-900 rounded-[3rem] p-10 text-white shadow-xl space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5"><i className="fa-solid fa-clock-rotate-left text-9xl"></i></div>
          <h3 className="text-xs font-black uppercase tracking-widest text-indigo-300">Depletion Predictor</h3>
          <div className="space-y-6">
            <PredictionRow label="Cement (Kampala)" days={4} confidence={82} color="text-rose-400" />
            <PredictionRow label="Seeds (Rwanda)" days={12} confidence={74} color="text-amber-400" />
            <PredictionRow label="Steel 12mm (Kigali)" days={18} confidence={91} color="text-emerald-400" />
          </div>
          <div className="pt-6 border-t border-white/10 mt-10">
            <p className="text-[10px] font-bold text-indigo-200 leading-relaxed">
              <i className="fa-solid fa-circle-info mr-2"></i>
              Predictions based on current reported "Low Stock" velocity and average regional restock cycles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const PredictionRow: React.FC<{ label: string, days: number, confidence: number, color: string }> = ({ label, days, confidence, color }) => (
  <div className="flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/10">
    <div>
      <p className="text-sm font-black mb-1">{label}</p>
      <div className="flex items-center gap-2 text-[9px] font-bold text-indigo-300 uppercase tracking-widest">
        <span>Conf: {confidence}%</span>
        <div className="h-1 w-12 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-400" style={{ width: `${confidence}%` }}></div>
        </div>
      </div>
    </div>
    <div className="text-right">
      <p className={`text-2xl font-black ${color} tracking-tighter`}>{days} Days</p>
      <p className="text-[8px] font-black uppercase text-indigo-400 tracking-widest">Est. Stockout</p>
    </div>
  </div>
);

// --- Module: Market Dynamics ---

const MarketDynamicsModule: React.FC<{ submissions: Submission[], tier: SubscriptionTier }> = ({ submissions, tier }) => {
  return (
    <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
      <SectionHeader title="Market Dynamics" subtitle="FX impact analysis and sector-specific deep dives." />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* FX Correlation */}
        <div className="bg-white rounded-[3rem] border border-slate-200 p-10 shadow-sm">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">FX Correlation Dashboard</h3>
              <p className="text-sm font-bold text-slate-500">Divergence of Local Price vs USD Value.</p>
            </div>
            <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase px-3 py-1 rounded-full">Rwanda - RWF</span>
          </div>
          <div className="h-64 w-full mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { n: 'Jan', l: 17000, u: 13.0 },
                { n: 'Feb', l: 17200, u: 13.1 },
                { n: 'Mar', l: 18500, u: 13.8 },
                { n: 'Apr', l: 18200, u: 13.4 },
                { n: 'May', l: 18900, u: 14.1 },
                { n: 'Jun', l: 18800, u: 13.9 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="n" fontSize={9} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" fontSize={9} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" fontSize={9} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line yAxisId="left" type="monotone" dataKey="l" stroke="#4f46e5" strokeWidth={4} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="u" stroke="#10b981" strokeWidth={4} dot={false} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <p className="text-xs font-bold text-slate-600 leading-relaxed">
              <i className="fa-solid fa-lightbulb text-indigo-600 mr-2"></i>
              Analysis: 82% of current price inflation in Rwanda is correlated with RWF/USD depreciation, rather than regional supply shortages.
            </p>
          </div>
        </div>

        {/* Cross-Border Arbitrage (Gold only) */}
        {tier === SubscriptionTier.GOLD ? (
          <div className="bg-white rounded-[3rem] border border-slate-200 p-10 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center text-sm"><i className="fa-solid fa-sack-dollar"></i></div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Arbitrage Scanner</h3>
            </div>
            <div className="space-y-4">
              {MOCK_ARBITRAGE.map(op => (
                <div key={op.id} className="p-5 bg-slate-50 border border-slate-100 rounded-[2rem] hover:border-indigo-100 transition">
                  <div className="flex justify-between items-start mb-4">
                    <p className="font-black text-slate-900">{op.product}</p>
                    <span className="text-[10px] font-black text-emerald-600 uppercase">+{op.spread}% Spread</span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <span>{op.buyMarket}</span>
                    <i className="fa-solid fa-arrow-right text-indigo-400"></i>
                    <span>{op.sellMarket}</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-slate-200">
              Calculate Net Profitability
            </button>
          </div>
        ) : (
          <LockedView tier="Gold" section="Regional Arbitrage & Trade Analytics" />
        )}
      </div>
    </div>
  );
};

// --- Module: Data Quality ---

const DataQualityModule: React.FC<{ submissions: Submission[], tier: SubscriptionTier }> = ({ submissions, tier }) => {
  return (
    <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
      <SectionHeader title="Data Quality & Integrity" subtitle="Audit metrics for crowdsourced price intelligence reliability." />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <QualityCard label="Verification Freshness" value="84%" sub="Active < 24h" icon="fa-bolt-lightning" />
        <QualityCard label="Trust-Weighted Accuracy" value="96.2%" sub="Verified via Field Agents" icon="fa-shield-heart" />
        <QualityCard label="Spatial Coverage Gap" value="12%" sub="Low data zones" icon="fa-map-pin" />
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-200 p-10 shadow-sm">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-10">Regional Submission Coverage Map</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {['Kigali', 'Kampala', 'Nairobi', 'Dar', 'Bujumbura'].map(city => (
            <div key={city} className="flex flex-col items-center text-center space-y-4">
              <div className={`h-24 w-24 rounded-full flex items-center justify-center text-2xl border-8 border-white shadow-xl ${
                city === 'Kigali' ? 'bg-emerald-100 text-emerald-600' : city === 'Bujumbura' ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'
              }`}>
                <i className="fa-solid fa-map-location-dot"></i>
              </div>
              <div>
                <p className="font-black text-slate-900 text-sm">{city}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{Math.floor(Math.random() * 50) + 10} Weekly Subs</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const QualityCard: React.FC<{ label: string, value: string, sub: string, icon: string }> = ({ label, value, sub, icon }) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm text-center space-y-2">
    <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-4"><i className={`fa-solid ${icon}`}></i></div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    <p className="text-3xl font-black text-slate-900">{value}</p>
    <p className="text-[10px] font-bold text-slate-500 uppercase">{sub}</p>
  </div>
);

// --- Module: Reporting Center ---

const ReportingModule: React.FC = () => (
  <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
    <SectionHeader title="Report Builder" subtitle="Drag and drop modules to build custom market intelligence briefs." />
    
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-slate-100 border-4 border-dashed border-slate-200 rounded-[3rem] p-12 text-center h-[500px] flex flex-col items-center justify-center space-y-4">
          <i className="fa-solid fa-plus-circle text-4xl text-slate-300"></i>
          <p className="text-slate-400 font-bold max-w-xs">Drag metric blocks here to begin your custom report construction.</p>
        </div>
      </div>
      <div className="space-y-6">
        <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Available Modules</h4>
        {['Price Median Matrix', 'Volatility Heatmap', 'Historical Line Chart', 'Stock availability Grid', 'FX Correlation Map'].map(m => (
          <div key={m} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-between cursor-move hover:border-indigo-600 transition group">
            <span className="text-xs font-black text-slate-700">{m}</span>
            <i className="fa-solid fa-grip-vertical text-slate-300 group-hover:text-indigo-600"></i>
          </div>
        ))}
        <button className="w-full mt-6 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-100">
          Save & Schedule Delivery
        </button>
      </div>
    </div>
  </div>
);

// --- Module: Alert Center ---

const AlertCenterModule: React.FC = () => (
  <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
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

// --- Module: Support & Glossary ---

const SupportGlossary: React.FC = () => (
  <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
    <SectionHeader title="Insights Glossary" subtitle="Definitions for technical metrics and data logic used across SokoMetrics." />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <GlossaryItem term="Median Price" definition="The middle value of collected price points. We use median instead of average to eliminate extreme outliers which often skew regional market data." />
      <GlossaryItem term="Trust-Weighted Data" definition="Contributor reliability scores affect the weight of their submission in regional median calculations. Field agents typically have 3x higher weight than consumers." />
      <GlossaryItem term="Volatility Index" definition="Rolling 7-day standard deviation of price movements. Higher % indicates supply chain instability or high currency volatility." />
      <GlossaryItem term="Market Efficiency Index" definition="The spread between the highest and lowest verified prices in a city. Narrower spreads indicate more competitive and transparent markets." />
    </div>
    
    <div className="bg-slate-900 text-white rounded-[3rem] p-10 shadow-xl space-y-8">
      <h3 className="text-xl font-black">Need Dedicated Analysis?</h3>
      <p className="text-slate-400 font-medium leading-relaxed">Our regional analysts can provide custom procurement reports or deep-sector intelligence on a project basis. Contact our East African trade desk for a consultation.</p>
      <div className="flex gap-4">
        <button className="bg-indigo-600 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg">Request Project Quote</button>
        <button className="bg-white/10 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-white/10 hover:bg-white/20 transition">Contact Support</button>
      </div>
    </div>
  </div>
);

const GlossaryItem: React.FC<{ term: string, definition: string }> = ({ term, definition }) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-3">
    <h4 className="text-sm font-black text-indigo-600 uppercase tracking-widest">{term}</h4>
    <p className="text-sm font-medium text-slate-600 leading-relaxed">{definition}</p>
  </div>
);

export default B2BPortal;
