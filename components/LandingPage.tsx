
import React, { useState, useMemo } from 'react';
import { UserRole, Submission, Category, SubmissionStatus } from '../types';
import { PRODUCT_HIERARCHY, REGIONS } from '../constants';
import { formatCurrency, calculateDistance, calculateMedian } from '../utils';

interface LandingPageProps {
  onLogin: (role: UserRole) => void;
  submissions: Submission[];
  onViewProduct: (brand: string, subCategory: string, spec1: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, submissions, onViewProduct }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Filter States
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterProductType, setFilterProductType] = useState<string>('All');
  const [filterCountry, setFilterCountry] = useState<string>('All');
  const [filterCity, setFilterCity] = useState<string>('All');
  const [filterDateRange, setFilterDateRange] = useState<string>('Last 30 days');
  const [filterSupplierType, setFilterSupplierType] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('Date: Newest');

  const approvedSubmissions = useMemo(() => 
    submissions.filter(s => s.status === SubmissionStatus.APPROVED),
    [submissions]
  );

  const myLocation = { lat: -1.9441, lng: 30.0619 };

  const suggestions = useMemo(() => {
    if (searchQuery.length < 2) return [];
    const query = searchQuery.toLowerCase();
    const uniqueSuggestions = new Set<string>();
    
    Object.keys(PRODUCT_HIERARCHY).forEach((catName) => {
      const catObj = PRODUCT_HIERARCHY[catName];
      Object.keys(catObj).forEach(type => {
        if (type.toLowerCase().includes(query)) uniqueSuggestions.add(type);
        catObj[type].brands?.forEach((brandObj: any) => {
          if (brandObj.name.toLowerCase().includes(query)) uniqueSuggestions.add(brandObj.name);
        });
      });
    });

    return Array.from(uniqueSuggestions).slice(0, 6);
  }, [searchQuery]);

  const filteredAndSortedResults = useMemo(() => {
    let results = [...approvedSubmissions];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      results = results.filter(s => 
        s.brand.toLowerCase().includes(q) || 
        s.subCategory.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.country.toLowerCase().includes(q)
      );
    }

    if (filterCategory !== 'All') results = results.filter(s => s.category === filterCategory);
    if (filterProductType !== 'All') results = results.filter(s => s.subCategory === filterProductType);
    if (filterCountry !== 'All') results = results.filter(s => s.country === filterCountry);
    if (filterCity !== 'All') results = results.filter(s => s.city === filterCity);
    if (filterSupplierType !== 'All') results = results.filter(s => s.supplierType.toLowerCase().includes(filterSupplierType.toLowerCase()));

    const now = new Date();
    results = results.filter(s => {
      const subDate = new Date(s.timestamp);
      const diffDays = (now.getTime() - subDate.getTime()) / (1000 * 3600 * 24);
      if (filterDateRange === 'Last 7 days') return diffDays <= 7;
      if (filterDateRange === 'Last 30 days') return diffDays <= 30;
      if (filterDateRange === 'Last 3 months') return diffDays <= 90;
      return true;
    });

    results.sort((a, b) => {
      if (sortBy === 'Price: Low to High') return a.priceUSD - b.priceUSD;
      if (sortBy === 'Price: High to Low') return b.priceUSD - a.priceUSD;
      if (sortBy === 'Date: Newest') return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      if (sortBy === 'Distance from me') {
        const distA = calculateDistance(myLocation.lat, myLocation.lng, a.latitude || 0, a.longitude || 0);
        const distB = calculateDistance(myLocation.lat, myLocation.lng, b.latitude || 0, b.longitude || 0);
        return distA - distB;
      }
      return 0;
    });

    return results;
  }, [approvedSubmissions, searchQuery, filterCategory, filterProductType, filterCountry, filterCity, filterDateRange, filterSupplierType, sortBy]);

  const activeMedian = useMemo(() => {
    const prices = filteredAndSortedResults.map(r => r.priceUSD);
    return calculateMedian(prices);
  }, [filteredAndSortedResults]);

  const recentUpdates = useMemo(() => 
    [...approvedSubmissions].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5),
    [approvedSubmissions]
  );

  return (
    <div className="flex flex-col space-y-12 py-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight tracking-tighter">
          Compare Construction & Agricultural <br/> 
          <span className="text-indigo-600">Input Prices Across East Africa</span>
        </h1>
        <p className="text-slate-500 text-lg font-medium px-4">
          Real-time, crowdsourced price intelligence. Find verified deals near you.
        </p>
      </div>

      {/* Search & Mode Toggle */}
      <div className="max-w-4xl w-full mx-auto px-4 relative z-40 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow group">
            <i className="fa-solid fa-magnifying-glass absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"></i>
            <input 
              type="text" 
              placeholder="Search for cement, steel, fertilizer..." 
              className="w-full bg-white border-2 border-slate-200 rounded-[2rem] pl-16 pr-6 py-5 text-lg font-bold shadow-xl shadow-slate-200/50 outline-none focus:border-indigo-600 transition-all placeholder:text-slate-400"
              value={searchQuery}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50">
                {suggestions.map((s, idx) => (
                  <button key={idx} className="w-full text-left p-4 hover:bg-slate-50 font-bold text-slate-700 flex items-center gap-3" onClick={() => { setSearchQuery(s); setShowSuggestions(false); }}>
                    <i className="fa-solid fa-arrow-trend-up text-slate-300 text-xs"></i> {s}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex gap-2 h-[68px]">
            <button onClick={() => setShowFilters(!showFilters)} className={`px-6 rounded-[2rem] border-2 font-black uppercase text-xs tracking-widest transition-all flex items-center gap-3 ${showFilters ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-600 shadow-xl shadow-slate-200/50'}`}>
              <i className="fa-solid fa-sliders"></i>
              <span>Filters</span>
            </button>
            <div className="bg-white border-2 border-slate-200 rounded-[2rem] p-1 flex shadow-xl shadow-slate-200/50">
              <button onClick={() => setViewMode('list')} className={`px-5 rounded-full flex items-center justify-center transition ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'}`}>
                <i className="fa-solid fa-list-ul"></i>
              </button>
              <button onClick={() => setViewMode('map')} className={`px-5 rounded-full flex items-center justify-center transition ${viewMode === 'map' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'}`}>
                <i className="fa-solid fa-map-location-dot"></i>
              </button>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="bg-white rounded-[2.5rem] border-2 border-indigo-50 p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <FilterSelect label="Category" value={filterCategory} onChange={setFilterCategory} options={['All', Category.CONSTRUCTION, Category.AGRICULTURE]} />
                <FilterSelect label="Product Type" value={filterProductType} onChange={setFilterProductType} options={['All', 'Cement', 'Steel', 'Roofing', 'Paints', 'Fertilizers', 'Seeds', 'Agrochemicals']} />
              </div>
              <div className="space-y-4">
                <FilterSelect label="Country" value={filterCountry} onChange={(v) => { setFilterCountry(v); setFilterCity('All'); }} options={['All', 'Rwanda', 'Uganda', 'Kenya', 'Tanzania', 'Burundi']} />
                <FilterSelect label="City" value={filterCity} onChange={setFilterCity} options={filterCountry === 'All' ? ['All'] : ['All', ...(REGIONS as any)[filterCountry]]} />
              </div>
              <div className="space-y-4">
                <FilterSelect label="Date Range" value={filterDateRange} onChange={setFilterDateRange} options={['All Time', 'Last 7 days', 'Last 30 days', 'Last 3 months']} />
                <FilterSelect label="Supplier Type" value={filterSupplierType} onChange={setFilterSupplierType} options={['All', 'Manufacturer', 'Wholesaler', 'Retail']} />
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sort By</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black outline-none">
                  {['Date: Newest', 'Price: Low to High', 'Price: High to Low', 'Distance from me'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <button onClick={() => { setFilterCategory('All'); setFilterProductType('All'); setFilterCountry('All'); setFilterCity('All'); setFilterDateRange('Last 30 days'); setFilterSupplierType('All'); setSortBy('Date: Newest'); setSearchQuery(''); }} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Reset All Filters</button>
            </div>
          </div>
        )}
      </div>

      {/* Results Display Area */}
      <div className="max-w-6xl mx-auto w-full px-4 space-y-12 pb-20">
        {(searchQuery || filterCategory !== 'All' || filterProductType !== 'All' || showFilters) ? (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Search Results ({filteredAndSortedResults.length})</h2>
              {viewMode === 'map' && (
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500"></span> Below Median</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500"></span> Near Median</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500"></span> Above Median</span>
                </div>
              )}
            </div>

            {viewMode === 'list' ? (
              <div className="space-y-6">
                {filteredAndSortedResults.map(s => (
                  <ResultRow 
                    key={s.id} 
                    sub={s} 
                    myLocation={myLocation} 
                    onClick={() => onViewProduct(s.brand, s.subCategory, s.spec1)} 
                  />
                ))}
                {filteredAndSortedResults.length === 0 && (
                  <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold">No results found matching your criteria.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative h-[600px] w-full bg-slate-100 rounded-[3rem] border-4 border-white shadow-2xl overflow-hidden">
                <MockMap 
                  submissions={filteredAndSortedResults} 
                  median={activeMedian} 
                  myLocation={myLocation} 
                  onViewProduct={onViewProduct}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Recent Verified Updates</h3>
              <div className="space-y-4">
                {recentUpdates.map(s => <UpdateItem key={s.id} sub={s} onClick={() => onViewProduct(s.brand, s.subCategory, s.spec1)} />)}
              </div>
            </div>
            <div className="space-y-8">
              <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
                <h3 className="text-xl font-black mb-8 relative z-10">Top Contributors</h3>
                <div className="space-y-6 relative z-10">
                  <LeaderboardItem rank={1} name="Amani G." points={4250} badge="fa-crown" badgeColor="text-amber-400" />
                  <LeaderboardItem rank={2} name="Sarah M." points={3800} badge="fa-medal" badgeColor="text-slate-300" />
                  <LeaderboardItem rank={3} name="Jean-Paul" points={3120} badge="fa-award" badgeColor="text-amber-600" />
                </div>
              </div>
              <div className="bg-indigo-50 border border-indigo-100 rounded-[2.5rem] p-8">
                <h3 className="text-xl font-black text-indigo-900 mb-6">How It Works</h3>
                <div className="space-y-4">
                  <StepItem num={1} text="Find a product price at your local market." />
                  <StepItem num={2} text="Submit price with location and optional photo." />
                  <StepItem num={3} text="Earn trust points as your data is verified." />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Sub-components ---

const ResultRow: React.FC<{ sub: Submission, myLocation: { lat: number, lng: number }, onClick: () => void }> = ({ sub, myLocation, onClick }) => {
  const dist = calculateDistance(myLocation.lat, myLocation.lng, sub.latitude || 0, sub.longitude || 0);
  const hoursAgo = Math.floor((new Date().getTime() - new Date(sub.timestamp).getTime()) / (1000 * 3600));

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group flex flex-col md:flex-row gap-8 items-start md:items-center">
      <div className="flex-grow space-y-3 cursor-pointer" onClick={onClick}>
        <div className="flex items-center gap-3">
          <h4 className="text-2xl font-black text-slate-900 leading-none">{sub.brand} {sub.subCategory} - {sub.spec1}</h4>
        </div>
        <p className="text-slate-500 font-bold">
          <span className="text-slate-900">{sub.supplierName}</span> | {sub.city}, {sub.country}
        </p>
        <div className="flex flex-wrap gap-4 mt-4">
          <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <i className="fa-solid fa-location-dot text-indigo-600"></i> {dist.toFixed(1)} km from you
          </span>
          <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <i className="fa-solid fa-clock text-indigo-600"></i> Updated {hoursAgo === 0 ? 'Recently' : `${hoursAgo}h ago`}
          </span>
          <span className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${sub.hasPhoto ? 'text-emerald-600' : 'text-amber-500'}`}>
            <i className={`fa-solid ${sub.hasPhoto ? 'fa-camera' : 'fa-star'}`}></i> {sub.hasPhoto ? 'Photo verified' : 'Verified submission'}
          </span>
        </div>
      </div>
      
      <div className="w-full md:w-auto text-left md:text-right border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8 space-y-4">
        <div>
          <p className="text-3xl font-black text-indigo-600 leading-none">{formatCurrency(sub.priceLocal, sub.currency)}</p>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">per {sub.unit}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onClick} className="flex-1 md:flex-none px-6 py-3 bg-slate-100 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition">Details</button>
          <button className="flex-1 md:flex-none px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition">Directions</button>
        </div>
      </div>
    </div>
  );
};

const MockMap: React.FC<{ submissions: Submission[], median: number, myLocation: { lat: number, lng: number }, onViewProduct: (b: string, s: string, d: string) => void }> = ({ submissions, median, myLocation, onViewProduct }) => {
  const bounds = useMemo(() => {
    if (submissions.length === 0) return { minLat: 0, maxLat: 1, minLng: 0, maxLng: 1 };
    const lats = submissions.map(s => s.latitude || 0).concat(myLocation.lat);
    const lngs = submissions.map(s => s.longitude || 0).concat(myLocation.lng);
    return {
      minLat: Math.min(...lats) - 0.05,
      maxLat: Math.max(...lats) + 0.05,
      minLng: Math.min(...lngs) - 0.05,
      maxLng: Math.max(...lngs) + 0.05,
    };
  }, [submissions, myLocation]);

  const getPos = (lat: number, lng: number) => {
    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
    const y = 100 - ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * 100;
    return { x: `${x}%`, y: `${y}%` };
  };

  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div className="relative w-full h-full bg-slate-50/50">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
      <div className="absolute z-10 -translate-x-1/2 -translate-y-1/2" style={{ left: getPos(myLocation.lat, myLocation.lng).x, top: getPos(myLocation.lat, myLocation.lng).y }}>
        <div className="h-4 w-4 bg-indigo-600 rounded-full ring-8 ring-indigo-500/20 shadow-xl animate-pulse"></div>
        <span className="absolute top-6 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[8px] font-black uppercase px-2 py-1 rounded whitespace-nowrap">Me</span>
      </div>

      {submissions.map(s => {
        const price = s.priceUSD;
        let colorClass = 'bg-amber-500';
        if (price < median * 0.95) colorClass = 'bg-emerald-500';
        else if (price > median * 1.05) colorClass = 'bg-rose-500';

        const pos = getPos(s.latitude || 0, s.longitude || 0);

        return (
          <div key={s.id} className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110 z-20" style={{ left: pos.x, top: pos.y }} onClick={() => setActiveId(activeId === s.id ? null : s.id)}>
            <div className={`h-6 w-6 rounded-full border-2 border-white shadow-lg ${colorClass} flex items-center justify-center text-white text-[10px] font-black`}>{s.subCategory[0]}</div>
            {activeId === s.id && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 z-[100] animate-in slide-in-from-bottom-2">
                <p className="font-black text-slate-900 text-xs truncate">{s.brand} {s.subCategory}</p>
                <p className="text-[10px] font-bold text-slate-400 truncate mb-2">{s.supplierName}</p>
                <p className="text-lg font-black text-indigo-600 mb-2">{formatCurrency(s.priceLocal, s.currency)}</p>
                <div className="flex flex-col gap-1">
                  <button onClick={() => onViewProduct(s.brand, s.subCategory, s.spec1)} className="w-full py-2 bg-indigo-600 text-white rounded-lg text-[8px] font-black uppercase tracking-widest mb-1">View Details</button>
                  <button className="w-full py-2 bg-slate-100 text-slate-900 rounded-lg text-[8px] font-black uppercase tracking-widest">Directions</button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const FilterSelect: React.FC<{ label: string, value: string, onChange: (v: string) => void, options: string[] }> = ({ label, value, onChange, options }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-xs font-black outline-none focus:ring-4 focus:ring-indigo-50 transition">
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const UpdateItem: React.FC<{ sub: Submission, onClick: () => void }> = ({ sub, onClick }) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-md transition cursor-pointer" onClick={onClick}>
    <div className="flex items-center space-x-4">
      <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 shadow-sm transition">
        <i className="fa-solid fa-tag"></i>
      </div>
      <div>
        <p className="font-black text-slate-900 text-xs">{sub.brand} {sub.subCategory}</p>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{sub.city} • {sub.country}</p>
      </div>
    </div>
    <p className="font-black text-slate-900 text-xs">{formatCurrency(sub.priceLocal, sub.currency)}</p>
  </div>
);

const LeaderboardItem: React.FC<{ rank: number, name: string, points: number, badge: string, badgeColor: string }> = ({ rank, name, points, badge, badgeColor }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center space-x-4">
      <span className="text-xs font-black text-slate-500 w-4">{rank}</span>
      <div className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
        <i className={`fa-solid ${badge} ${badgeColor}`}></i>
      </div>
      <span className="font-black text-sm tracking-tight">{name}</span>
    </div>
    <span className="text-xs font-black text-indigo-400">{points.toLocaleString()} pts</span>
  </div>
);

const StepItem: React.FC<{ num: number, text: string }> = ({ num, text }) => (
  <div className="flex items-start space-x-4">
    <span className="h-6 w-6 bg-indigo-600 text-white text-[10px] font-black rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-md shadow-indigo-200">{num}</span>
    <p className="text-sm font-bold text-indigo-900 leading-tight">{text}</p>
  </div>
);

export default LandingPage;
