
import React, { useState, useMemo, useEffect } from 'react';
import { User, Submission, Category, StockStatus, SubmissionStatus, ContributorType, SupplierType } from '../types';
import { PRODUCT_HIERARCHY, COUNTRY_CURRENCY, REGIONS, MOCK_REWARDS, MOCK_WEEKLY_LEADERBOARD, CURRENCIES } from '../constants';
import { formatCurrency, getCurrentRank, getNextRank, calculateDistance, POINT_VALUES, FX_RATES, RANKS } from '../utils';

interface Props {
  user: User;
  submissions: Submission[];
  onSubmit: (sub: Submission) => void;
  onUpdateUser?: (updatedUser: User) => void;
}

const ContributorPortal: React.FC<Props> = ({ user, submissions, onSubmit, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState<'submit' | 'history' | 'discovery' | 'rewards' | 'leaderboard' | 'profile'>('submit');
  const userSubs = submissions.filter(s => s.contributorId === user.id);
  const approvedCount = userSubs.filter(s => s.status === SubmissionStatus.APPROVED).length;
  
  const rank = getCurrentRank(user.points);
  const nextRank = getNextRank(user.points);
  const progress = nextRank 
    ? ((user.points - rank.min) / (nextRank.min - rank.min)) * 100 
    : 100;

  const isProfileIncomplete = user.type === ContributorType.OTHER || !user.phone;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Profile Header - Summarized view */}
      <div className="bg-white rounded-[3rem] border border-slate-200 p-10 shadow-sm relative overflow-hidden">
        {isProfileIncomplete && activeTab !== 'profile' && (
          <div className="absolute top-0 left-0 right-0 bg-amber-500 text-white px-6 py-2 flex items-center justify-between z-10 animate-in slide-in-from-top duration-500">
            <p className="text-[10px] font-black uppercase tracking-widest">
              <i className="fa-solid fa-circle-exclamation mr-2"></i> Your profile is incomplete. Help us verify you faster.
            </p>
            <button 
              onClick={() => setActiveTab('profile')}
              className="bg-white text-amber-600 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter shadow-sm hover:bg-slate-50 transition"
            >
              Complete Now
            </button>
          </div>
        )}

        <div className={`flex flex-col lg:flex-row gap-12 items-start ${isProfileIncomplete ? 'pt-8' : ''}`}>
          <div className="flex flex-col items-center flex-shrink-0">
            <div className={`h-36 w-36 rounded-full ${rank.bg} ${rank.color} flex items-center justify-center border-8 border-white shadow-2xl relative mb-6 group transition-transform hover:scale-105`}>
              <i className={`fa-solid ${rank.icon} text-6xl`}></i>
              <div className="absolute -bottom-2 bg-slate-900 text-white text-[9px] font-black uppercase px-4 py-1.5 rounded-full shadow-lg">
                Rank #{user.rank === 'Gold' ? 4 : user.rank === 'Silver' ? 12 : 45}
              </div>
            </div>
            <h3 className="text-xl font-black text-slate-900 leading-none">{rank.label}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{user.type}</p>
          </div>

          <div className="flex-grow space-y-8 w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-1">
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Welcome back, {user.name.split(' ')[0]}!</h2>
                <p className="text-slate-500 font-medium text-sm">You have {nextRank ? `${nextRank.min - user.points} points to go` : 'reached the top rank!'} for your next status.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setActiveTab('rewards')} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition">Redeem Rewards</button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <StatCard label="Points Total" value={user.points.toLocaleString()} icon="fa-trophy" color="text-amber-500" />
              <StatCard label="Submissions" value={`${user.submissionsCount} (${approvedCount} verified)`} icon="fa-clipboard-check" color="text-indigo-600" />
              <StatCard label="Trust Index" value={`${user.trustScore}/100`} icon="fa-shield-heart" color="text-emerald-500" />
              <StatCard label="Earned Value" value={formatCurrency(user.totalPointsEarned / 10, 'USD')} icon="fa-wallet" color="text-slate-900" />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rank Progress</p>
                  <p className="text-sm font-black text-slate-900">{rank.label} → {nextRank?.label || 'Champion'}</p>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user.points} / {nextRank?.min || user.points} Pts</p>
              </div>
              <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-1 border border-slate-50 shadow-inner">
                <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000 shadow-md" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex bg-white/50 backdrop-blur p-2 rounded-[2rem] overflow-x-auto no-scrollbar shadow-sm border border-slate-200">
        <PortalTab active={activeTab === 'submit'} onClick={() => setActiveTab('submit')} icon="fa-plus-circle" label="Report" />
        <PortalTab active={activeTab === 'discovery'} onClick={() => setActiveTab('discovery')} icon="fa-location-dot" label="Nearby" />
        <PortalTab active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon="fa-list-ul" label="Activity" />
        <PortalTab active={activeTab === 'rewards'} onClick={() => setActiveTab('rewards')} icon="fa-gift" label="Rewards" />
        <PortalTab active={activeTab === 'leaderboard'} onClick={() => setActiveTab('leaderboard')} icon="fa-ranking-star" label="Rankings" />
        <PortalTab active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon="fa-user-pen" label="Profile" />
      </div>

      <div className="pb-12">
        {activeTab === 'submit' && <SubmissionForm onSubmit={onSubmit} user={user} />}
        {activeTab === 'discovery' && <NearbySearch submissions={submissions} />}
        {activeTab === 'history' && <HistoryList subs={userSubs} />}
        {activeTab === 'rewards' && <RewardsSection userPoints={user.points} />}
        {activeTab === 'leaderboard' && <LeaderboardSection currentUserId={user.id} />}
        {activeTab === 'profile' && <ProfileSettings user={user} onUpdate={onUpdateUser} />}
      </div>
    </div>
  );
};

// --- Sub-components ---

const NearbySearch: React.FC<{ submissions: Submission[] }> = ({ submissions }) => {
  const myLocation = { lat: -1.9441, lng: 30.0619 };
  
  const nearby = useMemo(() => {
    return [...submissions]
      .filter(s => s.status === SubmissionStatus.APPROVED)
      .sort((a, b) => {
        const distA = calculateDistance(myLocation.lat, myLocation.lng, a.latitude || 0, a.longitude || 0);
        const distB = calculateDistance(myLocation.lat, myLocation.lng, b.latitude || 0, b.longitude || 0);
        return distA - distB;
      })
      .slice(0, 5);
  }, [submissions]);

  return (
    <div className="bg-white rounded-[3rem] border border-slate-200 p-10 shadow-sm space-y-8 animate-in zoom-in-95 duration-300">
      <header>
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Market Discovery</h3>
        <p className="text-slate-500 font-medium">Verified prices within your current region.</p>
      </header>
      <div className="space-y-4">
        {nearby.map(s => (
          <div key={s.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                <i className="fa-solid fa-location-crosshairs"></i>
              </div>
              <div>
                <p className="font-black text-slate-900">{s.brand} {s.subCategory}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.city} • {calculateDistance(myLocation.lat, myLocation.lng, s.latitude || 0, s.longitude || 0).toFixed(1)}km away</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-indigo-600">{formatCurrency(s.priceLocal, s.currency)}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.unit}</p>
            </div>
          </div>
        ))}
        {nearby.length === 0 && (
           <p className="text-center py-10 text-slate-400 font-bold italic">No verified prices nearby yet.</p>
        )}
      </div>
    </div>
  );
};

const ProfileSettings: React.FC<{ user: User, onUpdate?: (u: User) => void }> = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    phone: user.phone || '',
    type: user.type,
    email: user.id === 'C045' ? 'john@sokometrics.africa' : ''
  });

  const handleSave = () => {
    if (onUpdate) {
      onUpdate({
        ...user,
        name: formData.name,
        phone: formData.phone,
        type: formData.type
      });
      alert('Profile updated successfully!');
    }
  };

  const currentRank = getCurrentRank(user.points);
  const nextRank = getNextRank(user.points);
  const progress = nextRank 
    ? ((user.points - currentRank.min) / (nextRank.min - currentRank.min)) * 100 
    : 100;

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in zoom-in-95 duration-300">
      
      {/* Visual Rank & Badge Cabinet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Rank Milestone Panel */}
        <div className="lg:col-span-1 bg-slate-900 text-white rounded-[3rem] p-10 shadow-2xl relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition duration-500 rotate-12">
            <i className={`fa-solid ${currentRank.icon} text-[10rem]`}></i>
          </div>
          
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-6">Current Status</p>
            <div className="flex flex-col items-center text-center">
              <div className={`h-32 w-32 rounded-[2.5rem] ${currentRank.bg} ${currentRank.color} flex items-center justify-center text-6xl shadow-[0_20px_50px_rgba(79,70,229,0.3)] mb-6 ring-4 ring-white/10 group-hover:scale-110 transition duration-500`}>
                <i className={`fa-solid ${currentRank.icon}`}></i>
              </div>
              <h4 className="text-3xl font-black tracking-tight">{currentRank.label}</h4>
              <p className="text-slate-400 font-bold text-sm mt-2">Rank #{user.rank === 'Gold' ? 4 : user.rank === 'Silver' ? 12 : 45} in Region</p>
            </div>
          </div>

          <div className="relative z-10 pt-10 space-y-4">
             <div className="flex justify-between items-end">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Progression</p>
                <p className="text-sm font-black text-indigo-400">
                   {user.points.toLocaleString()} <span className="text-xs opacity-50">/ {nextRank?.min.toLocaleString() || 'MAX'}</span>
                </p>
             </div>
             <div className="h-4 w-full bg-white/10 rounded-full overflow-hidden p-1 border border-white/5">
                <div className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(79,70,229,0.5)]" style={{ width: `${progress}%` }}></div>
             </div>
             {nextRank && (
               <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest text-center">
                 <i className="fa-solid fa-arrow-up text-indigo-400 mr-2"></i> {nextRank.min - user.points} Pts until {nextRank.label}
               </p>
             )}
          </div>
        </div>

        {/* Badge Cabinet */}
        <div className="lg:col-span-2 bg-white rounded-[3rem] border border-slate-200 shadow-sm p-10 flex flex-col">
          <header className="mb-8 flex justify-between items-start">
            <div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Achievement Cabinet</h3>
              <p className="text-slate-500 font-medium">Regional certifications and activity milestones.</p>
            </div>
            <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
               <span className="text-[10px] font-black text-slate-900">{user.badges?.length || 0} Badges Earned</span>
            </div>
          </header>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 flex-grow">
            {user.badges && user.badges.length > 0 ? (
              user.badges.map(badge => (
                <div key={badge.id} className="bg-slate-50 border border-slate-100 p-6 rounded-[2.5rem] flex flex-col items-center text-center group transition-all hover:bg-white hover:shadow-xl hover:border-indigo-100 animate-in fade-in zoom-in-95 duration-500">
                  <div className={`h-16 w-16 rounded-full flex items-center justify-center text-2xl mb-4 ${badge.color} bg-white shadow-sm border border-slate-50 group-hover:scale-110 transition duration-500`}>
                    <i className={`fa-solid ${badge.icon}`}></i>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 mb-1">{badge.label}</h4>
                  <p className="text-[9px] text-slate-400 font-bold leading-tight uppercase tracking-tighter">{badge.description}</p>
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-300">
                <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <i className="fa-solid fa-lock text-3xl"></i>
                </div>
                <p className="font-black uppercase tracking-widest text-xs">No badges unlocked yet</p>
                <p className="text-[10px] font-bold mt-2 opacity-60">Complete 5 approved submissions to start.</p>
              </div>
            )}
            
            <div className="border-2 border-dashed border-slate-100 p-6 rounded-[2.5rem] flex flex-col items-center justify-center text-center opacity-40 group hover:opacity-100 transition">
              <div className="h-16 w-16 rounded-full flex items-center justify-center text-2xl mb-4 bg-slate-50 text-slate-300">
                <i className="fa-solid fa-plus"></i>
              </div>
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Next Badge</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Point Earning Potential */}
      <div className="bg-indigo-600 text-white rounded-[3rem] p-10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
           <i className="fa-solid fa-bolt text-[12rem]"></i>
        </div>
        <div className="relative z-10">
          <header className="mb-10">
             <h3 className="text-3xl font-black tracking-tight leading-none mb-2">Earning Potential</h3>
             <p className="text-indigo-100 font-medium">Maximize your rewards by providing high-fidelity data.</p>
          </header>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
             <EarnRule label="Base Report" pts={POINT_VALUES.BASE_SUBMISSION} icon="fa-clipboard" />
             <EarnRule label="Photo Evidence" pts={POINT_VALUES.PHOTO_BONUS} icon="fa-camera" />
             <EarnRule label="GPS Verification" pts={POINT_VALUES.GEO_BONUS} icon="fa-location-dot" />
             <EarnRule label="Market Accuracy" pts={POINT_VALUES.ACCURACY_BONUS} icon="fa-bullseye" />
             <EarnRule label="Daily Activity" pts={POINT_VALUES.STREAK_BONUS} icon="fa-calendar-check" />
          </div>
        </div>
      </div>

      {/* Identity Form */}
      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden p-10">
        <header className="mb-10">
          <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Identity & Market Persona</h3>
          <p className="text-slate-500 font-medium">Verify your regional profile to increase your data weight.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Legal Full Name</label>
            <input 
              type="text" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black focus:ring-4 focus:ring-indigo-50 outline-none transition"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Regional Mobile Number</label>
            <input 
              type="text" 
              placeholder="+250 7XX XXX XXX"
              value={formData.phone} 
              onChange={e => setFormData({...formData, phone: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black focus:ring-4 focus:ring-indigo-50 outline-none transition"
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Market Entity Type</label>
            <div className="relative group">
              <select 
                value={formData.type} 
                onChange={e => setFormData({...formData, type: e.target.value as ContributorType})}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-5 text-sm font-black focus:ring-4 focus:ring-indigo-50 outline-none transition appearance-none cursor-pointer"
              >
                {Object.values(ContributorType).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <i className="fa-solid fa-chevron-down"></i>
              </div>
            </div>
            <p className="text-[9px] text-slate-400 font-bold uppercase mt-2 italic px-2 leading-relaxed">
              <i className="fa-solid fa-circle-info mr-1 text-indigo-400"></i> 
              Verified entity status allows your submissions to bypass manual review thresholds if consistent.
            </p>
          </div>
        </div>

        <div className="pt-10 border-t border-slate-100 mt-10">
          <button 
            onClick={handleSave}
            className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl hover:bg-indigo-600 transition duration-300 transform active:scale-[0.98]"
          >
            Save Profile Integrity
          </button>
        </div>
      </div>

      {/* Rank Path Visualization */}
      <div className="bg-white rounded-[3rem] border border-slate-200 p-10 shadow-sm overflow-hidden">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-10">Regional Rank Hierarchy</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
           {RANKS.map(r => {
             const isAchieved = user.points >= r.min;
             const isActive = currentRank.label === r.label;
             return (
               <div key={r.label} className={`relative p-6 rounded-[2rem] border-2 transition flex flex-col items-center text-center ${isActive ? 'bg-indigo-50 border-indigo-600' : isAchieved ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-50 opacity-40'}`}>
                 {isActive && (
                    <div className="absolute -top-3 bg-indigo-600 text-white text-[8px] font-black uppercase px-3 py-1 rounded-full tracking-tighter">Your Level</div>
                 )}
                 <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-xl mb-3 ${isActive ? 'bg-white text-indigo-600' : isAchieved ? 'bg-white text-slate-400' : 'bg-slate-50 text-slate-200'}`}>
                   <i className={`fa-solid ${r.icon}`}></i>
                 </div>
                 <h5 className="font-black text-slate-900 text-xs">{r.label}</h5>
                 <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{r.min} Pts</p>
               </div>
             );
           })}
        </div>
      </div>
    </div>
  );
};

const EarnRule: React.FC<{ label: string, pts: number, icon: string }> = ({ label, pts, icon }) => (
  <div className="bg-white/10 p-5 rounded-3xl border border-white/5 flex flex-col items-center text-center">
    <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-lg mb-3">
       <i className={`fa-solid ${icon}`}></i>
    </div>
    <p className="text-[9px] font-black uppercase tracking-widest mb-1">{label}</p>
    <p className="text-xl font-black text-indigo-200">+{pts}</p>
  </div>
);

const SubmissionForm: React.FC<{ onSubmit: (sub: Submission) => void, user: User }> = ({ onSubmit, user }) => {
  const [step, setStep] = useState(1);
  const [gpsLoading, setGpsLoading] = useState(false);

  const [form, setForm] = useState<any>({
    category: Category.CONSTRUCTION,
    subCategory: '',
    productId: '',
    brandId: '',
    brandName: '',
    spec1: '',
    spec2: '',
    price: '',
    unit: '',
    currency: 'RWF',
    supplierName: '',
    supplierType: SupplierType.RETAIL_HARDWARE,
    country: 'Rwanda',
    city: 'Kigali',
    stock: StockStatus.IN_STOCK,
    hasPhoto: false,
    notes: '',
    lat: null,
    lng: null
  });

  useEffect(() => {
    if (navigator.geolocation) {
      setGpsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setForm(f => ({ ...f, lat: pos.coords.latitude, lng: pos.coords.longitude }));
          setGpsLoading(false);
        },
        () => setGpsLoading(false)
      );
    }
  }, []);

  const subCategories = useMemo(() => Object.keys(PRODUCT_HIERARCHY[form.category]), [form.category]);
  const productMeta = useMemo(() => form.subCategory ? PRODUCT_HIERARCHY[form.category][form.subCategory] : null, [form.category, form.subCategory]);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  // Auto-standardization of Units
  useEffect(() => {
    if (productMeta) {
      setForm(prev => ({ ...prev, unit: productMeta.unit }));
    }
  }, [productMeta]);

  // Handle Country selection reset city
  const handleCountryChange = (country: string) => {
    setForm(prev => ({ 
      ...prev, 
      country, 
      city: (REGIONS as any)[country][0],
      currency: COUNTRY_CURRENCY[country] || 'USD'
    }));
  };

  const handleSubmit = () => {
    const rate = FX_RATES[form.currency] || 1;
    const submission: Submission = {
      id: 'S' + Math.random().toString().slice(2, 8),
      timestamp: new Date().toISOString(),
      productId: productMeta?.id || '',
      brandId: form.brandId,
      contributorId: user.id,
      contributorName: user.name,
      contributorType: user.type,
      category: form.category,
      subCategory: form.subCategory,
      brand: form.brandName,
      spec1: form.spec1,
      spec2: form.spec2,
      unit: form.unit || productMeta?.unit || 'unit',
      priceLocal: parseFloat(form.price),
      currency: form.currency,
      priceUSD: parseFloat(form.price) / rate,
      country: form.country,
      city: form.city,
      supplierName: form.supplierName,
      supplierType: form.supplierType,
      stockAvailability: form.stock,
      status: SubmissionStatus.PENDING,
      hasPhoto: form.hasPhoto,
      notes: form.notes,
      latitude: form.lat || -1.9441,
      longitude: form.lng || 30.0619,
      trustWeight: user.trustScore / 100,
      pointsEarned: 0 // Calculated by validator
    };
    onSubmit(submission);
    setStep(1);
    // Reset form after submission
    setForm({
      category: Category.CONSTRUCTION,
      subCategory: '',
      productId: '',
      brandId: '',
      brandName: '',
      spec1: '',
      spec2: '',
      price: '',
      unit: '',
      currency: 'RWF',
      supplierName: '',
      supplierType: SupplierType.RETAIL_HARDWARE,
      country: 'Rwanda',
      city: 'Kigali',
      stock: StockStatus.IN_STOCK,
      hasPhoto: false,
      notes: '',
      lat: form.lat,
      lng: form.lng
    });
  };

  return (
    <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden max-w-xl mx-auto border-t-8 border-indigo-600">
      <div className="bg-slate-50 h-2 flex">
        {[1, 2, 3, 4, 5, 6].map(s => (
          <div key={s} className={`flex-1 transition-all duration-700 ${step >= s ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
        ))}
      </div>
      <div className="p-10">
        <header className="mb-10">
          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-2">Step {step} / 6</p>
          <h3 className="text-3xl font-black tracking-tight">
            {step === 1 ? "Product Type" : 
             step === 2 ? "Specifications" : 
             step === 3 ? "Valuation & Supplier" : 
             step === 4 ? "Location & Inventory" : 
             step === 5 ? "Documentation" : "Review Submission"}
          </h3>
        </header>

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Market Segment</label>
              <div className="flex gap-2">
                <button 
                  onClick={() => setForm({...form, category: Category.CONSTRUCTION, subCategory: ''})} 
                  className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border-2 transition ${form.category === Category.CONSTRUCTION ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}
                >
                  Construction
                </button>
                <button 
                  onClick={() => setForm({...form, category: Category.AGRICULTURE, subCategory: ''})} 
                  className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border-2 transition ${form.category === Category.AGRICULTURE ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}
                >
                  Agricultural
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Product Class</label>
              <div className="grid grid-cols-1 gap-2">
                {subCategories.map(sub => (
                  <button 
                    key={sub} 
                    onClick={() => setForm({...form, subCategory: sub})} 
                    className={`w-full text-left p-5 rounded-2xl border-2 font-black text-sm transition flex items-center justify-between group ${form.subCategory === sub ? 'bg-indigo-50 border-indigo-600 text-indigo-600' : 'bg-slate-50 border-slate-50 text-slate-400 hover:border-slate-200'}`}
                  >
                    <span>{sub}</span>
                    <i className={`fa-solid fa-circle-check transition ${form.subCategory === sub ? 'opacity-100' : 'opacity-0'}`}></i>
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleNext} 
              disabled={!form.subCategory}
              className="w-full mt-8 bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-100 disabled:opacity-30 disabled:shadow-none transition transform active:scale-95"
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Select Brand</label>
              <select value={form.brandId} onChange={(e) => {
                const brand = productMeta?.brands.find((b: any) => b.id === e.target.value);
                setForm({...form, brandId: e.target.value, brandName: brand?.name || '', spec1: ''});
              }} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black outline-none focus:ring-4 focus:ring-indigo-50 transition">
                <option value="">-- Choose Brand --</option>
                {productMeta?.brands?.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            
            {form.brandId && (
              <div className="animate-in slide-in-from-top-4 duration-300">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{productMeta?.detailsLabel}</label>
                <div className="grid grid-cols-2 gap-2">
                  {productMeta?.brands.find((b: any) => b.id === form.brandId)?.specs.map((d: string) => (
                    <button 
                      key={d}
                      onClick={() => setForm({...form, spec1: d})}
                      className={`p-4 rounded-xl border-2 font-black text-xs transition ${form.spec1 === d ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-100 text-slate-500'}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Additional Specs (Optional)</label>
              <input 
                type="text" 
                value={form.spec2} 
                onChange={(e) => setForm({...form, spec2: e.target.value})}
                placeholder="e.g. Gauge, Coating, Grade"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black outline-none focus:ring-4 focus:ring-indigo-50 transition"
              />
            </div>

            <div className="flex gap-4 pt-6">
              <button onClick={handleBack} className="flex-1 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition">Back</button>
              <button onClick={handleNext} disabled={!form.spec1} className="flex-[3] bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-100 disabled:opacity-30 transition">Next</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Currency</label>
                  <select value={form.currency} onChange={(e) => setForm({...form, currency: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black">
                     {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                  </select>
               </div>
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Price Local</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black outline-none" placeholder="0" />
               </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Standard Unit (Fixed)</label>
              <div className="bg-slate-100 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black text-slate-500 flex items-center justify-between">
                <span>{form.unit || 'Standard unit'}</span>
                <i className="fa-solid fa-lock text-[10px] opacity-30"></i>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Supplier Type</label>
              <select value={form.supplierType} onChange={(e) => setForm({...form, supplierType: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black">
                 {Object.values(SupplierType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Store / Supplier Name</label>
              <input type="text" value={form.supplierName} onChange={(e) => setForm({...form, supplierName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black outline-none" placeholder="e.g. Kigali Hardware Center" />
            </div>

            <div className="flex gap-4 pt-6">
              <button onClick={handleBack} className="flex-1 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest transition">Back</button>
              <button onClick={handleNext} disabled={!form.price || !form.supplierName} className="flex-[3] bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-100 transition">Location Info</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Country</label>
                <select value={form.country} onChange={(e) => handleCountryChange(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black">
                  {Object.keys(REGIONS).map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">City / Town</label>
                <select value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black">
                  {(REGIONS as any)[form.country]?.map((city: string) => <option key={city}>{city}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Stock Availability</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.values(StockStatus).map(s => (
                  <button 
                    key={s} 
                    onClick={() => setForm({...form, stock: s})} 
                    className={`p-3 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest transition ${form.stock === s ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}
                  >
                    {s.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xl shadow-sm ${form.lat ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400 animate-pulse'}`}>
                <i className={`fa-solid ${form.lat ? 'fa-location-dot' : 'fa-gps-slash'}`}></i>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">GPS Coordinates</p>
                <p className="text-xs font-bold text-slate-900">{form.lat ? `${form.lat.toFixed(4)}, ${form.lng.toFixed(4)}` : 'Detecting location...'}</p>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <button onClick={handleBack} className="flex-1 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest transition">Back</button>
              <button onClick={handleNext} className="flex-[3] bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-100 transition">Final Docs</button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-8">
            <div className="text-center p-12 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 relative group transition-all hover:bg-white hover:border-indigo-600 overflow-hidden">
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={() => setForm({...form, hasPhoto: true})} />
              <div className={`h-28 w-28 rounded-full mx-auto flex items-center justify-center text-5xl mb-6 transition duration-500 ${form.hasPhoto ? 'bg-emerald-500 text-white shadow-2xl scale-110' : 'bg-slate-200 text-slate-400'}`}>
                <i className={`fa-solid ${form.hasPhoto ? 'fa-check' : 'fa-camera'}`}></i>
              </div>
              <h4 className="font-black text-xl text-slate-900">Upload Photo Evidence</h4>
              <p className="text-[10px] text-slate-500 mt-3 uppercase font-black tracking-[0.2em]">Optional: +{POINT_VALUES.PHOTO_BONUS} Bonus Points</p>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Supplier Notes / Observations</label>
              <textarea 
                value={form.notes} 
                onChange={(e) => setForm({...form, notes: e.target.value})}
                placeholder="Any market trends or supply issues noted?"
                className="w-full bg-slate-50 border border-slate-200 rounded-[2rem] p-6 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-100 transition min-h-[120px]"
              />
            </div>

            <div className="flex gap-4 pt-6">
              <button onClick={handleBack} className="flex-1 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest transition">Back</button>
              <button onClick={handleNext} className="flex-[3] bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-100 transition">Review Report</button>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-8 animate-in zoom-in-95 duration-300">
            <div className="bg-emerald-600 text-white p-8 rounded-[2.5rem] shadow-2xl flex items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12"><i className="fa-solid fa-gift text-[8rem]"></i></div>
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase opacity-60 tracking-[0.2em] mb-2">Estimated Yield</p>
                <p className="text-5xl font-black">+{POINT_VALUES.BASE_SUBMISSION + (form.hasPhoto ? POINT_VALUES.PHOTO_BONUS : 0)} <span className="text-lg">Pts</span></p>
              </div>
              <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                <i className="fa-solid fa-bolt"></i>
              </div>
            </div>

            <div className="space-y-4">
              <SummaryRow label="Commodity" value={`${form.brandName} ${form.subCategory}`} sub={`${form.spec1} ${form.spec2 ? '| ' + form.spec2 : ''}`} />
              <SummaryRow label="Valuation" value={formatCurrency(parseFloat(form.price), form.currency)} sub={`per ${form.unit} @ ${form.supplierName}`} />
              <SummaryRow label="Market Area" value={`${form.city}, ${form.country}`} sub={form.stock} />
            </div>

            <div className="flex gap-4 pt-8">
              <button onClick={handleBack} className="flex-1 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest transition">Back</button>
              <button onClick={handleSubmit} className="flex-[3] bg-slate-900 text-white py-6 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-slate-200 transform transition active:scale-95 hover:bg-indigo-600">
                Seal & Submit Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SummaryRow: React.FC<{ label: string, value: string, sub: string }> = ({ label, value, sub }) => (
  <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-lg font-black text-slate-900 leading-tight">{value}</p>
    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mt-1">{sub}</p>
  </div>
);

const PortalTab: React.FC<{ active: boolean, onClick: () => void, icon: string, label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex-1 flex items-center justify-center py-4 px-6 rounded-[1.5rem] text-[10px] font-black transition-all whitespace-nowrap uppercase tracking-widest ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
  >
    <i className={`fa-solid ${icon} mr-2 text-sm`}></i> {label}
  </button>
);

const StatCard: React.FC<{ label: string, value: string, icon: string, color: string }> = ({ label, value, icon, color }) => (
  <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex items-center gap-4">
    <div className={`h-10 w-10 bg-white rounded-xl flex items-center justify-center text-xl ${color} shadow-sm`}>
      <i className={`fa-solid ${icon}`}></i>
    </div>
    <div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm font-black text-slate-900">{value}</p>
    </div>
  </div>
);

const HistoryList: React.FC<{ subs: Submission[] }> = ({ subs }) => (
  <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
    <div className="px-10 py-6 border-b border-slate-100 flex items-center justify-between">
      <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Submission History</h3>
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Showing last {subs.length} items</span>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Product & Store</th>
            <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Price</th>
            <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
            <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Points</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {subs.map(s => (
            <tr key={s.id} className="hover:bg-slate-50 transition group">
              <td className="px-10 py-6">
                <p className="font-black text-slate-900 text-sm group-hover:text-indigo-600 transition">{s.brand} {s.subCategory}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.city} • {new Date(s.timestamp).toLocaleDateString()}</p>
              </td>
              <td className="px-10 py-6 text-right">
                <p className="font-black text-slate-900 text-sm">{formatCurrency(s.priceLocal, s.currency)}</p>
              </td>
              <td className="px-10 py-6">
                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${s.status === SubmissionStatus.APPROVED ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : s.status === SubmissionStatus.FLAGGED ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-100 text-slate-400'}`}>
                  {s.status}
                </span>
              </td>
              <td className="px-10 py-6 text-right">
                <p className="text-xs font-black text-indigo-600">{s.status === SubmissionStatus.APPROVED ? `+${s.pointsEarned || 10}` : '-'}</p>
              </td>
            </tr>
          ))}
          {subs.length === 0 && (
            <tr>
              <td colSpan={4} className="py-20 text-center text-slate-300 font-bold italic">No history yet. Start reporting prices!</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const RewardsSection: React.FC<{ userPoints: number }> = ({ userPoints }) => (
  <div className="space-y-8 animate-in zoom-in-95 duration-300">
    <div className="bg-slate-900 text-white p-12 rounded-[3rem] shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-12 opacity-10">
        <i className="fa-solid fa-gift text-[12rem]"></i>
      </div>
      <div className="relative z-10 space-y-4">
        <h3 className="text-4xl font-black tracking-tight">Reward Marketplace</h3>
        <p className="text-slate-400 font-bold text-lg max-w-lg">Redeem your hard-earned trust points for market vouchers and discounts.</p>
        <div className="pt-6">
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-2">Available Balance</p>
          <div className="flex items-center gap-4">
            <span className="text-5xl font-black">{userPoints.toLocaleString()}</span>
            <span className="text-xl font-black text-indigo-400">Pts</span>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {MOCK_REWARDS.map(r => (
        <div key={r.id} className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm hover:shadow-xl hover:border-indigo-100 transition group flex flex-col h-full">
          <div className="flex items-start justify-between mb-8">
            <div className="h-16 w-16 bg-slate-50 rounded-3xl flex items-center justify-center text-3xl text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition">
              <i className={`fa-solid ${r.icon}`}></i>
            </div>
            <div className="text-right">
              <p className="text-xl font-black text-slate-900 leading-none mb-1">{r.cost}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Points Required</p>
            </div>
          </div>
          <div className="flex-grow space-y-2 mb-8">
            <h4 className="text-lg font-black text-slate-900 leading-tight">{r.label}</h4>
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Valid at: {r.provider}</p>
          </div>
          <button 
            disabled={userPoints < r.cost}
            className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition shadow-lg ${userPoints >= r.cost ? 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700' : 'bg-slate-100 text-slate-400 shadow-none cursor-not-allowed'}`}
          >
            {userPoints >= r.cost ? 'Redeem Voucher' : 'Insufficient Points'}
          </button>
        </div>
      ))}
    </div>
  </div>
);

const LeaderboardSection: React.FC<{ currentUserId: string }> = ({ currentUserId }) => {
  const [lbView, setLbView] = useState<'weekly' | 'alltime'>('weekly');
  const data = lbView === 'weekly' ? MOCK_WEEKLY_LEADERBOARD : MOCK_WEEKLY_LEADERBOARD; // For MVP, using same data source

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
      <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Regional Rankings</h3>
          <p className="text-slate-500 font-bold text-sm">Competition fuels resilience. Top weekly contributors win RWF 10,000 credit!</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl">
          <button onClick={() => setLbView('weekly')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition ${lbView === 'weekly' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Weekly</button>
          <button onClick={() => setLbView('alltime')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition ${lbView === 'alltime' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Hall of Fame</button>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="space-y-1 divide-y divide-slate-50">
          {data.map((entry) => (
            <div key={entry.id} className={`flex items-center justify-between px-10 py-6 hover:bg-slate-50 transition group ${entry.name === 'John Contributor' ? 'bg-indigo-50/50' : ''}`}>
              <div className="flex items-center gap-8">
                <span className={`w-8 text-center font-black text-xl ${entry.rank === 1 ? 'text-amber-500' : entry.rank === 2 ? 'text-slate-400' : entry.rank === 3 ? 'text-amber-700' : 'text-slate-300'}`}>
                  {entry.rank <= 3 ? <i className={`fa-solid ${entry.rank === 1 ? 'fa-crown' : 'fa-award'} text-2xl`}></i> : entry.rank}
                </span>
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 text-xl border border-slate-200 group-hover:bg-white transition shadow-sm">
                    <i className="fa-solid fa-user-astronaut"></i>
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900 leading-none mb-1.5">{entry.name} {entry.id === 'l1' && <span className="text-[10px] bg-indigo-600 text-white px-3 py-1 rounded-full uppercase ml-2 tracking-tighter">You</span>}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{entry.submissions} Contributions Verified</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-slate-900 leading-none mb-1">{entry.points.toLocaleString()}</p>
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Points</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContributorPortal;
