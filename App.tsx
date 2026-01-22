
import React, { useState, useEffect } from 'react';
import { UserRole, User, Category, Submission, SubmissionStatus } from './types';
import { MOCK_USER, MOCK_ADMIN, MOCK_B2B, INITIAL_SUBMISSIONS } from './constants';
import { 
  POINT_VALUES, getCurrentRank, calculateMedian, 
  detectDuplicate, validateSubmission, calculateUserTrustAdjustment 
} from './utils';
import Navbar from './components/Navbar';
import ContributorPortal from './components/ContributorPortal';
import AdminPortal from './components/AdminPortal';
import B2BPortal from './components/B2BPortal';
import LandingPage from './components/LandingPage';
import ProductDetailPage from './components/ProductDetailPage';

const App: React.FC = () => {
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>(INITIAL_SUBMISSIONS);
  const [view, setView] = useState<'landing' | 'portal' | 'productDetail'>('landing');
  const [selectedProductCriteria, setSelectedProductCriteria] = useState<{brand: string, subCategory: string, detailValue: string} | null>(null);
  
  // Simulation state for UI notifications
  const [lastSystemAction, setLastSystemAction] = useState<string | null>(null);

  const loginAs = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: setActiveUser(MOCK_ADMIN); break;
      case UserRole.CONTRIBUTOR: setActiveUser(MOCK_USER); break;
      case UserRole.B2B: setActiveUser(MOCK_B2B); break;
    }
    setView('portal');
  };

  const logout = () => {
    setActiveUser(null);
    setView('landing');
  };

  const handleViewProduct = (brand: string, subCategory: string, detailValue: string) => {
    setSelectedProductCriteria({ brand, subCategory, detailValue });
    setView('productDetail');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setActiveUser(updatedUser);
  };

  // Workflow 1, 5: Submission Workflow
  const addSubmission = (newSub: Submission) => {
    // Workflow 5: Duplicate Detection
    if (detectDuplicate(newSub, submissions)) {
      setLastSystemAction("Duplicate submission detected! Flagged for review.");
      const flaggedSub = { ...newSub, status: SubmissionStatus.FLAGGED, flagReason: "Duplicate within 24h" };
      setSubmissions([flaggedSub, ...submissions]);
      return;
    }

    // Workflow 1 - Step 2: Calculate Median
    const relatedPrices = submissions
      .filter(s => 
        s.subCategory === newSub.subCategory && 
        s.brand === newSub.brand && 
        s.spec1 === newSub.spec1 &&
        s.status === SubmissionStatus.APPROVED
      )
      .map(s => s.priceLocal);
    
    const median = calculateMedian(relatedPrices);
    
    // Workflow 1 - Step 4: Decision Logic
    if (activeUser) {
      const validation = validateSubmission(newSub, median, activeUser);
      
      // Calculate frequency bonus (if first submission today)
      const hasSubmittedToday = submissions.some(s => 
        s.contributorId === activeUser.id && 
        new Date(s.timestamp).toDateString() === new Date().toDateString()
      );
      const frequencyBonus = !hasSubmittedToday ? POINT_VALUES.STREAK_BONUS : 0;
      
      const totalPointsAwarded = (validation.points || 0) + frequencyBonus;

      const subToSave: Submission = { 
        ...newSub, 
        status: validation.status, 
        deviationFromMedian: validation.deviation,
        medianReference: median,
        pointsEarned: totalPointsAwarded,
        flagReason: (validation as any).reason 
      };

      setSubmissions([subToSave, ...submissions]);

      // If auto-approved, trigger trust recalculation and notify
      if (validation.status === SubmissionStatus.APPROVED) {
        setLastSystemAction(`Auto-approved! +${totalPointsAwarded} points awarded${frequencyBonus > 0 ? ' (incl. daily bonus)' : ''}.`);
        updateUserOnAction(activeUser.id, 'Approved', validation.deviation || 0, newSub.hasPhoto, totalPointsAwarded);
      } else if (validation.status === SubmissionStatus.FLAGGED) {
        setLastSystemAction(`Submission flagged: ${(validation as any).reason}`);
      } else {
        setLastSystemAction("Submission received and queued for review.");
      }
    }
  };

  // Workflow 2: Update User Profile Based on Actions
  const updateUserOnAction = (userId: string, action: 'Approved' | 'Rejected', deviation: number = 0, hasPhoto: boolean = false, overridePoints?: number) => {
    if (!activeUser || activeUser.id !== userId) return;

    const newTrust = calculateUserTrustAdjustment(activeUser, action, deviation, hasPhoto);
    
    // Default point awarding logic if not overridden (e.g. from manual admin approval)
    let pointsChange = 0;
    if (action === 'Approved') {
       if (overridePoints !== undefined) {
         pointsChange = overridePoints;
       } else {
         pointsChange = POINT_VALUES.BASE_SUBMISSION + (hasPhoto ? POINT_VALUES.PHOTO_BONUS : 0);
       }
    } else {
       pointsChange = -POINT_VALUES.REJECTION_PENALTY;
    }

    const newPoints = Math.max(0, activeUser.points + pointsChange);
    
    // Level Promotion Check
    const prevRank = getCurrentRank(activeUser.points);
    const newRank = getCurrentRank(newPoints);
    let finalPoints = newPoints;
    
    if (newRank.label !== prevRank.label && newRank.bonus && newPoints > activeUser.points) {
      finalPoints += newRank.bonus;
      setLastSystemAction(`CONGRATULATIONS! You've been promoted to ${newRank.label} level. +${newRank.bonus} bonus points!`);
    }

    setActiveUser({
      ...activeUser,
      trustScore: newTrust,
      points: finalPoints,
      totalPointsEarned: activeUser.totalPointsEarned + (pointsChange > 0 ? pointsChange : 0),
      submissionsCount: activeUser.submissionsCount + 1,
      approvedCount: activeUser.approvedCount + (action === 'Approved' ? 1 : 0),
      rejectionsCount: activeUser.rejectionsCount + (action === 'Rejected' ? 1 : 0),
      rank: newRank.label
    });
  };

  const updateSubmissionStatus = (id: string, status: SubmissionStatus, comment?: string) => {
    const sub = submissions.find(s => s.id === id);
    if (!sub) return;

    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status, adminComment: comment } : s));
    
    // Trigger Trust Workflow if manual action
    if (status === SubmissionStatus.APPROVED || status === SubmissionStatus.REJECTED) {
      updateUserOnAction(sub.contributorId, status === SubmissionStatus.APPROVED ? 'Approved' : 'Rejected', sub.deviationFromMedian, sub.hasPhoto, sub.pointsEarned);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-indigo-100 overflow-x-hidden">
      <Navbar 
        user={activeUser} 
        onLogout={logout} 
        onRoleSwitch={loginAs}
        onGoHome={() => setView('landing')}
      />

      {/* Global Toast for Workflow Actions */}
      {lastSystemAction && (
        <div className="fixed top-24 right-4 z-[100] animate-in slide-in-from-right-8 fade-in duration-300">
           <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/10 backdrop-blur-xl">
              <i className="fa-solid fa-circle-info text-indigo-400"></i>
              <p className="text-xs font-black uppercase tracking-widest">{lastSystemAction}</p>
              <button onClick={() => setLastSystemAction(null)} className="ml-4 text-slate-500 hover:text-white transition">
                <i className="fa-solid fa-xmark"></i>
              </button>
           </div>
        </div>
      )}
      
      <main className="flex-grow container mx-auto px-4 py-6 max-w-7xl">
        {view === 'landing' && (
          <LandingPage 
            onLogin={loginAs} 
            submissions={submissions} 
            onViewProduct={handleViewProduct}
          />
        )}
        
        {view === 'productDetail' && selectedProductCriteria && (
          <ProductDetailPage 
            criteria={selectedProductCriteria}
            submissions={submissions}
            onBack={() => setView('landing')}
            onLoginContributor={() => loginAs(UserRole.CONTRIBUTOR)}
          />
        )}

        {view === 'portal' && (
          <>
            {activeUser?.role === UserRole.CONTRIBUTOR && (
              <ContributorPortal 
                user={activeUser} 
                submissions={submissions} 
                onSubmit={addSubmission} 
                onUpdateUser={handleUpdateUser}
              />
            )}
            {activeUser?.role === UserRole.ADMIN && (
              <AdminPortal 
                submissions={submissions} 
                onUpdateStatus={updateSubmissionStatus} 
              />
            )}
            {activeUser?.role === UserRole.B2B && (
              <B2BPortal submissions={submissions} />
            )}
          </>
        )}
      </main>

      <footer className="bg-slate-900 text-slate-400 py-12 px-4 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-white">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <i className="fa-solid fa-chart-line"></i>
              </div>
              <span className="font-bold text-xl tracking-tight cursor-pointer" onClick={() => setView('landing')}>SokoMetrics</span>
            </div>
            <p className="text-sm max-w-xs leading-relaxed">
              Resilience-first data platform for East Africa. Empowering builders and farmers with crowdsourced market clarity.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-12">
            <div className="space-y-4">
              <h4 className="text-white font-black uppercase text-[10px] tracking-widest">Platform</h4>
              <ul className="text-sm space-y-2 font-medium">
                <li><a href="#" className="hover:text-indigo-400">Construction</a></li>
                <li><a href="#" className="hover:text-indigo-400">Agricultural</a></li>
                <li><a href="#" className="hover:text-indigo-400">Regional Data</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-white font-black uppercase text-[10px] tracking-widest">Trust</h4>
              <ul className="text-sm space-y-2 font-medium">
                <li><a href="#" className="hover:text-indigo-400">Score Logic</a></li>
                <li><a href="#" className="hover:text-indigo-400">Verification</a></li>
                <li><a href="#" className="hover:text-indigo-400">Support</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto border-t border-slate-800 mt-12 pt-8 text-center md:text-left">
          <p className="text-xs opacity-50">&copy; 2026 SokoMetrics MVP. Regional Price Intelligence Layer.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
