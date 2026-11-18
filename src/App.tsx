import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, ArrowRight, Search, FileEdit, Clock, ShieldCheck,
  Users, CheckCircle2, Target, Globe, Sun, Moon, User, Check,
  Building2, Droplets, Zap, Trees, Cpu, MapPin, Upload,
  SlidersHorizontal, Star, PhoneCall, Mail, ChevronDown,
  X, ThumbsUp, Layers, FileText, HelpCircle, Menu, RotateCcw,
  Image as ImageIcon, Send, AlertCircle
} from 'lucide-react';
import { translations, type Language } from './i18n/translations';

// ==========================================
// DATA TYPES
// ==========================================
interface Grievance {
  id: string;
  title: string;
  description: string;
  location: string;
  category?: string;
  department: 'Public Works (PWD)' | 'Water & Sanitation' | 'Electricity' | 'Municipal Services';
  authorityCode: 'Authority A' | 'Authority B' | 'Authority C' | 'Authority D';
  status: 'Submitted' | 'In Progress' | 'Resolved';
  createdAt: string;
  upvotes: number;
  metrics: {
    priority: number;
    duration: number;
    urgency: number;
    feasibility: number;
    coreScore: number;
  };
}

interface BackendComplaint {
  id: string;
  tracking_id: string;
  title: string;
  description: string;
  location: string;
  category?: string;
  department?: string;
  status?: string;
  upvotes?: number;
  created_at?: string;
  updated_at?: string;
}

const API_BASE_URL = 'http://localhost:5000/api';

const evaluateAiMetrics = (title: string, desc: string, deptInput?: string) => {
  const text = `${title} ${desc}`.toLowerCase();
  let category: string;
  let department: Grievance['department'];
  let authorityCode: Grievance['authorityCode'];
  let priority = 9.7;
  let duration = 10.0;
  let urgency = 5.0;
  let feasibility = 10.0;

  if (deptInput === 'Water & Sanitation' || text.includes('water') || text.includes('pipe') || text.includes('sewage') || text.includes('leak') || text.includes('drain')) {
    department = 'Water & Sanitation';
    authorityCode = 'Authority B';
    priority = 8.8;
    duration = 8.2;
    urgency = 8.4;
    feasibility = 7.9;
    category = (text.includes('sewage') || text.includes('drain')) ? 'Sewage & Drainage' : 'Water Supply';
  } else if (deptInput === 'Electricity' || text.includes('light') || text.includes('electric') || text.includes('power') || text.includes('wire') || text.includes('transformer') || text.includes('pole')) {
    department = 'Electricity';
    authorityCode = 'Authority C';
    priority = 9.4;
    duration = 6.5;
    urgency = 9.2;
    feasibility = 8.8;
    category = (text.includes('light') || text.includes('pole') || text.includes('lamp')) ? 'Street Lights' : 'Electricity & Power Grid';
  } else if (deptInput === 'Municipal Services' || text.includes('garbage') || text.includes('trash') || text.includes('waste') || text.includes('clean') || text.includes('park')) {
    department = 'Municipal Services';
    authorityCode = 'Authority D';
    priority = 6.9;
    duration = 7.9;
    urgency = 7.4;
    feasibility = 9.5;
    if (text.includes('park')) {
      category = 'Parks & Public Spaces';
    } else if (text.includes('clean')) {
      category = 'Public Cleanliness';
    } else {
      category = 'Garbage & Waste Management';
    }
  } else {
    department = 'Public Works (PWD)';
    authorityCode = 'Authority A';
    category = 'Roads & Infrastructure';
  }

  const coreScore = Number(((priority * 0.35) + (urgency * 0.25) + (duration * 0.2) + (feasibility * 0.2)).toFixed(1));
  return { category, department, authorityCode, priority, duration, urgency, feasibility, coreScore };
};

const formatTimeAgo = (isoString?: string): string => {
  if (!isoString) return 'Just now';
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } catch {
    return 'Recently';
  }
};

const normalizeDepartment = (dept?: string): Grievance['department'] | undefined => {
  if (!dept) return undefined;
  const trimmed = dept.trim();
  if (trimmed === 'Water and Sanitation' || trimmed.toLowerCase() === 'water and sanitation' || trimmed === 'Water & Sanitation') {
    return 'Water & Sanitation';
  }
  if (trimmed === 'Electricity') return 'Electricity';
  if (trimmed === 'Municipal Services') return 'Municipal Services';
  if (trimmed === 'Public Works (PWD)') return 'Public Works (PWD)';
  return undefined;
};

const mapBackendComplaintToGrievance = (c: BackendComplaint): Grievance => {
  const normalizedDept = normalizeDepartment(c.department);
  const analysis = evaluateAiMetrics(c.title, c.description, normalizedDept || c.category);
  const dept = normalizedDept || analysis.department;

  let authorityCode: Grievance['authorityCode'] = 'Authority A';
  if (dept === 'Water & Sanitation') authorityCode = 'Authority B';
  else if (dept === 'Electricity') authorityCode = 'Authority C';
  else if (dept === 'Municipal Services') authorityCode = 'Authority D';

  const status: Grievance['status'] =
    c.status === 'In Progress'
      ? 'In Progress'
      : c.status === 'Resolved'
      ? 'Resolved'
      : 'Submitted';

  return {
    id: c.tracking_id || c.id,
    title: c.title,
    description: c.description,
    location: c.location,
    category: c.category || analysis.category,
    department: dept,
    authorityCode,
    status,
    createdAt: formatTimeAgo(c.created_at),
    upvotes: typeof c.upvotes === 'number' ? c.upvotes : 0,
    metrics: {
      priority: analysis.priority,
      duration: analysis.duration,
      urgency: analysis.urgency,
      feasibility: analysis.feasibility,
      coreScore: analysis.coreScore,
    },
  };
};

const STAR_GRADES = [
  {
    key: 'priority' as const,
    labelKey: 'starPriority' as const,
    desc: 'Critical public impact',
    starClass: 'text-red-500 fill-red-500',
    pillActive: 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-800 dark:text-red-300',
  },
  {
    key: 'duration' as const,
    labelKey: 'starDuration' as const,
    desc: 'Long-standing issue',
    starClass: 'text-pink-500 fill-pink-500',
    pillActive: 'bg-pink-50 dark:bg-pink-950/40 border-pink-300 dark:border-pink-800 text-pink-800 dark:text-pink-300',
  },
  {
    key: 'urgency' as const,
    labelKey: 'starUrgency' as const,
    desc: 'Immediate action needed',
    starClass: 'text-orange-500 fill-orange-500',
    pillActive: 'bg-orange-50 dark:bg-orange-950/40 border-orange-300 dark:border-orange-800 text-orange-800 dark:text-orange-300',
  },
  {
    key: 'feasibility' as const,
    labelKey: 'starFeasibility' as const,
    desc: 'High resolution readiness',
    starClass: 'text-emerald-500 fill-emerald-500',
    pillActive: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300',
  },
];

const CATEGORY_OPTIONS = [
  'All',
  'Water Supply',
  'Sewage & Drainage',
  'Street Lights',
  'Electricity & Power Grid',
  'Roads & Infrastructure',
  'Garbage & Waste Management',
  'Parks & Public Spaces',
  'Public Cleanliness',
];

export default function App() {
  // Navigation & Language & Theme State
  const [activeTab, setActiveTab] = useState<'home' | 'report' | 'track' | 'help'>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('getitresolved_lang');
    return saved === 'HI' ? 'HI' : 'EN';
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('getitresolved_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [hoveredDept, setHoveredDept] = useState<number | null>(null);

  // Apply Theme & Lang Persistence
  useEffect(() => {
    localStorage.setItem('getitresolved_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('getitresolved_theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Keyboard Escape Listener for Modals and Drawers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedGrievance) setSelectedGrievance(null);
        if (isLoginOpen) setIsLoginOpen(false);
        if (isMobileMenuOpen) setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedGrievance, isLoginOpen, isMobileMenuOpen]);

  const t = translations[lang];

  // Grievances Data & Backend Pagination State
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [isLoadingGrievances, setIsLoadingGrievances] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Track Page Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('All');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');
  const [activeStarFilters, setActiveStarFilters] = useState<string[]>([]);

  // Pagination parameters
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_LIMIT = 10;

  // Search Debounce Effect (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch Grievances from Backend with search, department, category, status, and pagination
  useEffect(() => {
    let ignore = false;
    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('limit', String(PAGE_LIMIT));

    if (debouncedSearchQuery.trim()) {
      params.set('search', debouncedSearchQuery.trim());
    }
    if (selectedDeptFilter && selectedDeptFilter !== 'All') {
      params.set('department', selectedDeptFilter);
    }
    if (selectedCategoryFilter && selectedCategoryFilter !== 'All') {
      params.set('category', selectedCategoryFilter);
    }
    if (selectedStatusFilter && selectedStatusFilter !== 'All') {
      params.set('status', selectedStatusFilter);
    }

    fetch(`${API_BASE_URL}/complaints?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!ignore) {
          if (data.success && Array.isArray(data.complaints)) {
            const mapped = data.complaints.map(mapBackendComplaintToGrievance);
            setTotalRecords(typeof data.totalRecords === 'number' ? data.totalRecords : mapped.length);
            setTotalPages(typeof data.totalPages === 'number' ? data.totalPages : 1);
            setPage(1);
            setGrievances(mapped);
          } else {
            throw new Error(data.message || 'Failed to fetch complaints');
          }
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : 'Unable to connect to backend server';
          console.error('Error fetching complaints:', err);
          setFetchError(msg);
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoadingGrievances(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [debouncedSearchQuery, selectedDeptFilter, selectedCategoryFilter, selectedStatusFilter]);

  // Retry loading complaints
  const refetchComplaints = useCallback(() => {
    setIsLoadingGrievances(true);
    setFetchError(null);
    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('limit', String(PAGE_LIMIT));

    if (debouncedSearchQuery.trim()) params.set('search', debouncedSearchQuery.trim());
    if (selectedDeptFilter && selectedDeptFilter !== 'All') params.set('department', selectedDeptFilter);
    if (selectedCategoryFilter && selectedCategoryFilter !== 'All') params.set('category', selectedCategoryFilter);
    if (selectedStatusFilter && selectedStatusFilter !== 'All') params.set('status', selectedStatusFilter);

    fetch(`${API_BASE_URL}/complaints?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.success && Array.isArray(data.complaints)) {
          const mapped = data.complaints.map(mapBackendComplaintToGrievance);
          setTotalRecords(typeof data.totalRecords === 'number' ? data.totalRecords : mapped.length);
          setTotalPages(typeof data.totalPages === 'number' ? data.totalPages : 1);
          setPage(1);
          setGrievances(mapped);
        } else {
          throw new Error(data.message || 'Failed to fetch complaints');
        }
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Unable to connect to backend server';
        console.error('Error fetching complaints:', err);
        setFetchError(msg);
      })
      .finally(() => {
        setIsLoadingGrievances(false);
      });
  }, [debouncedSearchQuery, selectedDeptFilter, selectedCategoryFilter, selectedStatusFilter]);

  // Handle Load More pagination
  const handleLoadMore = async () => {
    if (isLoadingMore || page >= totalPages) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;

    try {
      const params = new URLSearchParams();
      params.set('page', String(nextPage));
      params.set('limit', String(PAGE_LIMIT));

      if (debouncedSearchQuery.trim()) params.set('search', debouncedSearchQuery.trim());
      if (selectedDeptFilter && selectedDeptFilter !== 'All') params.set('department', selectedDeptFilter);
      if (selectedCategoryFilter && selectedCategoryFilter !== 'All') params.set('category', selectedCategoryFilter);
      if (selectedStatusFilter && selectedStatusFilter !== 'All') params.set('status', selectedStatusFilter);

      const res = await fetch(`${API_BASE_URL}/complaints?${params.toString()}`);
      if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.complaints)) {
        const mapped = data.complaints.map(mapBackendComplaintToGrievance);
        setPage(nextPage);
        setGrievances((prev) => {
          const ids = new Set(prev.map((g) => g.id));
          return [...prev, ...mapped.filter((g: Grievance) => !ids.has(g.id))];
        });
      }
    } catch (err) {
      console.error('Error loading more complaints:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Derived Real Dashboard Statistics
  const dashboardStats = useMemo(() => {
    const total = totalRecords || grievances.length;
    const resolved = grievances.filter((g) => g.status === 'Resolved').length;
    const inProgress = grievances.filter((g) => g.status === 'In Progress').length;
    const resolutionRate = total > 0 ? `${Math.round((resolved / total) * 100)}%` : '0%';
    return { total, resolved, inProgress, resolutionRate };
  }, [totalRecords, grievances]);

  // Report Form Wizard State (Steps 1, 2, 3)
  const [reportStep, setReportStep] = useState<1 | 2 | 3>(1);
  const [reportTitle, setReportTitle] = useState('');
  const [reportLocation, setReportLocation] = useState('Sector 17, Near City Park, Bhopal, MP');
  const [reportDesc, setReportDesc] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stepError, setStepError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedTicket, setSubmittedTicket] = useState<Grievance | null>(null);

  // Photo Attachment Handler
  const handlePhotoSelect = (file: File) => {
    setPhotoError(null);
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setPhotoError(t.photoTypeError);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError(t.photoSizeError);
      return;
    }
    setSelectedPhoto(file);
    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);
  };

  const handlePhotoRemove = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setSelectedPhoto(null);
    setPhotoPreview(null);
    setPhotoError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Real-time Keyword-Based Routing Simulator
  const liveAiPreview = useMemo(() => {
    return evaluateAiMetrics(reportTitle, reportDesc);
  }, [reportTitle, reportDesc]);

  // Wizard Step Navigation Validations
  const goToStep2 = () => {
    setStepError(null);
    if (!reportTitle.trim() || reportTitle.trim().length < 3) {
      setStepError(t.errTitleRequired);
      return;
    }
    if (!reportDesc.trim() || reportDesc.trim().length < 10) {
      setStepError(t.errDescRequired);
      return;
    }
    setReportStep(2);
  };

  const goToStep3 = () => {
    setStepError(null);
    if (!reportLocation.trim() || reportLocation.trim().length < 3) {
      setStepError(t.errLocationRequired);
      return;
    }
    setReportStep(3);
  };

  // Final Grievance Submit (Calls POST /api/complaints)
  const handleGrievanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const trimmedTitle = reportTitle.trim();
    const trimmedLocation = reportLocation.trim();
    const trimmedDesc = reportDesc.trim();

    if (!trimmedTitle || !trimmedLocation || !trimmedDesc) {
      setSubmitError(t.errFillRequired);
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await fetch(`${API_BASE_URL}/complaints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: trimmedTitle,
          description: trimmedDesc,
          location: trimmedLocation,
          category: liveAiPreview.category,
          department: liveAiPreview.department,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success || !result.complaint) {
        throw new Error(result.message || 'Failed to submit grievance');
      }

      const saved = result.complaint;
      const newTicket: Grievance = {
        id: result.tracking_id || saved.tracking_id,
        title: saved.title,
        description: saved.description,
        location: saved.location,
        category: saved.category || liveAiPreview.category,
        department: normalizeDepartment(saved.department) || liveAiPreview.department,
        authorityCode: liveAiPreview.authorityCode,
        status: (saved.status === 'Pending' ? 'Submitted' : saved.status) as Grievance['status'],
        createdAt: 'Just now',
        upvotes: typeof saved.upvotes === 'number' ? saved.upvotes : 0,
        metrics: {
          priority: liveAiPreview.priority,
          duration: liveAiPreview.duration,
          urgency: liveAiPreview.urgency,
          feasibility: liveAiPreview.feasibility,
          coreScore: liveAiPreview.coreScore,
        },
      };

      setGrievances((prev) => [newTicket, ...prev]);
      setTotalRecords((prev) => prev + 1);
      setSubmittedTicket(newTicket);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect to backend server.';
      console.error('Error submitting complaint:', err);
      setSubmitError(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Help & Support Feedback Form State
  const [fbName, setFbName] = useState('');
  const [fbContact, setFbContact] = useState('');
  const [fbType, setFbType] = useState('bug');
  const [fbMessage, setFbMessage] = useState('');
  const [fbStatus, setFbStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [fbErrorMsg, setFbErrorMsg] = useState('');

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFbErrorMsg('');
    if (!fbContact.trim() || !fbMessage.trim() || fbMessage.trim().length < 10) {
      setFbStatus('error');
      setFbErrorMsg(t.fbErrRequired);
      return;
    }
    setFbStatus('success');
    setFbName('');
    setFbContact('');
    setFbMessage('');
  };

  // Filter Grievances by active star grades
  const filteredGrievances = useMemo(() => {
    if (activeStarFilters.length === 0) return grievances;
    return grievances.filter((item) => {
      return activeStarFilters.every(
        (starKey) => item.metrics[starKey as keyof typeof item.metrics] > 7
      );
    });
  }, [grievances, activeStarFilters]);

  const toggleStarFilter = (key: string) => {
    setActiveStarFilters((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const hasMore = page < totalPages;

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f8ff] dark:bg-[#081120] text-[#0d1e3a] dark:text-[#e2eafc] relative overflow-x-hidden transition-colors duration-200">
      
      {/* ==================== TOP NAVIGATION HEADER ==================== */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0c182d]/95 backdrop-blur-md border-b border-[#e4ecf7] dark:border-[#1e3256] px-4 sm:px-6 lg:px-14 py-3 shadow-[0_2px_12px_rgba(13,30,58,0.03)] transition-colors">
        <div className="max-w-[1320px] mx-auto flex items-center justify-between gap-4">
          
          {/* Left: Emblem & Title */}
          <div
            onClick={() => {
              setActiveTab('home');
              setIsMobileMenuOpen(false);
            }}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setActiveTab('home');
                setIsMobileMenuOpen(false);
              }
            }}
            aria-label={`${t.portalName} Home`}
            className="flex items-center gap-3 cursor-pointer group outline-none"
          >
            <div className="w-9 h-12 flex items-center justify-center shrink-0 pr-1">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
                alt="State Emblem of India"
                className="w-full h-full object-contain"
              />
            </div>

            <div>
              <p className="text-[11px] font-medium text-[#4a5e7d] dark:text-[#8ea2c4] leading-tight">
                {t.govTitle}
              </p>
              <h1 className="text-[18px] sm:text-[19px] font-extrabold tracking-tight text-[#0b1b36] dark:text-white leading-snug">
                {t.portalName}
              </h1>
              <p className="hidden sm:block text-[11px] font-medium text-[#5a6f8e] dark:text-[#7d93b8] leading-tight">
                {t.portalSub}
              </p>
            </div>
          </div>

          {/* Center: Desktop Navigation Tabs */}
          <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-2">
            {[
              { id: 'home', label: t.navHome },
              { id: 'report', label: t.navReport },
              { id: 'track', label: t.navTrack },
              { id: 'help', label: t.navHelp },
            ].map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as typeof activeTab);
                    if (item.id === 'report') setSubmittedTicket(null);
                  }}
                  className={`px-4 py-2 rounded-xl text-[13.5px] font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#dceaff] dark:bg-[#1a3869] text-[#124699] dark:text-[#7bb1ff]'
                      : 'text-[#1c2e4a] dark:text-[#c4d5f2] hover:bg-[#f0f5ff] dark:hover:bg-[#122340] hover:text-[#124699] dark:hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Language, Theme & Citizen Modal & Hamburger */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'EN' ? 'HI' : 'EN')}
              aria-label={`Switch Language. Current: ${lang === 'EN' ? 'English' : 'Hindi'}`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#d8e3f2] dark:border-[#22395d] bg-white dark:bg-[#11213b] text-xs font-semibold text-[#1c2e4a] dark:text-[#d3e2f8] hover:border-[#b5cae8] dark:hover:border-[#385c94] transition cursor-pointer shadow-2xs"
            >
              <Globe size={14} className="text-[#3b5275] dark:text-[#7ea4dd]" />
              <span>{lang === 'EN' ? 'हिन्दी' : 'English'}</span>
            </button>

            {/* Dark / Light Mode Switcher */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label={theme === 'dark' ? t.themeToggleLight : t.themeToggleDark}
              title={theme === 'dark' ? t.themeToggleLight : t.themeToggleDark}
              className="w-9 h-9 rounded-xl border border-[#d8e3f2] dark:border-[#22395d] bg-white dark:bg-[#11213b] flex items-center justify-center text-[#1c2e4a] dark:text-[#d3e2f8] hover:border-[#b5cae8] dark:hover:border-[#385c94] transition cursor-pointer shadow-2xs"
            >
              {theme === 'dark' ? (
                <Sun size={16} className="text-amber-400" />
              ) : (
                <Moon size={16} className="text-[#132c59]" />
              )}
            </button>

            {/* Citizen Portal Action Button */}
            <button
              onClick={() => setIsLoginOpen(true)}
              aria-label={t.loginBtn}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-[#132c59] dark:bg-[#1b4382] hover:bg-[#0d2042] dark:hover:bg-[#153468] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <User size={14} />
              <span>{t.loginBtn}</span>
            </button>

            {/* Hamburger Menu Toggle (Below 768px) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={t.menuToggle}
              aria-expanded={isMobileMenuOpen}
              className="md:hidden w-9 h-9 rounded-xl border border-[#d8e3f2] dark:border-[#22395d] bg-white dark:bg-[#11213b] flex items-center justify-center text-[#1c2e4a] dark:text-[#d3e2f8] transition cursor-pointer"
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              role="dialog"
              aria-modal="true"
              aria-label="Mobile Navigation"
              className="md:hidden overflow-hidden border-t border-[#e4ecf7] dark:border-[#1e3256] mt-3 pt-3 pb-2 space-y-1.5"
            >
              {[
                { id: 'home', label: t.navHome },
                { id: 'report', label: t.navReport },
                { id: 'track', label: t.navTrack },
                { id: 'help', label: t.navHelp },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as typeof activeTab);
                    setIsMobileMenuOpen(false);
                    if (item.id === 'report') setSubmittedTicket(null);
                  }}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
                    activeTab === item.id
                      ? 'bg-[#dceaff] dark:bg-[#1a3869] text-[#124699] dark:text-[#7bb1ff]'
                      : 'text-[#1c2e4a] dark:text-[#c4d5f2] hover:bg-[#f0f5ff] dark:hover:bg-[#122340]'
                  }`}
                >
                  {item.label}
                </button>
              ))}

              <div className="pt-2">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsLoginOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#132c59] dark:bg-[#1b4382] text-white text-xs font-semibold cursor-pointer"
                >
                  <User size={14} />
                  <span>{t.loginBtn}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ==================== MAIN PAGE ROUTING ==================== */}
      <main className="flex-1 relative z-10">
        <AnimatePresence mode="wait">
          
          {/* =========================================================
              PAGE 1: HOME PAGE
             ========================================================= */}
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {/* Hero Section */}
              <section className="relative overflow-hidden pt-6 pb-9 px-4 sm:px-6 lg:px-14">
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="absolute -top-24 right-[-8%] w-[68%] h-[135%] rounded-l-full bg-gradient-to-br from-[#d9ebff]/80 dark:from-[#132b52]/50 via-[#b3d7ff]/60 dark:via-[#0e213f]/40 to-[#7cb8ff]/40 dark:to-transparent" />
                  <div className="absolute -top-10 right-[-5%] w-[52%] h-[120%] rounded-l-full bg-gradient-to-b from-[#99cbff]/60 dark:from-[#163566]/40 via-[#c8e2ff]/40 dark:via-transparent to-transparent" />
                </div>

                <div className="max-w-[1320px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
                  {/* Left Column */}
                  <div className="lg:col-span-5 space-y-4 pr-2">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#dceaff] dark:bg-[#17325c] border border-[#c4dcff] dark:border-[#214782] text-[#11428f] dark:text-[#8dbaff] text-xs font-semibold shadow-2xs">
                      <Sparkles size={13} className="fill-[#124699] text-[#124699] dark:fill-[#8dbaff] dark:text-[#8dbaff]" />
                      <span>{t.heroBadge}</span>
                    </div>

                    <h2 className="text-[36px] sm:text-[46px] font-extrabold tracking-tight text-[#0b1b36] dark:text-white leading-[1.12]">
                      {t.heroTitle1}
                      <br />
                      {t.heroTitle2}
                    </h2>

                    <p className="text-[#374b6b] dark:text-[#9db3d4] text-[15px] sm:text-[16px] leading-relaxed font-normal max-w-[490px]">
                      {t.heroSub}
                    </p>

                    <div className="flex flex-wrap items-center gap-3.5 pt-2">
                      <button
                        onClick={() => {
                          setSubmittedTicket(null);
                          setReportStep(1);
                          setActiveTab('report');
                        }}
                        className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#0d3f8c] via-[#134da6] to-[#195ec7] hover:from-[#093270] hover:to-[#12499e] text-white font-bold text-sm flex items-center gap-2.5 shadow-[0_10px_25px_rgba(19,77,166,0.28)] hover:-translate-y-0.5 transition-all cursor-pointer"
                      >
                        <span>{t.btnReport}</span>
                        <ArrowRight size={17} />
                      </button>

                      <button
                        onClick={() => setActiveTab('track')}
                        className="px-6 py-3.5 rounded-2xl bg-white dark:bg-[#11213b] hover:bg-[#f8faff] dark:hover:bg-[#172b4c] text-[#0b1b36] dark:text-white border border-[#d0dff2] dark:border-[#233d66] font-bold text-sm flex items-center gap-2.5 shadow-[0_6px_18px_rgba(13,30,58,0.05)] hover:-translate-y-0.5 transition-all cursor-pointer"
                      >
                        <Search size={16} className="text-[#124699] dark:text-[#6fa8ff]" strokeWidth={2.4} />
                        <span>{t.btnTrack}</span>
                      </button>
                    </div>
                  </div>

                  {/* Right Column: AI Routing Illustration */}
                  <div className="lg:col-span-7 relative min-h-[350px] flex items-center">
                    <div className="absolute -right-6 bottom-[-28px] top-[-15px] w-[66%] pointer-events-none hidden sm:block overflow-hidden rounded-l-[40px] opacity-90 dark:opacity-40">
                      <img
                        src="https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=1400&auto=format&fit=crop"
                        alt="Government Secretariat"
                        className="w-full h-full object-cover object-center"
                        style={{
                          maskImage: 'linear-gradient(to right, transparent 2%, black 38%)',
                          WebkitMaskImage: 'linear-gradient(to right, transparent 2%, black 38%)',
                        }}
                      />
                    </div>

                    <div className="relative z-20 flex flex-col sm:flex-row items-center w-full pl-0 lg:pl-2">
                      {/* Routing Card */}
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-[240px] bg-white/95 dark:bg-[#11213b]/95 backdrop-blur-md rounded-[22px] p-5 shadow-[0_14px_34px_rgba(15,55,120,0.10)] border border-white dark:border-[#22395d] shrink-0"
                      >
                        <div className="flex items-center gap-2.5 mb-4">
                          <div className="w-8 h-8 rounded-xl bg-[#ebf3ff] dark:bg-[#1b3459] border border-[#cde0ff] dark:border-[#264b82] flex items-center justify-center text-[#1554c0] dark:text-[#7bb1ff]">
                            <Cpu size={18} />
                          </div>
                          <h3 className="font-extrabold text-[15px] text-[#0b1b36] dark:text-white">
                            {t.aiRoutingTitle}
                          </h3>
                        </div>

                        <div className="divide-y divide-[#edf2fa] dark:divide-[#1c3052] text-xs font-medium text-[#2c3f5e] dark:text-[#a6bee3]">
                          {[t.aiStep1, t.aiStep2, t.aiStep3].map((step, i) => (
                            <div key={i} className="py-2.5 first:pt-1 last:pb-1 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#d3e2f8] dark:bg-[#28497d]" />
                                <span>{step}</span>
                              </div>
                              <Check size={13} className="text-[#1554c0] dark:text-[#6fa8ff] shrink-0 stroke-[2.6]" />
                            </div>
                          ))}
                        </div>
                      </motion.div>

                      {/* Smooth SVG Connectors */}
                      <svg
                        className="hidden sm:block w-[72px] h-[210px] shrink-0 -mx-1 z-10"
                        viewBox="0 0 72 210"
                        fill="none"
                      >
                        {[
                          { d: 'M 0 105 C 36 105, 32 24, 72 24', idx: 0 },
                          { d: 'M 0 105 C 30 105, 36 78, 72 78', idx: 1 },
                          { d: 'M 0 105 C 30 105, 36 132, 72 132', idx: 2 },
                          { d: 'M 0 105 C 36 105, 32 186, 72 186', idx: 3 },
                        ].map((curve) => (
                          <path
                            key={curve.idx}
                            d={curve.d}
                            stroke={hoveredDept === curve.idx ? '#1554c0' : theme === 'dark' ? '#2e4975' : '#ffffff'}
                            strokeWidth={hoveredDept === curve.idx ? '2.8' : '2.2'}
                            className="transition-all duration-200 drop-shadow-2xs"
                          />
                        ))}
                        <circle cx="4" cy="105" r="4" fill="#9ec5ff" stroke="#ffffff" strokeWidth="1.5" />
                      </svg>

                      {/* 4 Departments Quick-Links */}
                      <div className="flex flex-col gap-2.5 mt-4 sm:mt-0">
                        {[
                          { label: 'Public Works (PWD)', trKey: 'deptPWD', icon: Building2, badgeBg: 'bg-[#e6ecff] dark:bg-[#1a2f63] text-[#2b4acb] dark:text-[#91a8ff]' },
                          { label: 'Water & Sanitation', trKey: 'deptWater', icon: Droplets, badgeBg: 'bg-[#e0f2fe] dark:bg-[#0c3757] text-[#0284c7] dark:text-[#67c4fa]' },
                          { label: 'Electricity', trKey: 'deptElectricity', icon: Zap, badgeBg: 'bg-[#fef3c7] dark:bg-[#453106] text-[#d97706] dark:text-[#f8be43]' },
                          { label: 'Municipal Services', trKey: 'deptMunicipal', icon: Trees, badgeBg: 'bg-[#dcfce7] dark:bg-[#0e3b1f] text-[#16a34a] dark:text-[#6de69b]' },
                        ].map((dept, i) => (
                          <motion.button
                            key={dept.label}
                            onMouseEnter={() => setHoveredDept(i)}
                            onMouseLeave={() => setHoveredDept(null)}
                            onClick={() => {
                              setSelectedDeptFilter(dept.label);
                              setActiveTab('track');
                            }}
                            whileHover={{ x: 4 }}
                            className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-white/95 dark:bg-[#11213b]/95 backdrop-blur-md shadow-[0_8px_20px_rgba(13,30,58,0.08)] border border-white dark:border-[#22395d] hover:border-[#b5d1ff] dark:hover:border-[#385c94] transition-all cursor-pointer text-left w-[205px]"
                          >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${dept.badgeBg}`}>
                              <dept.icon size={13} strokeWidth={2.2} />
                            </div>
                            <span className="text-xs font-bold text-[#0b1b36] dark:text-white truncate">
                              {t[dept.trKey as keyof typeof t] as string}
                            </span>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* 4 Feature Cards */}
              <section className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-14 mb-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { icon: FileEdit, title: t.feat1Title, desc: t.feat1Desc, tab: 'report' },
                    { icon: Sparkles, title: t.feat2Title, desc: t.feat2Desc, tab: 'help' },
                    { icon: Clock, title: t.feat3Title, desc: t.feat3Desc, tab: 'track' },
                    { icon: ShieldCheck, title: t.feat4Title, desc: t.feat4Desc, tab: 'help' },
                  ].map((feat, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActiveTab(feat.tab as typeof activeTab)}
                      tabIndex={0}
                      role="button"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') setActiveTab(feat.tab as typeof activeTab);
                      }}
                      className="bg-white dark:bg-[#0f1f38] rounded-2xl p-5 border border-[#e3ecf8] dark:border-[#1b3154] shadow-[0_4px_14px_rgba(13,30,58,0.03)] hover:shadow-[0_8px_24px_rgba(18,70,153,0.08)] hover:border-[#c6dbf7] dark:hover:border-[#2d4e82] transition-all flex items-start gap-3.5 cursor-pointer outline-none"
                    >
                      <div className="w-11 h-11 rounded-2xl bg-[#eaf2ff] dark:bg-[#1a345c] flex items-center justify-center text-[#1554c0] dark:text-[#7bb1ff] shrink-0">
                        <feat.icon size={20} strokeWidth={2} />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-[#0b1b36] dark:text-white mb-1">
                          {feat.title}
                        </h3>
                        <p className="text-xs text-[#4a5e7d] dark:text-[#8ea2c4] leading-snug">
                          {feat.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* REAL LIVE DASHBOARD METRICS BANNER */}
              <section className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-14 mb-4">
                <div className="bg-white dark:bg-[#0f1f38] rounded-2xl py-5 px-6 border border-[#e3ecf8] dark:border-[#1b3154] shadow-[0_4px_14px_rgba(13,30,58,0.03)]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-[#edf2fa] dark:border-[#192f52] gap-2">
                    <div className="flex items-center gap-2">
                      <Target size={15} className="text-[#124699] dark:text-[#6fa8ff]" />
                      <span className="text-xs font-extrabold text-[#0b1b36] dark:text-white">
                        {t.liveDbNotice}
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-[#5a6f8e] dark:text-[#7d93b8]">
                      {isLoadingGrievances ? t.connectingDb : `${dashboardStats.total} ${t.recordsLabel}`}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#e4ecf7] dark:divide-[#192f52] gap-y-3">
                    {[
                      { icon: Users, value: String(dashboardStats.total), label: t.statTotal, color: 'text-[#1554c0] dark:text-[#7bb1ff]' },
                      { icon: CheckCircle2, value: String(dashboardStats.resolved), label: t.statResolved, color: 'text-[#16a34a] dark:text-[#4ade80]' },
                      { icon: Clock, value: String(dashboardStats.inProgress), label: t.statInProgress, color: 'text-[#d97706] dark:text-[#fbbf24]' },
                      { icon: Target, value: dashboardStats.resolutionRate, label: t.statResolutionRate, color: 'text-[#124699] dark:text-[#6fa8ff]' },
                    ].map((stat, idx) => (
                      <div key={idx} className="flex items-center gap-3.5 px-3 sm:px-6 py-1 first:pl-0">
                        <div className={`${stat.color} shrink-0`}>
                          <stat.icon size={28} strokeWidth={2} />
                        </div>
                        <div>
                          <p className="text-2xl font-black text-[#0b1b36] dark:text-white leading-tight">
                            {stat.value}
                          </p>
                          <p className="text-xs font-semibold text-[#4a5e7d] dark:text-[#8ea2c4]">
                            {stat.label}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {/* =========================================================
              PAGE 2: REPORT ISSUE (PROGRESSIVE 3-STEP FORM WIZARD)
             ========================================================= */}
          {activeTab === 'report' && (
            <motion.div
              key="report"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-14 py-8"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#dceaff] dark:bg-[#1a3869] text-[#124699] dark:text-[#7bb1ff] text-xs font-bold mb-2">
                    <Sparkles size={13} />
                    <span>{t.reportPageBadge}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0b1b36] dark:text-white">
                    {t.reportPageTitle}
                  </h2>
                </div>

                {/* 3-Step Wizard Progress Tabs */}
                <div className="flex items-center gap-1.5 bg-white dark:bg-[#0f1f38] p-1.5 rounded-2xl border border-[#e3ecf8] dark:border-[#1b3154]">
                  {[
                    { step: 1, label: t.step1Tab },
                    { step: 2, label: t.step2Tab },
                    { step: 3, label: t.step3Tab },
                  ].map((s) => (
                    <button
                      key={s.step}
                      type="button"
                      onClick={() => {
                        if (s.step === 1) setReportStep(1);
                        else if (s.step === 2) goToStep2();
                        else if (s.step === 3) {
                          if (!reportTitle.trim() || !reportDesc.trim()) setStepError(t.errFillRequired);
                          else if (!reportLocation.trim()) setStepError(t.errLocationRequired);
                          else setReportStep(3);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        reportStep === s.step
                          ? 'bg-[#132c59] dark:bg-[#1f488a] text-white shadow-xs'
                          : 'text-[#4a5e7d] dark:text-[#8ea2c4] hover:bg-[#f0f5ff] dark:hover:bg-[#162a4a]'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {submittedTicket ? (
                /* SUBMISSION RECEIPT */
                <div className="bg-white dark:bg-[#0f1f38] rounded-3xl p-8 border border-[#d8e5f7] dark:border-[#1b3154] shadow-md max-w-xl mx-auto text-center space-y-5">
                  <div className="w-16 h-16 rounded-2xl bg-[#dcfce7] dark:bg-[#123d24] text-[#16a34a] dark:text-[#4ade80] flex items-center justify-center mx-auto">
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 className="text-2xl font-extrabold text-[#0b1b36] dark:text-white">
                    {t.receiptTitle}
                  </h3>
                  <p className="text-xs text-[#4a5e7d] dark:text-[#8ea2c4] max-w-md mx-auto leading-relaxed">
                    {t.receiptDesc}
                  </p>

                  <div className="bg-[#f4f8ff] dark:bg-[#091527] p-4 rounded-2xl border border-[#d8e5f7] dark:border-[#1e3459] text-left space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="font-semibold text-[#5a6f8e] dark:text-[#7d93b8]">{t.receiptTrackingId}:</span>
                      <span className="font-mono font-bold text-[#124699] dark:text-[#6fa8ff]">{submittedTicket.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-[#5a6f8e] dark:text-[#7d93b8]">{t.receiptDepartment}:</span>
                      <span className="font-bold text-[#0b1b36] dark:text-white">{submittedTicket.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-[#5a6f8e] dark:text-[#7d93b8]">{t.receiptAuthority}:</span>
                      <span className="font-bold text-[#0b1b36] dark:text-white">{submittedTicket.authorityCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-[#5a6f8e] dark:text-[#7d93b8]">{t.receiptCoreScore}:</span>
                      <span className="font-black text-[#124699] dark:text-[#6fa8ff]">{submittedTicket.metrics.coreScore}/10</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center gap-3 pt-2">
                    <button
                      onClick={() => setActiveTab('track')}
                      className="px-5 py-2.5 rounded-xl bg-[#124699] dark:bg-[#1b4382] hover:bg-[#0d3578] text-white text-xs font-bold cursor-pointer transition shadow-sm"
                    >
                      {t.btnTrackQueue}
                    </button>
                    <button
                      onClick={() => {
                        setSubmittedTicket(null);
                        setReportTitle('');
                        setReportDesc('');
                        handlePhotoRemove();
                        setReportStep(1);
                      }}
                      className="px-5 py-2.5 rounded-xl border border-[#d0dff2] dark:border-[#22395d] bg-white dark:bg-[#11213b] text-[#0b1b36] dark:text-white text-xs font-bold cursor-pointer transition"
                    >
                      {t.btnFileAnother}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
                  
                  {/* Left Column: Form Card with Step Wizard */}
                  <form
                    onSubmit={handleGrievanceSubmit}
                    className="lg:col-span-7 bg-white dark:bg-[#0f1f38] rounded-3xl p-6 sm:p-7 border border-[#e3ecf8] dark:border-[#1b3154] shadow-sm space-y-5"
                  >
                    {stepError && (
                      <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center justify-between">
                        <span>{stepError}</span>
                        <button type="button" onClick={() => setStepError(null)} className="font-bold text-sm ml-2">✕</button>
                      </div>
                    )}

                    {submitError && (
                      <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center justify-between">
                        <span>{submitError}</span>
                        <button type="button" onClick={() => setSubmitError(null)} className="font-bold text-sm ml-2">✕</button>
                      </div>
                    )}

                    {/* STEP 1: ISSUE DETAILS */}
                    {reportStep === 1 && (
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-base font-extrabold text-[#0b1b36] dark:text-white">
                            {t.step1Heading}
                          </h3>
                          <p className="text-xs text-[#5a6f8e] dark:text-[#8ea2c4] mt-0.5">
                            {t.step1Sub}
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-extrabold uppercase tracking-wider text-[#132c59] dark:text-[#91b3e8] mb-1.5">
                            {t.labelTitle}
                          </label>
                          <input
                            type="text"
                            value={reportTitle}
                            onChange={(e) => {
                              setReportTitle(e.target.value);
                              if (stepError) setStepError(null);
                            }}
                            placeholder={t.phTitle}
                            className="w-full rounded-xl border border-[#d5e2f2] dark:border-[#22395d] bg-[#f9fbff] dark:bg-[#091527] px-4 py-3 text-sm text-[#0b1b36] dark:text-white placeholder-[#7a8fa8] focus:outline-none focus:border-[#124699] transition"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-extrabold uppercase tracking-wider text-[#132c59] dark:text-[#91b3e8] mb-1.5">
                            {t.labelDesc}
                          </label>
                          <textarea
                            rows={4}
                            value={reportDesc}
                            onChange={(e) => {
                              setReportDesc(e.target.value);
                              if (stepError) setStepError(null);
                            }}
                            placeholder={t.phDesc}
                            className="w-full rounded-xl border border-[#d5e2f2] dark:border-[#22395d] bg-[#f9fbff] dark:bg-[#091527] p-4 text-sm text-[#0b1b36] dark:text-white placeholder-[#7a8fa8] focus:outline-none focus:border-[#124699] transition resize-none"
                          />
                        </div>

                        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setReportTitle('Deep road pothole near City Hospital entrance');
                              setReportDesc('Has been damaged for over 10 days causing severe traffic disruption and ambulance delays.');
                              setStepError(null);
                            }}
                            className="px-3.5 py-2.5 rounded-xl border border-[#d0dff2] dark:border-[#22395d] text-xs font-bold text-[#124699] dark:text-[#6fa8ff] hover:bg-[#f0f5ff] dark:hover:bg-[#122340] transition cursor-pointer"
                          >
                            {t.btnAutoFill}
                          </button>

                          <button
                            type="button"
                            onClick={goToStep2}
                            className="px-5 py-2.5 rounded-xl bg-[#132c59] dark:bg-[#1b4382] hover:bg-[#0d2042] text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition shadow-xs ml-auto"
                          >
                            <span>{t.btnContinueStep2}</span>
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 2: LOCATION & EVIDENCE */}
                    {reportStep === 2 && (
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-base font-extrabold text-[#0b1b36] dark:text-white">
                            {t.step2Heading}
                          </h3>
                          <p className="text-xs text-[#5a6f8e] dark:text-[#8ea2c4] mt-0.5">
                            {t.step2Sub}
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-extrabold uppercase tracking-wider text-[#132c59] dark:text-[#91b3e8] mb-1.5">
                            {t.labelLocation}
                          </label>
                          <div className="relative">
                            <MapPin size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#124699] dark:text-[#6fa8ff]" />
                            <input
                              type="text"
                              value={reportLocation}
                              onChange={(e) => {
                                setReportLocation(e.target.value);
                                if (stepError) setStepError(null);
                              }}
                              placeholder={t.phLocation}
                              className="w-full rounded-xl border border-[#d5e2f2] dark:border-[#22395d] bg-[#f9fbff] dark:bg-[#091527] pl-10 pr-4 py-3 text-sm text-[#0b1b36] dark:text-white focus:outline-none focus:border-[#124699] transition"
                            />
                          </div>
                        </div>

                        {/* Photo Attachment Section with Real File Input */}
                        <div>
                          <label className="block text-xs font-extrabold uppercase tracking-wider text-[#132c59] dark:text-[#91b3e8] mb-1.5">
                            {t.labelPhoto}
                          </label>

                          <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handlePhotoSelect(e.target.files[0]);
                              }
                            }}
                            className="hidden"
                          />

                          {photoPreview ? (
                            <div className="rounded-2xl border border-[#c4dcff] dark:border-[#22395d] p-4 bg-[#f4f8ff] dark:bg-[#0c1a2f] flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={photoPreview}
                                  alt="Selected supporting evidence"
                                  className="w-14 h-14 object-cover rounded-xl border border-white shadow-xs"
                                />
                                <div>
                                  <p className="text-xs font-bold text-[#0b1b36] dark:text-white truncate max-w-[200px]">
                                    {selectedPhoto?.name}
                                  </p>
                                  <p className="text-[11px] text-[#5a6f8e] dark:text-[#8ea2c4]">
                                    {selectedPhoto ? `${Math.round(selectedPhoto.size / 1024)} KB` : ''}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={handlePhotoRemove}
                                className="px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-xs font-bold hover:bg-red-200 transition cursor-pointer"
                              >
                                {t.photoRemove}
                              </button>
                            </div>
                          ) : (
                            <div
                              onClick={() => fileInputRef.current?.click()}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                e.preventDefault();
                                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                  handlePhotoSelect(e.dataTransfer.files[0]);
                                }
                              }}
                              className="border-2 border-dashed border-[#cbdcf2] dark:border-[#22395d] rounded-2xl p-5 text-center hover:border-[#124699] dark:hover:border-[#6fa8ff] transition cursor-pointer bg-[#f9fbff] dark:bg-[#091527]"
                            >
                              <Upload size={22} className="mx-auto text-[#124699] dark:text-[#6fa8ff] mb-1.5" />
                              <p className="text-xs font-bold text-[#0b1b36] dark:text-white">
                                {t.photoDragDrop}
                              </p>
                              <p className="text-[11px] text-[#5a6f8e] dark:text-[#8ea2c4] mt-0.5">
                                {t.photoFormats}
                              </p>
                            </div>
                          )}

                          {photoError && (
                            <p className="text-xs font-bold text-red-600 dark:text-red-400 mt-1.5">
                              {photoError}
                            </p>
                          )}
                          <p className="text-[11px] text-[#5a6f8e] dark:text-[#8ea2c4] mt-1.5">
                            {t.photoStorageNotice}
                          </p>
                        </div>

                        <div className="pt-2 flex items-center justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => setReportStep(1)}
                            className="px-4 py-2.5 rounded-xl border border-[#d0dff2] dark:border-[#22395d] text-xs font-bold text-[#0b1b36] dark:text-white hover:bg-[#f0f5ff] dark:hover:bg-[#122340] transition cursor-pointer"
                          >
                            {t.btnBackStep1}
                          </button>
                          <button
                            type="button"
                            onClick={goToStep3}
                            className="px-5 py-2.5 rounded-xl bg-[#132c59] dark:bg-[#1b4382] hover:bg-[#0d2042] text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition shadow-xs"
                          >
                            <span>{t.btnContinueStep3}</span>
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: ROUTING REVIEW & SUBMISSION */}
                    {reportStep === 3 && (
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-base font-extrabold text-[#0b1b36] dark:text-white">
                            {t.step3Heading}
                          </h3>
                          <p className="text-xs text-[#5a6f8e] dark:text-[#8ea2c4] mt-0.5">
                            {t.step3Sub}
                          </p>
                        </div>

                        {/* Review Summary Card */}
                        <div className="bg-[#f9fbff] dark:bg-[#091527] rounded-2xl p-4 border border-[#d5e2f2] dark:border-[#1e3459] space-y-2.5 text-xs">
                          <div>
                            <span className="font-bold text-[#5a6f8e] dark:text-[#8ea2c4]">{t.reviewTitle}:</span>
                            <p className="font-extrabold text-[#0b1b36] dark:text-white mt-0.5">{reportTitle}</p>
                          </div>
                          <div>
                            <span className="font-bold text-[#5a6f8e] dark:text-[#8ea2c4]">{t.reviewLocation}:</span>
                            <p className="font-semibold text-[#0b1b36] dark:text-white mt-0.5">{reportLocation}</p>
                          </div>
                          <div>
                            <span className="font-bold text-[#5a6f8e] dark:text-[#8ea2c4]">{t.reviewDesc}:</span>
                            <p className="text-[#374b6b] dark:text-[#9db3d4] mt-0.5">{reportDesc}</p>
                          </div>
                          {selectedPhoto && (
                            <div className="flex items-center gap-2 pt-1">
                              <ImageIcon size={14} className="text-[#124699] dark:text-[#6fa8ff]" />
                              <span className="font-semibold text-[#124699] dark:text-[#6fa8ff]">
                                {t.reviewPhotoAttached}: {selectedPhoto.name}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="pt-2 flex items-center justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => setReportStep(2)}
                            className="px-4 py-2.5 rounded-xl border border-[#d0dff2] dark:border-[#22395d] text-xs font-bold text-[#0b1b36] dark:text-white hover:bg-[#f0f5ff] dark:hover:bg-[#122340] transition cursor-pointer"
                          >
                            {t.btnBackStep2}
                          </button>
                          <button
                            type="submit"
                            disabled={isAnalyzing}
                            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#0d3f8c] to-[#195ec7] hover:from-[#093270] hover:to-[#12499e] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition"
                          >
                            <Sparkles size={16} />
                            <span>{isAnalyzing ? t.btnSubmitting : t.btnSubmitGrievance}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </form>

                  {/* Right Column: Routing & Problem Scoring Preview */}
                  <div className="lg:col-span-5 bg-white dark:bg-[#0f1f38] rounded-3xl p-6 border border-[#e3ecf8] dark:border-[#1b3154] shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-[#edf2fa] dark:border-[#1c3052] pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#ebf3ff] dark:bg-[#1a3869] text-[#124699] dark:text-[#7bb1ff] flex items-center justify-center">
                          <Cpu size={18} />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-sm text-[#0b1b36] dark:text-white">
                            {t.simulationNotice}
                          </h3>
                          <p className="text-[11px] text-[#5a6f8e] dark:text-[#8ea2c4]">
                            {t.simulationSub}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Problem Scoring Table */}
                    <div className="rounded-2xl overflow-hidden border border-[#d5e2f2] dark:border-[#1e3459]">
                      <div className="bg-[#132c59] dark:bg-[#1a3869] text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex justify-between">
                        <span>Evaluation Factor</span>
                        <span>Rating (0 - 10)</span>
                      </div>

                      <div className="divide-y divide-[#edf2fa] dark:divide-[#1c3052] bg-white dark:bg-[#0c182d] text-xs">
                        {[
                          { label: t.paramPriority, val: liveAiPreview.priority, starClass: 'text-red-500 fill-red-500' },
                          { label: t.paramDuration, val: liveAiPreview.duration, starClass: 'text-pink-500 fill-pink-500' },
                          { label: t.paramUrgency, val: liveAiPreview.urgency, starClass: 'text-orange-500 fill-orange-500' },
                          { label: t.paramFeasibility, val: liveAiPreview.feasibility, starClass: 'text-emerald-500 fill-emerald-500' },
                        ].map((row) => (
                          <div key={row.label} className="px-4 py-2.5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#0b1b36] dark:text-white">{row.label}</span>
                              {row.val > 7 && (
                                <Star size={12} className={row.starClass} />
                              )}
                            </div>
                            <span className="font-extrabold text-[#0b1b36] dark:text-white">{row.val}</span>
                          </div>
                        ))}

                        <div className="bg-[#eaf2ff] dark:bg-[#13284a] px-4 py-3 flex items-center justify-between border-t border-[#cde0ff] dark:border-[#1e3a66]">
                          <div>
                            <span className="font-extrabold text-[#0b1b36] dark:text-white block text-xs">
                              {t.scoreFooterTitle}
                            </span>
                            <span className="text-[10px] text-[#4a5e7d] dark:text-[#8ea2c4]">
                              {t.scoreFooterSub}
                            </span>
                          </div>
                          <span className="text-xl font-black text-[#124699] dark:text-[#7bb1ff]">
                            {liveAiPreview.coreScore}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Auto-Assigned Department */}
                    <div className="p-3.5 rounded-2xl bg-[#f4f8ff] dark:bg-[#091527] border border-[#d8e5f7] dark:border-[#1e3459] flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#124699] dark:text-[#6fa8ff]">
                          {t.autoDispatchTitle}
                        </p>
                        <p className="text-xs font-extrabold text-[#0b1b36] dark:text-white mt-0.5">
                          {liveAiPreview.department}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-xl bg-white dark:bg-[#11213b] border border-[#d0dff2] dark:border-[#22395d] text-xs font-extrabold text-[#132c59] dark:text-[#8dbaff]">
                        {liveAiPreview.authorityCode}
                      </span>
                    </div>
                  </div>

                </div>
              )}
            </motion.div>
          )}

          {/* =========================================================
              PAGE 3: TRACK ISSUE (BACKEND POWERED + PAGINATION)
             ========================================================= */}
          {activeTab === 'track' && (
            <motion.div
              key="track"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-14 py-8"
            >
              {/* Header & Debounced Search Input */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#dceaff] dark:bg-[#1a3869] text-[#124699] dark:text-[#7bb1ff] text-xs font-bold mb-2">
                    <Target size={13} />
                    <span>{t.trackBadge}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0b1b36] dark:text-white">
                    {t.trackTitle}
                  </h2>
                </div>

                <div className="relative w-full md:w-80">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5a6f8e]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.phSearch}
                    className="w-full rounded-xl bg-white dark:bg-[#0f1f38] border border-[#d5e2f2] dark:border-[#22395d] pl-10 pr-4 py-2.5 text-xs font-semibold text-[#0b1b36] dark:text-white placeholder-[#7a8fa8] focus:outline-none focus:border-[#124699] shadow-2xs"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#5a6f8e] hover:text-[#0b1b36] dark:hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* FILTERS TOOLBAR: Department Tabs, Category Selector & Status Filters */}
              <div className="bg-white dark:bg-[#0f1f38] rounded-2xl p-5 border border-[#e3ecf8] dark:border-[#1b3154] shadow-sm mb-6 space-y-4">
                {/* Row 1: Department Tabs & Category Dropdown */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {/* Department Tabs */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {['All', 'Public Works (PWD)', 'Water & Sanitation', 'Electricity', 'Municipal Services'].map((dept) => (
                      <button
                        key={dept}
                        onClick={() => setSelectedDeptFilter(dept)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          selectedDeptFilter === dept
                            ? 'bg-[#132c59] dark:bg-[#1f488a] text-white'
                            : 'bg-[#f4f8ff] dark:bg-[#11213b] text-[#374b6b] dark:text-[#a0b5d6] hover:bg-[#dceaff] dark:hover:bg-[#192f52]'
                        }`}
                      >
                        {dept === 'All' ? t.deptAll : dept}
                      </button>
                    ))}
                  </div>

                  {/* Category Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-[#0b1b36] dark:text-white">
                      {t.filterCategory}
                    </span>
                    <select
                      value={selectedCategoryFilter}
                      onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                      className="rounded-xl bg-[#f4f8ff] dark:bg-[#11213b] border border-[#d5e2f2] dark:border-[#22395d] px-3 py-1.5 text-xs font-bold text-[#0b1b36] dark:text-white focus:outline-none focus:border-[#124699]"
                    >
                      {CATEGORY_OPTIONS.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat === 'All' ? t.categoryAll : cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 2: Status Filter Tabs */}
                <div className="flex flex-wrap items-center justify-between border-t border-[#edf2fa] dark:border-[#192f52] pt-3 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-[#0b1b36] dark:text-white">
                      {t.filterStatus}
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {[
                        { label: t.statusAll, value: 'All' },
                        { label: t.statusPending, value: 'Pending' },
                        { label: t.statusInProgress, value: 'In Progress' },
                        { label: t.statusResolved, value: 'Resolved' },
                      ].map((st) => (
                        <button
                          key={st.value}
                          onClick={() => setSelectedStatusFilter(st.value)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                            selectedStatusFilter === st.value
                              ? 'bg-[#124699] dark:bg-[#2052a6] text-white'
                              : 'bg-[#f4f8ff] dark:bg-[#11213b] text-[#5a6f8e] dark:text-[#8ea2c4] hover:bg-[#dceaff]'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clear / Reset Filters if any active */}
                  {(searchQuery || selectedDeptFilter !== 'All' || selectedCategoryFilter !== 'All' || selectedStatusFilter !== 'All' || activeStarFilters.length > 0) && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedDeptFilter('All');
                        setSelectedCategoryFilter('All');
                        setSelectedStatusFilter('All');
                        setActiveStarFilters([]);
                      }}
                      className="text-xs font-bold text-[#124699] dark:text-[#6fa8ff] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw size={12} />
                      <span>{t.btnResetFilters}</span>
                    </button>
                  )}
                </div>

                {/* Row 3: 4-Star Grade Filter Pills */}
                <div className="border-t border-[#edf2fa] dark:border-[#192f52] pt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <SlidersHorizontal size={14} className="text-[#124699] dark:text-[#6fa8ff]" />
                    <span className="text-xs font-extrabold text-[#0b1b36] dark:text-white">
                      {t.filterByGrade}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {STAR_GRADES.map((grade) => {
                      const active = activeStarFilters.includes(grade.key);
                      return (
                        <button
                          key={grade.key}
                          onClick={() => toggleStarFilter(grade.key)}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            active
                              ? `${grade.pillActive} shadow-2xs`
                              : 'bg-[#f9fbff] dark:bg-[#11213b] border-[#e3ecf8] dark:border-[#1b3154] hover:border-[#b5d1ff]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Star size={15} className={grade.starClass} />
                            <span className="text-xs font-extrabold text-[#0b1b36] dark:text-white">
                              {t[grade.labelKey as keyof typeof t] as string}
                            </span>
                          </div>
                          <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md ${
                            active ? 'bg-white dark:bg-[#0c182d] text-[#0b1b36] dark:text-white' : 'bg-[#eaf2ff] dark:bg-[#183159] text-[#124699] dark:text-[#7bb1ff]'
                          }`}>
                            {active ? t.activeFilter : t.toggleFilter}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* GRIEVANCE QUEUE LIST */}
              <div className="space-y-3.5">
                {isLoadingGrievances ? (
                  <div className="bg-white dark:bg-[#0f1f38] rounded-2xl p-12 border border-[#e3ecf8] dark:border-[#1b3154] text-center space-y-3 shadow-xs">
                    <div className="w-9 h-9 border-3 border-[#124699] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm font-bold text-[#0b1b36] dark:text-white">{t.loadingGrievances}</p>
                    <p className="text-xs text-[#5a6f8e] dark:text-[#8ea2c4]">{t.connectingDb}</p>
                  </div>
                ) : fetchError ? (
                  <div className="bg-white dark:bg-[#0f1f38] rounded-2xl p-8 border border-red-200 dark:border-red-900 text-center space-y-3 shadow-xs">
                    <p className="text-sm font-bold text-red-600 dark:text-red-400">{t.failedGrievances}: {fetchError}</p>
                    <button
                      onClick={refetchComplaints}
                      className="px-5 py-2 rounded-xl bg-[#132c59] dark:bg-[#1b4382] text-white text-xs font-bold hover:bg-[#0d2042] transition cursor-pointer"
                    >
                      {t.btnRetry}
                    </button>
                  </div>
                ) : filteredGrievances.length === 0 ? (
                  <div className="bg-white dark:bg-[#0f1f38] rounded-2xl p-12 border border-[#e3ecf8] dark:border-[#1b3154] text-center space-y-3 shadow-xs">
                    <div className="w-12 h-12 rounded-2xl bg-[#f0f5ff] dark:bg-[#1a345c] text-[#124699] dark:text-[#7bb1ff] flex items-center justify-center mx-auto">
                      <FileText size={24} />
                    </div>
                    <h3 className="font-extrabold text-base text-[#0b1b36] dark:text-white">{t.noGrievancesTitle}</h3>
                    <p className="text-xs text-[#5a6f8e] dark:text-[#8ea2c4] max-w-md mx-auto leading-relaxed">
                      {searchQuery || selectedDeptFilter !== 'All' || selectedCategoryFilter !== 'All' || selectedStatusFilter !== 'All' || activeStarFilters.length > 0
                        ? t.noGrievancesMatch
                        : t.noGrievancesDb}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between text-xs text-[#5a6f8e] dark:text-[#8ea2c4] px-1">
                      <span>
                        {t.showingRecords} <strong className="text-[#0b1b36] dark:text-white">{filteredGrievances.length}</strong> {t.ofRecords} <strong className="text-[#0b1b36] dark:text-white">{totalRecords}</strong> {t.recordsLabel}
                      </span>
                    </div>

                    <AnimatePresence>
                      {filteredGrievances.map((item, index) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          onClick={() => setSelectedGrievance(item)}
                          tabIndex={0}
                          role="button"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') setSelectedGrievance(item);
                          }}
                          className="bg-white dark:bg-[#0f1f38] rounded-2xl p-5 border border-[#e3ecf8] dark:border-[#1b3154] shadow-sm hover:shadow-md hover:border-[#bfd6f7] dark:hover:border-[#2d4e82] transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 cursor-pointer outline-none"
                        >
                          <div className="space-y-2 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-2 py-0.5 rounded-lg bg-[#132c59] dark:bg-[#1a3869] text-white font-mono text-[11px] font-bold">
                                {t.cardRank}{index + 1}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-lg bg-[#f4f8ff] dark:bg-[#0c1a2f] border border-[#d8e5f7] dark:border-[#1e3459] font-mono text-xs font-bold text-[#124699] dark:text-[#7bb1ff]">
                                {item.id}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-lg bg-[#eaf2ff] dark:bg-[#162d52] text-[#124699] dark:text-[#8dbaff] text-xs font-bold">
                                {item.department} • {item.authorityCode}
                              </span>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                  item.status === 'Resolved'
                                    ? 'bg-[#dcfce7] dark:bg-[#0e3b1f] text-[#15803d] dark:text-[#4ade80]'
                                    : item.status === 'In Progress'
                                    ? 'bg-[#fef3c7] dark:bg-[#453106] text-[#b45309] dark:text-[#f8be43]'
                                    : 'bg-[#e0f2fe] dark:bg-[#0c3757] text-[#0369a1] dark:text-[#67c4fa]'
                                }`}
                              >
                                {item.status}
                              </span>
                              <span className="text-xs font-medium text-[#5a6f8e] dark:text-[#8ea2c4]">{item.createdAt}</span>
                            </div>

                            <h3 className="text-base font-extrabold text-[#0b1b36] dark:text-white">
                              {item.title}
                            </h3>
                            <p className="text-xs text-[#4a5e7d] dark:text-[#8ea2c4] leading-relaxed line-clamp-2">
                              {item.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-4 text-xs text-[#4a5e7d] dark:text-[#8ea2c4] pt-1">
                              <span className="flex items-center gap-1.5 font-medium">
                                <MapPin size={13} className="text-[#124699] dark:text-[#6fa8ff]" /> {item.location}
                              </span>
                              {item.category && (
                                <span className="px-2 py-0.5 rounded-md bg-[#f0f5ff] dark:bg-[#162a4a] text-[#124699] dark:text-[#7bb1ff] font-semibold">
                                  {item.category}
                                </span>
                              )}
                              <span className="flex items-center gap-1 font-bold text-[#124699] dark:text-[#7bb1ff]">
                                <ThumbsUp size={12} /> {item.upvotes} {t.cardCitizensAffected}
                              </span>
                            </div>
                          </div>

                          {/* Right Side: Score and Stars */}
                          <div className="flex sm:flex-row lg:flex-col items-end justify-between gap-3 shrink-0 w-full lg:w-auto border-t lg:border-t-0 pt-3 lg:pt-0 border-[#edf2fa] dark:border-[#192f52]">
                            <div className="flex items-center gap-1.5">
                              {STAR_GRADES.map((grade) => {
                                const score = item.metrics[grade.key];
                                if (score <= 7) return null;
                                return (
                                  <div
                                    key={grade.key}
                                    title={`${grade.desc}: ${score}`}
                                    className="px-2 py-0.5 rounded-lg bg-[#f9fbff] dark:bg-[#0c1a2f] border border-[#d8e5f7] dark:border-[#1e3459] flex items-center gap-1 text-xs font-bold text-[#0b1b36] dark:text-white"
                                  >
                                    <Star size={12} className={grade.starClass} />
                                    <span>{score}</span>
                                  </div>
                                );
                              })}
                            </div>

                            <div className="flex items-center gap-2.5 bg-[#f4f8ff] dark:bg-[#091527] border border-[#cfe0f8] dark:border-[#1e3459] px-3.5 py-1.5 rounded-xl">
                              <div className="text-right">
                                <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[#124699] dark:text-[#6fa8ff]">
                                  {t.cardCoreScoreLabel}
                                </span>
                              </div>
                              <span className="text-xl font-black text-[#0b1b36] dark:text-white">
                                {item.metrics.coreScore}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Pagination: Load More Button */}
                    {hasMore && (
                      <div className="text-center pt-4 pb-2">
                        <button
                          onClick={handleLoadMore}
                          disabled={isLoadingMore}
                          className="px-6 py-3 rounded-xl bg-white dark:bg-[#11213b] border border-[#d0dff2] dark:border-[#22395d] hover:bg-[#f4f8ff] dark:hover:bg-[#162a4a] text-xs font-bold text-[#124699] dark:text-[#7bb1ff] shadow-xs cursor-pointer transition"
                        >
                          {isLoadingMore ? t.loadingMore : t.btnLoadMore}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* =========================================================
              PAGE 4: HELP & SUPPORT PAGE (TEL, MAILTO & FEEDBACK FORM)
             ========================================================= */}
          {activeTab === 'help' && (
            <motion.div
              key="help"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-14 py-8 space-y-8"
            >
              <div className="text-center max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#dceaff] dark:bg-[#1a3869] text-[#124699] dark:text-[#7bb1ff] text-xs font-bold mb-2">
                  <HelpCircle size={14} />
                  <span>{t.helpBadge}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0b1b36] dark:text-white">
                  {t.helpTitle}
                </h2>
                <p className="text-xs sm:text-sm text-[#4a5e7d] dark:text-[#8ea2c4] mt-2">
                  {t.helpSub}
                </p>
              </div>

              {/* 3 Clickable Contact Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* 1. Helpline */}
                <div className="bg-white dark:bg-[#0f1f38] rounded-2xl p-6 border border-[#e3ecf8] dark:border-[#1b3154] shadow-sm">
                  <div className="w-11 h-11 rounded-xl bg-[#eaf2ff] dark:bg-[#1a345c] text-[#124699] dark:text-[#7bb1ff] flex items-center justify-center mb-4">
                    <PhoneCall size={20} />
                  </div>
                  <h3 className="font-bold text-xs text-[#4a5e7d] dark:text-[#8ea2c4]">{t.contactHelplineTitle}</h3>
                  <a
                    href="tel:1800112026"
                    className="text-lg font-extrabold text-[#0b1b36] dark:text-white mt-1 block hover:underline hover:text-[#124699] dark:hover:text-[#7bb1ff]"
                  >
                    1800-11-2026
                  </a>
                  <p className="text-xs text-[#5a6f8e] dark:text-[#7d93b8] mt-1">{t.contactHelplineSub}</p>
                </div>

                {/* 2. Email */}
                <div className="bg-white dark:bg-[#0f1f38] rounded-2xl p-6 border border-[#e3ecf8] dark:border-[#1b3154] shadow-sm">
                  <div className="w-11 h-11 rounded-xl bg-[#eaf2ff] dark:bg-[#1a345c] text-[#124699] dark:text-[#7bb1ff] flex items-center justify-center mb-4">
                    <Mail size={20} />
                  </div>
                  <h3 className="font-bold text-xs text-[#4a5e7d] dark:text-[#8ea2c4]">{t.contactEmailTitle}</h3>
                  <a
                    href="mailto:helpdesk@jansewa.gov.in"
                    className="text-base font-extrabold text-[#0b1b36] dark:text-white mt-1 block hover:underline hover:text-[#124699] dark:hover:text-[#7bb1ff] truncate"
                  >
                    helpdesk@jansewa.gov.in
                  </a>
                  <p className="text-xs text-[#5a6f8e] dark:text-[#7d93b8] mt-1">{t.contactEmailSub}</p>
                </div>

                {/* 3. SLA Target */}
                <div className="bg-white dark:bg-[#0f1f38] rounded-2xl p-6 border border-[#e3ecf8] dark:border-[#1b3154] shadow-sm">
                  <div className="w-11 h-11 rounded-xl bg-[#eaf2ff] dark:bg-[#1a345c] text-[#124699] dark:text-[#7bb1ff] flex items-center justify-center mb-4">
                    <Layers size={20} />
                  </div>
                  <h3 className="font-bold text-xs text-[#4a5e7d] dark:text-[#8ea2c4]">{t.contactSlaTitle}</h3>
                  <p className="text-lg font-extrabold text-[#0b1b36] dark:text-white mt-1">{t.contactSlaVal}</p>
                  <p className="text-xs text-[#5a6f8e] dark:text-[#7d93b8] mt-1">{t.contactSlaSub}</p>
                </div>
              </div>

              {/* Functional Citizen Feedback Form */}
              <div className="bg-white dark:bg-[#0f1f38] rounded-3xl p-6 sm:p-7 border border-[#e3ecf8] dark:border-[#1b3154] shadow-sm space-y-4">
                <div>
                  <h3 className="text-lg font-extrabold text-[#0b1b36] dark:text-white">
                    {t.feedbackHeading}
                  </h3>
                  <p className="text-xs text-[#5a6f8e] dark:text-[#8ea2c4] mt-0.5">
                    {t.feedbackSub}
                  </p>
                </div>

                {fbStatus === 'success' && (
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs space-y-1">
                    <p className="font-extrabold text-sm">{t.fbSuccessTitle}</p>
                    <p className="leading-relaxed">{t.fbSuccessMsg}</p>
                  </div>
                )}

                {fbStatus === 'error' && (
                  <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center justify-between">
                    <span>{fbErrorMsg}</span>
                    <button type="button" onClick={() => setFbStatus('idle')} className="font-bold ml-2">✕</button>
                  </div>
                )}

                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#132c59] dark:text-[#91b3e8] mb-1">
                        {t.fbLabelName}
                      </label>
                      <input
                        type="text"
                        value={fbName}
                        onChange={(e) => setFbName(e.target.value)}
                        placeholder={t.fbPhName}
                        className="w-full rounded-xl border border-[#d5e2f2] dark:border-[#22395d] bg-[#f9fbff] dark:bg-[#091527] px-3.5 py-2.5 text-xs text-[#0b1b36] dark:text-white placeholder-[#7a8fa8] focus:outline-none focus:border-[#124699]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#132c59] dark:text-[#91b3e8] mb-1">
                        {t.fbLabelContact}
                      </label>
                      <input
                        type="text"
                        required
                        value={fbContact}
                        onChange={(e) => setFbContact(e.target.value)}
                        placeholder={t.fbPhContact}
                        className="w-full rounded-xl border border-[#d5e2f2] dark:border-[#22395d] bg-[#f9fbff] dark:bg-[#091527] px-3.5 py-2.5 text-xs text-[#0b1b36] dark:text-white placeholder-[#7a8fa8] focus:outline-none focus:border-[#124699]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#132c59] dark:text-[#91b3e8] mb-1">
                      {t.fbLabelType}
                    </label>
                    <select
                      value={fbType}
                      onChange={(e) => setFbType(e.target.value)}
                      className="w-full rounded-xl border border-[#d5e2f2] dark:border-[#22395d] bg-[#f9fbff] dark:bg-[#091527] px-3.5 py-2.5 text-xs text-[#0b1b36] dark:text-white focus:outline-none focus:border-[#124699]"
                    >
                      <option value="bug">{t.fbTypeBug}</option>
                      <option value="suggestion">{t.fbTypeSuggestion}</option>
                      <option value="dept">{t.fbTypeDept}</option>
                      <option value="general">{t.fbTypeGeneral}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#132c59] dark:text-[#91b3e8] mb-1">
                      {t.fbLabelMessage}
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={fbMessage}
                      onChange={(e) => setFbMessage(e.target.value)}
                      placeholder={t.fbPhMessage}
                      className="w-full rounded-xl border border-[#d5e2f2] dark:border-[#22395d] bg-[#f9fbff] dark:bg-[#091527] p-3 text-xs text-[#0b1b36] dark:text-white placeholder-[#7a8fa8] focus:outline-none focus:border-[#124699] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#132c59] dark:bg-[#1b4382] hover:bg-[#0d2042] text-white text-xs font-bold cursor-pointer transition flex items-center gap-2 shadow-xs"
                  >
                    <Send size={13} />
                    <span>{t.btnSubmitFeedback}</span>
                  </button>
                </form>
              </div>

              {/* FAQ Accordion */}
              <div className="bg-white dark:bg-[#0f1f38] rounded-3xl p-6 sm:p-7 border border-[#e3ecf8] dark:border-[#1b3154] shadow-sm space-y-3">
                <h3 className="text-lg font-extrabold text-[#0b1b36] dark:text-white mb-3">
                  {t.faqHeading}
                </h3>
                {[
                  {
                    q: lang === 'EN' ? 'How does the system route my complaint to the correct authority?' : 'प्रणाली मेरी शिकायत को संबंधित प्राधिकरण तक कैसे पहुंचाती है?',
                    a: lang === 'EN' ? 'When you submit an issue, our natural language routing heuristic evaluates the title, description, and location to dispatch it to Public Works (Authority A), Water & Sanitation (Authority B), Electricity (Authority C), or Municipal Services (Authority D).' : 'जब आप शिकायत दर्ज करते हैं, तो हमारी प्रणाली शीर्षक, विवरण और स्थान का विश्लेषण करके इसे लोक निर्माण (प्राधिकरण A), जल एवं स्वच्छता (प्राधिकरण B), विद्युत (प्राधिकरण C), या नगर पालिका (प्राधिकरण D) को अग्रेषित करती है।',
                  },
                  {
                    q: lang === 'EN' ? 'What is the Core Score and how does it determine queue priority?' : 'कोर स्कोर क्या है और यह शिकायत की प्राथमिकता कैसे तय करता है?',
                    a: lang === 'EN' ? 'The Core Score (0 to 10) is a weighted calculation derived from Priority, Duration, Urgency, and Feasibility. Complaints with higher Core Scores automatically receive elevated prominence in the municipal redressal queue.' : 'कोर स्कोर (0 से 10) प्राथमिकता, अवधि, तात्कालिकता और सुगमता का भारित मान है। अधिक कोर स्कोर वाली शिकायतें स्वचालित रूप से प्राथमिकता सूची में ऊपर आती हैं।',
                  },
                  {
                    q: lang === 'EN' ? 'Why are colored stars displayed on complaint cards?' : 'शिकायत कार्ड पर रंगीन स्टार क्यों प्रदर्शित होते हैं?',
                    a: lang === 'EN' ? 'When an individual metric exceeds 7 out of 10, it earns a designated colored star (Red for Priority, Pink for Duration, Orange for Urgency, Green for Feasibility), making critical issues quickly identifiable.' : 'जब कोई व्यक्तिगत मान 10 में से 7 से अधिक होता है, तो उसे एक रंगीन स्टार मिलता है (प्राथमिकता के लिए लाल, अवधि के लिए गुलाबी, तात्कालिकता के लिए नारंगी, सुगमता के लिए हरा)।',
                  },
                ].map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div
                      key={idx}
                      className="border border-[#e3ecf8] dark:border-[#1b3154] rounded-2xl overflow-hidden bg-[#f9fbff] dark:bg-[#091527]"
                    >
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        aria-expanded={isOpen}
                        className="w-full px-5 py-3.5 flex items-center justify-between text-left font-bold text-xs sm:text-sm text-[#0b1b36] dark:text-white hover:bg-[#f0f5ff] dark:hover:bg-[#122340] transition cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown
                          size={16}
                          className={`text-[#124699] dark:text-[#6fa8ff] transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-4 text-xs text-[#4a5e7d] dark:text-[#8ea2c4] leading-relaxed border-t border-[#e3ecf8] dark:border-[#1b3154] pt-3 bg-white dark:bg-[#0c182d]">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* ==================== FOOTER ==================== */}
      <footer className="relative w-full pt-6 bg-transparent mt-auto select-none">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-14 pb-4 text-center">
          <p className="text-xs font-semibold text-[#4a5e7d] dark:text-[#7d93b8]">
            {t.footerGov}
          </p>
          <p className="text-[11px] text-[#5a6f8e] dark:text-[#5a7194] mt-0.5">
            {t.footerRights}
          </p>
        </div>

        <svg
          viewBox="0 0 1440 90"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-[60px] sm:h-[80px] object-cover pointer-events-none"
          preserveAspectRatio="none"
        >
          <g fill={theme === 'dark' ? '#162845' : '#c5dbf7'} opacity="0.6">
            <rect x="330" y="40" width="12" height="50" />
            <polygon points="336,25 328,40 344,40" />
            <rect x="380" y="30" width="26" height="60" />
            <rect x="520" y="45" width="85" height="45" />
            <circle cx="562" cy="40" r="20" />
            <rect x="680" y="20" width="84" height="70" rx="2" />
            <rect x="895" y="40" width="110" height="50" />
            <rect x="220" y="80" width="1000" height="10" />
          </g>
          <path d="M0 40 C 120 60, 230 80, 400 90 L 0 90 Z" fill="#fdba74" opacity="0.4" />
          <path d="M1440 40 C 1320 60, 1210 80, 1040 90 L 1440 90 Z" fill="#22c55e" opacity="0.3" />
        </svg>
      </footer>

      {/* ==================== GRIEVANCE DETAIL INSPECTION MODAL ==================== */}
      <AnimatePresence>
        {selectedGrievance && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedGrievance(null)}
            className="fixed inset-0 z-50 bg-[#0b1b36]/50 dark:bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-grievance-title"
              className="bg-white dark:bg-[#0f1f38] text-[#0b1b36] dark:text-white w-full max-w-lg rounded-3xl p-6 sm:p-7 border border-[#d8e5f7] dark:border-[#1b3154] shadow-2xl relative space-y-4"
            >
              <button
                onClick={() => setSelectedGrievance(null)}
                aria-label={t.close}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#f4f8ff] dark:bg-[#11213b] flex items-center justify-center text-[#4a5e7d] dark:text-[#8ea2c4] hover:text-[#0b1b36] dark:hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>

              <div>
                <span className="px-3 py-1 rounded-full bg-[#dceaff] dark:bg-[#1a3869] text-[#124699] dark:text-[#7bb1ff] text-xs font-bold">
                  {selectedGrievance.id} • {selectedGrievance.department}
                </span>
                <h3 id="modal-grievance-title" className="text-lg sm:text-xl font-extrabold mt-2">
                  {selectedGrievance.title}
                </h3>
                <p className="text-xs text-[#5a6f8e] dark:text-[#8ea2c4] mt-1">{selectedGrievance.location}</p>
              </div>

              <div className="grid grid-cols-5 gap-2 bg-[#f4f8ff] dark:bg-[#091527] p-3 rounded-2xl border border-[#d8e5f7] dark:border-[#1e3459] text-center">
                <div>
                  <span className="text-[10px] font-bold text-[#5a6f8e] dark:text-[#8ea2c4] block">Priority</span>
                  <span className="text-sm font-extrabold">{selectedGrievance.metrics.priority}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#5a6f8e] dark:text-[#8ea2c4] block">Duration</span>
                  <span className="text-sm font-extrabold">{selectedGrievance.metrics.duration}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#5a6f8e] dark:text-[#8ea2c4] block">Urgency</span>
                  <span className="text-sm font-extrabold">{selectedGrievance.metrics.urgency}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#5a6f8e] dark:text-[#8ea2c4] block">Feasibility</span>
                  <span className="text-sm font-extrabold">{selectedGrievance.metrics.feasibility}</span>
                </div>
                <div className="bg-[#132c59] dark:bg-[#1b4382] text-white rounded-xl py-1">
                  <span className="text-[10px] font-bold block opacity-80">Core</span>
                  <span className="text-sm font-black">{selectedGrievance.metrics.coreScore}</span>
                </div>
              </div>

              <p className="text-xs text-[#374b6b] dark:text-[#9db3d4] leading-relaxed">
                {selectedGrievance.description}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== CITIZEN LOGIN / REGISTER MODAL ==================== */}
      <AnimatePresence>
        {isLoginOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsLoginOpen(false)}
            className="fixed inset-0 z-50 bg-[#0b1b36]/50 dark:bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-login-title"
              className="bg-white dark:bg-[#0f1f38] text-[#0b1b36] dark:text-white w-full max-w-md rounded-3xl p-6 sm:p-7 border border-[#d8e5f7] dark:border-[#1b3154] shadow-2xl relative"
            >
              <button
                onClick={() => setIsLoginOpen(false)}
                aria-label={t.close}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#f4f8ff] dark:bg-[#11213b] flex items-center justify-center text-[#4a5e7d] dark:text-[#8ea2c4] hover:text-[#0b1b36] dark:hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-2xl bg-[#132c59] dark:bg-[#1b4382] text-white flex items-center justify-center">
                  <User size={20} />
                </div>
                <div>
                  <h3 id="modal-login-title" className="font-extrabold text-lg">
                    {t.loginModalTitle}
                  </h3>
                  <p className="text-xs text-[#5a6f8e] dark:text-[#8ea2c4]">{t.loginModalSub}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#132c59] dark:text-[#91b3e8] mb-1.5">
                    {t.mobileNumber}
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    className="w-full rounded-xl border border-[#d5e2f2] dark:border-[#22395d] bg-[#f9fbff] dark:bg-[#091527] px-4 py-3 text-sm text-[#0b1b36] dark:text-white focus:outline-none focus:border-[#124699]"
                  />
                </div>
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>Citizen authentication integration with Supabase Auth / SMS Gateway will be provisioned in the upcoming phase.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLoginOpen(false)}
                  className="w-full py-3.5 rounded-xl bg-[#132c59] dark:bg-[#1b4382] hover:bg-[#0d2042] text-white font-bold text-sm cursor-pointer transition"
                >
                  {t.requestOtp}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
