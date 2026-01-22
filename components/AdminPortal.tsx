
import React, { useState, useMemo } from 'react';
import { Submission, SubmissionStatus, User, UserRole, ContributorType } from '../types';
import { formatCurrency } from '../utils';
import { MOCK_CONTRIBUTORS_DETAILED } from '../constants';

interface Props {
  submissions: Submission[];
  onUpdateStatus: (id: string, status: SubmissionStatus, comment?: string) => void;
}

type AdminTab = 'validation' | 'contributors' | 'quality';
type QueueFilter = 'pending' | 'flagged' | 'outliers' | 'new_users' | 'priority' | 'all';
type ConFilter = 'all' | 'field_agents' | 'traders' | 'consumers' | 'suspended';

const AdminPortal: React.FC<Props> = ({ submissions, onUpdateStatus }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('validation');
  
  // Validation State
  const [queueFilter, setQueueFilter] = useState<QueueFilter>('pending');
  const [queueSort, setQueueSort] = useState<'oldest' | 'newest' | 'deviation' | 'priority'>('priority');
  const [adminNote, setAdminNote] = useState<Record<string, string>>({});

  // Contributor State
  const [conFilter, setConFilter] = useState<ConFilter>('all');
  const [conSort, setConSort] = useState<'trust' | 'submissions' | 'join' | 'activity'>('trust');

  // Logic: Queue Filtering
  const filteredQueue = useMemo(() => {
    let list = [...submissions];
    if (queueFilter === 'pending') list = list.filter(s => s.status === SubmissionStatus.PENDING);
    else if (queueFilter === 'flagged') list = list.filter(s => s.status === SubmissionStatus.FLAGGED);
    else if (queueFilter === 'outliers') list = list.filter(s => Math.abs(s.deviationFromMedian || 0) > 15);
    else if (queueFilter === 'new_users') list = list.filter(s => (s.trustWeight || 0) < 40);
    else if (queueFilter === 'priority') list = list.filter(s => s.isPriority);

    return list.sort((a, b) => {
      if (queueSort === 'priority') return (b.isPriority ? 1 : 0) - (a.isPriority ? 1 : 0);
      if (queueSort === 'deviation') return Math.abs(b.deviationFromMedian || 0) - Math.abs(a.deviationFromMedian || 0);
      if (queueSort === 'newest') return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });
  }, [submissions, queueFilter, queueSort]);

  // Contributor Logic
  const filteredContributors = useMemo(() => {
    let list = [...MOCK_CONTRIBUTORS_DETAILED];
    if (conFilter === 'field_agents') list = list.filter(c => c.type === ContributorType.FIELD_AGENT);
    if (conFilter === 'traders') list = list.filter(c => c.type === ContributorType.TRADER);
    if (conFilter === 'consumers') list = list.filter(c => c.type === ContributorType.CONSUMER);
    if (conFilter === 'suspended') list = list.filter(c => c.status === 'Suspended');

    return list.sort((a, b) => {
      if (conSort === 'trust') return b.trustScore - a.trustScore;
      if (conSort === 'submissions') return b.submissionsCount - a.submissionsCount;
      if (conSort === 'join') return new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime();
      return 0;
    });
  }, [conFilter, conSort]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Global Tab Switcher */}
      <div className="flex bg-white/50 backdrop-blur-md p-2 rounded-[2.5rem] border border-slate-200 shadow-sm max-w-3xl mx-auto">
        <TabButton 
          active={activeTab === 'validation'} 
          onClick={() => setActiveTab('validation')} 
          icon="fa-list-check" 
          label="Review Queue" 
        />
        <TabButton 
          active={activeTab === 'contributors'} 
          onClick={() => setActiveTab('contributors')} 
          icon="fa-users-gear" 
          label="Contributors" 
        />
        <TabButton 
          active={activeTab === 'quality'} 
          onClick={() => setActiveTab('quality')} 
          icon="fa-gauge-high" 
          label="Data Quality" 
        />
      </div>

      {activeTab === 'validation' && (
        <div className="space-y-8">
          <header className="bg-white rounded-[3rem] border border-slate-200 p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-indigo-600 text-white text-[9px] font-black uppercase px-3 py-1 rounded-full tracking-widest">System Audit</span>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Validation Terminal</h2>
              </div>
              <p className="text-slate-500 font-medium">Flagged Submissions Requiring Manual Review ({filteredQueue.length})</p>
            </div>
            <div className="flex bg-slate-100 p-1.5 rounded-2xl">
               <button onClick={() => setQueueFilter('pending')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${queueFilter === 'pending' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Pending</button>
               <button onClick={() => setQueueFilter('flagged')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${queueFilter === 'flagged' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'}`}>Flagged</button>
               <button onClick={() => setQueueFilter('priority')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${queueFilter === 'priority' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Priority</button>
            </div>
          </header>

          <div className="grid grid-cols-1 gap-6">
            {filteredQueue.map(sub => (
              <SubmissionReviewCard key={sub.id} sub={sub} onUpdateStatus={onUpdateStatus} adminNote={adminNote} setAdminNote={setAdminNote} />
            ))}
            {filteredQueue.length === 0 && (
              <div className="py-40 text-center bg-white rounded-[3rem] border border-slate-100 border-dashed">
                <div className="h-24 w-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                  <i className="fa-solid fa-circle-check"></i>
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Queue Depleted</h3>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'contributors' && (
        <div className="space-y-8">
          <header className="bg-white rounded-[3rem] border border-slate-200 p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-emerald-600 text-white text-[9px] font-black uppercase px-3 py-1 rounded-full tracking-widest">User Governance</span>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Contributor Directory</h2>
              </div>
              <p className="text-slate-500 font-medium">Monitoring regional network trust and accuracy benchmarks.</p>
            </div>
            <div className="flex bg-slate-100 p-1.5 rounded-2xl">
               <button onClick={() => setConFilter('all')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${conFilter === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>All</button>
               <button onClick={() => setConFilter('field_agents')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${conFilter === 'field_agents' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Agents</button>
               <button onClick={() => setConFilter('traders')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${conFilter === 'traders' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Traders</button>
               <button onClick={() => setConFilter('suspended')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${conFilter === 'suspended' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'}`}>Suspended</button>
            </div>
          </header>

          <div className="grid grid-cols-1 gap-6 pb-20">
            {filteredContributors.map(con => (
              <ContributorManagementCard key={con.id} con={con} />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'quality' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <header className="bg-white rounded-[3rem] border border-slate-200 p-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 shadow-sm">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-slate-900 text-white text-[9px] font-black uppercase px-3 py-1 rounded-full tracking-widest">Integrity Report</span>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">Weekly Data Quality</h2>
              </div>
              <p className="text-slate-500 font-medium">Analytics for Jan 15 - 22, 2026</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="bg-white border border-slate-200 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition shadow-sm">
                <i className="fa-solid fa-file-pdf mr-2 text-rose-600"></i> Download Report
              </button>
              <button className="bg-indigo-600 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition">
                <i className="fa-solid fa-chart-line mr-2"></i> View Trends
              </button>
            </div>
          </header>

          {/* Main Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatsCardBig label="Total Submissions" value="1,247" color="text-slate-900" />
            <StatsCardBig label="Auto-Approved" value="892" sub="71.5%" color="text-emerald-600" />
            <StatsCardBig label="Flagged" value="312" sub="25.0%" color="text-amber-500" />
            <StatsCardBig label="Rejected" value="43" sub="3.5%" color="text-rose-600" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Approval Rate by Contributor */}
            <div className="bg-white rounded-[3rem] border border-slate-200 p-10 shadow-sm space-y-8">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Approval Rate by Contributor Type</h3>
              <div className="space-y-6">
                <ProgressItem label="Field Agents" value={98} sub="485/495" color="bg-indigo-600" />
                <ProgressItem label="Trusted Traders" value={89} sub="267/300" color="bg-emerald-500" />
                <ProgressItem label="Consumers" value={63} sub="140/222" color="bg-amber-500" />
              </div>
            </div>

            {/* Top Quality Issues */}
            <div className="bg-white rounded-[3rem] border border-slate-200 p-10 shadow-sm space-y-8">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Top Quality Issues</h3>
              <div className="space-y-4">
                <IssueRow label="Missing Photos" count={178} icon="fa-camera-slash" />
                <IssueRow label="Price Outliers" count={89} icon="fa-arrow-up-right-dots" />
                <IssueRow label="Duplicate Submissions" count={45} icon="fa-copy" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Product Data Coverage */}
            <div className="lg:col-span-2 bg-white rounded-[3rem] border border-slate-200 p-10 shadow-sm">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-8">Data Coverage (5+ submissions/week)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <CoverageItem label="Cement" percentage={95} status="excellent" />
                <CoverageItem label="Fertilizers" percentage={88} status="good" />
                <CoverageItem label="Steel (8-12mm)" percentage={78} status="good" />
                <CoverageItem label="Roofing" percentage={62} status="fair" />
                <CoverageItem label="Paints" percentage={41} status="poor" />
              </div>
            </div>

            {/* Geographic Coverage */}
            <div className="bg-slate-900 text-white rounded-[3rem] p-10 shadow-xl space-y-8">
               <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Geographic Coverage</h3>
               <div className="space-y-6">
                  <GeoStatus label="Kigali" status="Excellent" sub="300+ submissions" color="text-emerald-400" />
                  <GeoStatus label="Kampala" status="Good" sub="180+ submissions" color="text-indigo-400" />
                  <GeoStatus label="Bujumbura" status="Fair" sub="95 submissions" color="text-amber-400" />
                  <GeoStatus label="Secondary Cities" status="Poor" sub="<50 submissions" color="text-rose-400" />
               </div>
               <button className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition">
                 Recruit Agents for Poor Zones
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Sub-components ---

const TabButton: React.FC<{ active: boolean, onClick: () => void, icon: string, label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex-1 flex items-center justify-center py-4 px-6 rounded-[2rem] text-[10px] font-black transition-all uppercase tracking-[0.2em] whitespace-nowrap ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}
  >
    <i className={`fa-solid ${icon} mr-2`}></i> {label}
  </button>
);

const StatsCardBig: React.FC<{ label: string, value: string, sub?: string, color?: string }> = ({ label, value, sub, color }) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{label}</p>
    <div className="flex items-baseline gap-2">
      <span className={`text-4xl font-black tracking-tight ${color}`}>{value}</span>
      {sub && <span className="text-sm font-bold text-slate-400">{sub}</span>}
    </div>
  </div>
);

const ProgressItem: React.FC<{ label: string, value: number, sub: string, color: string }> = ({ label, value, sub, color }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-end">
      <span className="text-sm font-black text-slate-700">{label}</span>
      <span className="text-[10px] font-bold text-slate-400 uppercase">{sub} ({value}%)</span>
    </div>
    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${value}%` }}></div>
    </div>
  </div>
);

const IssueRow: React.FC<{ label: string, count: number, icon: string }> = ({ label, count, icon }) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
    <div className="flex items-center gap-4">
      <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <span className="text-sm font-bold text-slate-700">{label}</span>
    </div>
    <span className="text-lg font-black text-slate-900">{count}</span>
  </div>
);

const CoverageItem: React.FC<{ label: string, percentage: number, status: 'excellent' | 'good' | 'fair' | 'poor' }> = ({ label, percentage, status }) => {
  const colorMap = {
    excellent: 'text-emerald-600',
    good: 'text-indigo-600',
    fair: 'text-amber-600',
    poor: 'text-rose-600'
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`h-2 w-2 rounded-full ${status === 'excellent' ? 'bg-emerald-500' : status === 'poor' ? 'bg-rose-500' : 'bg-slate-300'}`}></div>
        <span className="text-sm font-bold text-slate-700">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-sm font-black ${colorMap[status]}`}>{percentage}%</span>
        {status === 'excellent' && <i className="fa-solid fa-circle-check text-emerald-500 text-xs"></i>}
        {status === 'poor' && <i className="fa-solid fa-circle-exclamation text-rose-500 text-xs"></i>}
      </div>
    </div>
  );
};

const GeoStatus: React.FC<{ label: string, status: string, sub: string, color: string }> = ({ label, status, sub, color }) => (
  <div className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0">
    <div>
      <p className="text-sm font-black">{label}</p>
      <p className="text-[10px] text-slate-400 font-bold uppercase">{sub}</p>
    </div>
    <div className="text-right">
      <p className={`text-[10px] font-black uppercase tracking-widest ${color}`}>{status}</p>
    </div>
  </div>
);

const SubmissionReviewCard: React.FC<{ sub: Submission, onUpdateStatus: (id: string, status: SubmissionStatus, comment?: string) => void, adminNote: Record<string, string>, setAdminNote: any }> = ({ sub, onUpdateStatus, adminNote, setAdminNote }) => (
  <div className={`bg-white rounded-[3rem] border p-8 shadow-sm transition-all group ${sub.isPriority ? 'border-l-[10px] border-indigo-600' : 'border-slate-200 hover:border-indigo-100'}`}>
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-grow space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Submission #{sub.id.slice(-4)}</span>
            <h4 className="text-2xl font-black text-slate-900 tracking-tight">{sub.brand} {sub.subCategory}</h4>
            {sub.isPriority && <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">High-Value Item</span>}
          </div>
          {sub.status === SubmissionStatus.FLAGGED && (
             <div className="bg-rose-50 border border-rose-100 px-4 py-2 rounded-2xl flex items-center gap-2">
                <i className="fa-solid fa-triangle-exclamation text-rose-500 text-xs"></i>
                <span className="text-[10px] font-black text-rose-700 uppercase tracking-tight">Flagged: {sub.flagReason || 'Unusual Activity'}</span>
             </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetaField label="Price" value={formatCurrency(sub.priceLocal, sub.currency)} subValue={`Median: ${formatCurrency(sub.medianReference || 0, sub.currency)}`} />
          <MetaField label="Deviation" value={`${sub.deviationFromMedian?.toFixed(1)}%`} color={Math.abs(sub.deviationFromMedian || 0) > 15 ? 'text-rose-600' : 'text-emerald-600'} />
          <MetaField label="Location" value={`${sub.city}, ${sub.country}`} />
          <MetaField label="Contributor" value={sub.contributorName} subValue={`Trust: ${Math.round(sub.trustWeight * 100)}/100`} />
        </div>
        <div className="flex gap-2 pt-4">
           <button className="px-5 py-2.5 bg-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 transition">View Photo</button>
           <button className="px-5 py-2.5 bg-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 transition">View on Map</button>
        </div>
      </div>
      <div className="lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-100 pt-8 lg:pt-0 lg:pl-8 flex flex-col justify-between space-y-6">
        <div className="space-y-2">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Decision Comment</label>
          <textarea 
            value={adminNote[sub.id] || ''}
            onChange={(e) => setAdminNote({...adminNote, [sub.id]: e.target.value})}
            placeholder="Add explanation for approval or rejection..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-bold outline-none focus:ring-4 focus:ring-indigo-100 min-h-[100px]"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => onUpdateStatus(sub.id, SubmissionStatus.REJECTED, adminNote[sub.id])} 
            className="py-4 bg-rose-50 text-rose-600 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-rose-100 transition shadow-sm"
          >
            Reject
          </button>
          <button 
            onClick={() => onUpdateStatus(sub.id, SubmissionStatus.APPROVED, adminNote[sub.id])} 
            className="py-4 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest text-[9px] shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition"
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  </div>
);

const ContributorManagementCard: React.FC<{ con: User }> = ({ con }) => {
  const approvalRate = ((con.approvedCount / con.submissionsCount) * 100).toFixed(1);
  const badgeLevel = con.trustScore >= 90 ? 'Gold' : con.trustScore >= 70 ? 'Silver' : 'Bronze';
  const badgeColor = con.trustScore >= 90 ? 'text-amber-500 bg-amber-50' : con.trustScore >= 70 ? 'text-slate-400 bg-slate-50' : 'text-amber-700 bg-amber-50/50';

  return (
    <div className="bg-white rounded-[3rem] border border-slate-200 p-10 shadow-sm group hover:border-indigo-100 transition-all">
      <div className="flex flex-col xl:flex-row gap-12">
        <div className="xl:w-64 flex-shrink-0 flex flex-col items-center xl:items-start text-center xl:text-left space-y-4">
          <div className={`h-24 w-24 rounded-full flex items-center justify-center text-4xl border-4 border-white shadow-xl ${con.trustScore >= 80 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
            <i className={`fa-solid ${con.trustScore >= 80 ? 'fa-award' : 'fa-user'}`}></i>
          </div>
          <div>
            <h4 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">{con.name}</h4>
            <div className="flex items-center gap-2 justify-center xl:justify-start">
              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${badgeColor}`}>
                {badgeLevel}
              </span>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{con.type}</p>
            </div>
          </div>
          <div className="pt-2 w-full">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${con.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : con.status === 'Monitoring' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
               <i className={`fa-solid ${con.status === 'Active' ? 'fa-circle-check' : con.status === 'Monitoring' ? 'fa-circle-exclamation' : 'fa-user-slash'} text-xs`}></i>
               <span className="text-[10px] font-black uppercase tracking-widest">{con.status}</span>
            </div>
            <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mt-2 px-1">
              {con.autoApproval ? '✓ Automatic Approval Enabled' : 'Manual Review Required'}
            </p>
          </div>
        </div>

        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <div className="space-y-6">
            <div className="space-y-1">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trust Index</p>
               <div className="flex items-baseline gap-2">
                 <span className="text-3xl font-black text-slate-900">{con.trustScore}</span>
                 <span className="text-xs font-bold text-slate-400">/100</span>
               </div>
               <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-2">
                 <div className={`h-full transition-all duration-1000 ${con.trustScore >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${con.trustScore}%` }}></div>
               </div>
            </div>
            <div className="space-y-1">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Accuracy</p>
               <p className="text-sm font-bold text-slate-700">Last 50 submissions: {con.recentAccuracy || 0}%</p>
               <p className="text-[10px] font-black text-emerald-600 uppercase">Avg Deviation: +{con.avgDeviation || 0}%</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-1">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Submission Volume</p>
               <p className="text-lg font-black text-slate-900">{con.submissionsCount.toLocaleString()} Total</p>
               <p className="text-sm font-bold text-slate-500">{con.approvedCount} approved ({approvalRate}%)</p>
            </div>
            <div className="space-y-1">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Engagement</p>
               <p className="text-sm font-bold text-slate-700">Joined: {new Date(con.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
               <p className="text-sm font-bold text-slate-500">Last Activity: {con.lastActivity}</p>
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Activity Audit</p>
            {con.recentIssues && con.recentIssues.length > 0 ? (
              <div className="space-y-3">
                {con.recentIssues.map(issue => (
                  <div key={issue.id} className="flex gap-3 text-[11px] leading-snug">
                    <i className="fa-solid fa-circle-exclamation text-rose-500 mt-0.5"></i>
                    <span className="text-slate-600 font-medium">{issue.description}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex gap-3 text-[11px] leading-snug items-center text-emerald-600 font-bold bg-emerald-50 p-4 rounded-2xl">
                <i className="fa-solid fa-circle-check"></i>
                <span>No major issues flagged in current period.</span>
              </div>
            )}
          </div>
        </div>

        <div className="xl:w-64 border-t xl:border-t-0 xl:border-l border-slate-100 pt-10 xl:pt-0 xl:pl-10 flex flex-col gap-3">
           <ContributorAction label="View All Submissions" icon="fa-magnifying-glass-chart" />
           <ContributorAction label={con.status === 'Monitoring' ? 'Send Educational Message' : 'Send Message'} icon="fa-paper-plane" />
           <ContributorAction label="Adjust Trust Score" icon="fa-shield-halved" />
           <ContributorAction label="Award Bonus" icon="fa-gift" />
           <ContributorAction 
             label={con.status === 'Suspended' ? 'Reactive User' : 'Suspend Account'} 
             icon="fa-user-slash" 
             danger={con.status !== 'Suspended'} 
           />
        </div>
      </div>
    </div>
  );
};

const MetaField: React.FC<{ label: string, value: string, subValue?: string, color?: string }> = ({ label, value, subValue, color }) => (
  <div>
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className={`text-base font-black truncate ${color || 'text-slate-900'}`}>{value}</p>
    {subValue && <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter mt-0.5">{subValue}</p>}
  </div>
);

const ContributorAction: React.FC<{ label: string, icon: string, danger?: boolean }> = ({ label, icon, danger }) => (
  <button className={`w-full px-5 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center gap-3 transition-all ${danger ? 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-100' : 'bg-slate-50 text-slate-500 hover:bg-indigo-600 hover:text-white border border-slate-100'}`}>
    <i className={`fa-solid ${icon} text-xs w-4`}></i> 
    <span className="truncate">{label}</span>
  </button>
);

export default AdminPortal;
