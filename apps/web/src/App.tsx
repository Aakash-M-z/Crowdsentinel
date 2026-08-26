import { type FormEvent, type ReactNode, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Bell,
  Camera,
  Check,
  ChevronRight,
  CircleHelp,
  CircleOff,
  Clock3,
  Database,
  FileVideo,
  Gauge,
  Info,
  Layers3,
  LayoutDashboard,
  ListFilter,
  Loader2,
  MapPin,
  Menu,
  Play,
  Plus,
  Radio,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Upload,
  Video,
  X,
  type LucideIcon,
} from 'lucide-react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  getGetAlertsQueryKey,
  getGetAnalysisSessionQueryKey,
  getGetAnalyticsQueryKey,
  getGetCamerasQueryKey,
  getGetDashboardQueryKey,
  getGetRiskSettingsQueryKey,
  useCreateCamera,
  useDeleteCamera,
  useGetAlerts,
  useGetAnalysisSession,
  useGetAnalytics,
  useGetCameras,
  useGetDashboard,
  useGetRiskSettings,
  useStartAnalysis,
  useUpdateCamera,
  useUpdateRiskSettings,
  type AnalysisSession,
} from '@workspace/api-client-react';
import {
  Route,
  Switch,
  Link,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

type Tone = 'teal' | 'amber' | 'red' | 'green' | 'slate';

const navItems: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/dashboard', label: 'Live overview', icon: LayoutDashboard },
  { href: '/monitor', label: 'Monitor', icon: Radio },
  { href: '/cameras', label: 'Cameras', icon: Camera },
  { href: '/alerts', label: 'Alert history', icon: Bell },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
];

function toneForRisk(level?: string): Tone {
  const value = (level ?? '').toLowerCase();
  if (value.includes('critical')) return 'red';
  if (value.includes('high')) return 'amber';
  if (value.includes('warning') || value.includes('medium')) return 'amber';
  if (value.includes('low') || value.includes('normal')) return 'green';
  return 'teal';
}

function toneClasses(tone: Tone) {
  return {
    teal: 'bg-[#e4f4f2] text-[#12696d] border-[#b9dfda]',
    amber: 'bg-[#fff4d6] text-[#956d00] border-[#f2d47d]',
    red: 'bg-[#fce8e5] text-[#ad342d] border-[#f2bbb4]',
    green: 'bg-[#e4f2e8] text-[#267250] border-[#b7d8c3]',
    slate: 'bg-[#edf1f2] text-[#53646c] border-[#d5dfe1]',
  }[tone];
}

function formatTime(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

function MetricSkeleton() {
  return <div className="h-24 animate-pulse rounded-xl bg-slate-200/70" />;
}

function PageError({ message, retry }: { message?: string; retry: () => void }) {
  return (
    <div data-testid="state-error" className="flex min-h-[360px] items-center justify-center rounded-2xl border border-[#f2bbb4] bg-[#fff6f4] p-8 text-center">
      <div>
        <CircleOff className="mx-auto mb-3 text-[#ad342d]" size={28} />
        <h2 className="font-bold text-[#6d2925]">Signal unavailable</h2>
        <p className="mt-1 max-w-sm text-sm text-[#8f514b]">{message ?? 'The service did not return a usable response.'}</p>
        <button data-testid="button-retry" onClick={retry} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#12696d] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#0d5559]">
          <RefreshCw size={14} /> Retry connection
        </button>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, body }: { icon: LucideIcon; title: string; body: string }) {
  return (
    <div data-testid="state-empty" className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#cbd9da] bg-[#f9fbfa] p-8 text-center">
      <div className="mb-4 rounded-xl bg-[#e4f4f2] p-3 text-[#12696d]"><Icon size={23} /></div>
      <h2 className="font-bold text-[#20343b]">{title}</h2>
      <p className="mt-1 max-w-sm text-sm leading-6 text-[#6d7d83]">{body}</p>
    </div>
  );
}

function Badge({ children, tone = 'slate', className = '' }: { children: ReactNode; tone?: Tone; className?: string }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[.13em] ${toneClasses(tone)} ${className}`}>{children}</span>;
}

function SectionTitle({ eyebrow, title, detail, action }: { eyebrow?: string; title: string; detail?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <div className="mb-2 font-mono text-[10px] font-medium uppercase tracking-[.18em] text-[#8a9a9d]">{eyebrow}</div>}
        <h1 className="text-[27px] font-extrabold tracking-[-.04em] text-[#20343b]">{title}</h1>
        {detail && <p className="mt-1 text-sm text-[#708085]">{detail}</p>}
      </div>
      {action}
    </div>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const activePath = location === '/' ? '/dashboard' : location;

  return (
    <div className="min-h-[100dvh] bg-[#f1f6f5] text-[#20343b]">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[250px] flex-col border-r border-[#31494d] bg-[#142c33] text-[#dbe8e6] transition-transform duration-200 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-[84px] items-center border-b border-[#31494d] px-6">
          <Link href="/dashboard" data-testid="link-brand" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
            <div className="relative flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#f4c84d] text-[#142c33]">
              <ShieldCheck size={21} strokeWidth={2.5} />
              <span className="signal-pulse absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[#ee705e] ring-2 ring-[#142c33]" />
            </div>
            <div>
              <div className="text-[15px] font-extrabold tracking-[-.02em] text-white">CrowdSentinel</div>
              <div className="font-mono text-[9px] uppercase tracking-[.19em] text-[#8da4a3]">Operations workspace</div>
            </div>
          </Link>
        </div>
        <div className="px-4 pt-7">
          <div className="mb-3 px-3 font-mono text-[9px] font-medium uppercase tracking-[.2em] text-[#77908e]">Workspace</div>
          <nav className="space-y-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`} onClick={() => setMobileOpen(false)} className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-semibold transition ${activePath === href ? 'bg-[#24565a] text-white' : 'text-[#a9bfbc] hover:bg-[#1d4248] hover:text-white'}`}>
                <Icon size={17} strokeWidth={activePath === href ? 2.4 : 1.9} />
                <span>{label}</span>
                {href === '/alerts' && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#f4c84d]" />}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-4">
          <Link href="/settings" data-testid="link-settings" onClick={() => setMobileOpen(false)} className={`mb-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-semibold ${activePath === '/settings' ? 'bg-[#24565a] text-white' : 'text-[#a9bfbc] hover:bg-[#1d4248] hover:text-white'}`}>
            <Settings2 size={17} /> Settings
          </Link>
          <Link href="/about" data-testid="link-about" onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-semibold ${activePath === '/about' ? 'bg-[#24565a] text-white' : 'text-[#a9bfbc] hover:bg-[#1d4248] hover:text-white'}`}>
            <CircleHelp size={17} /> Methodology
          </Link>
          <div className="mt-5 border-t border-[#31494d] pt-4">
            <div className="flex items-center gap-3 px-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d5e7df] text-xs font-extrabold text-[#24565a]">SJ</div>
              <div className="min-w-0">
                <div className="truncate text-[12px] font-bold text-white">Safety desk</div>
                <div className="truncate font-mono text-[9px] uppercase tracking-widest text-[#77908e]">On duty · UTC−07</div>
              </div>
            </div>
          </div>
        </div>
      </aside>
      {mobileOpen && <button data-testid="button-close-mobile-nav" aria-label="Close navigation" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-30 bg-[#0e2529]/50 lg:hidden" />}
      <main className="min-h-[100dvh] lg:pl-[250px]">
        <header className="sticky top-0 z-20 flex h-[70px] items-center justify-between border-b border-[#dce7e5] bg-[#f1f6f5]/95 px-5 backdrop-blur-md sm:px-8">
          <div className="flex items-center gap-3">
            <button data-testid="button-open-mobile-nav" aria-label="Open navigation" onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-[#456167] hover:bg-[#e1eeeb] lg:hidden"><Menu size={19} /></button>
            <div className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[.15em] text-[#809094] sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-[#2f9a83]" /> System operational</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-[#d3e2df] bg-white/60 px-3 py-1.5 sm:flex"><span className="font-mono text-[10px] text-[#829194]">Environment</span><span className="h-1.5 w-1.5 rounded-full bg-[#f4c84d]" /><span className="text-xs font-bold text-[#456167]">Demo / live data</span></div>
            <Link href="/about" data-testid="link-header-help" className="rounded-lg p-2 text-[#6f8184] transition hover:bg-[#e1eeeb] hover:text-[#12696d]"><Info size={18} /></Link>
          </div>
        </header>
        <div className="mx-auto max-w-[1440px] p-5 sm:p-8">{children}</div>
      </main>
    </div>
  );
}

function DashboardPage() {
  const queryClient = useQueryClient();
  const dashboardQuery = useGetDashboard();
  const dashboard = dashboardQuery.data;
  const refresh = () => queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
  if (dashboardQuery.isLoading) return <><SectionTitle eyebrow="Live operations" title="Situation overview" detail="Reading current conditions from the active monitoring source." /><div className="grid gap-4 md:grid-cols-4"><MetricSkeleton /><MetricSkeleton /><MetricSkeleton /><MetricSkeleton /></div><div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_.65fr]"><MetricSkeleton /><MetricSkeleton /></div></>;
  if (dashboardQuery.isError) return <><SectionTitle eyebrow="Live operations" title="Situation overview" /><PageError retry={refresh} /></>;
  if (!dashboard) return <><SectionTitle eyebrow="Live operations" title="Situation overview" /><EmptyState icon={Activity} title="No monitoring signal yet" body="Start a monitor session or connect a camera to populate the live overview." /></>;

  const riskTone = toneForRisk(dashboard.riskLevel);
  return (
    <div className="scan-in">
      <SectionTitle eyebrow={`Live operations · refreshed ${formatTime(dashboard.updatedAt)}`} title="Situation overview" detail="An explainable read on what is happening right now." action={<button data-testid="button-refresh-dashboard" onClick={refresh} className="inline-flex items-center gap-2 rounded-lg border border-[#cadbd8] bg-white px-3.5 py-2 text-xs font-bold text-[#456167] transition hover:border-[#12696d] hover:text-[#12696d]"><RefreshCw size={14} /> Refresh signal</button>} />
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Badge tone={dashboard.mode?.toLowerCase().includes('demo') ? 'amber' : 'teal'}><span className="h-1.5 w-1.5 rounded-full bg-current" /> {dashboard.mode || 'Live mode'}</Badge>
        <Badge tone="slate"><Database size={11} /> {dashboard.source || 'Unknown source'}</Badge>
        <span className="ml-1 text-xs text-[#809094]">Last update {formatTime(dashboard.updatedAt)}</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="People in frame" value={dashboard.currentCount.toLocaleString()} detail="Current count" icon={Activity} tone="teal" testId="metric-current-count" />
        <MetricCard label="Crowd density" value={`${dashboard.density.toFixed(1)}%`} detail="Relative image-space occupancy" icon={Layers3} tone={riskTone} testId="metric-density" />
        <MetricCard label="Movement speed" value={`${dashboard.movementSpeed.toFixed(1)} m/s`} detail={`${dashboard.direction || 'No direction'} flow`} icon={ArrowUpRight} tone="green" testId="metric-movement-speed" />
        <MetricCard label="Active alerts" value={String(dashboard.activeAlerts)} detail={`${dashboard.fps.toFixed(0)} FPS processing`} icon={Bell} tone={dashboard.activeAlerts > 0 ? 'amber' : 'green'} testId="metric-active-alerts" />
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
        <section className="overflow-hidden rounded-2xl border border-[#d8e5e2] bg-white shadow-[0_10px_30px_rgba(28,64,67,.05)]">
          <div className="flex items-center justify-between border-b border-[#e4ecea] px-5 py-4">
            <div><div className="font-mono text-[10px] uppercase tracking-[.17em] text-[#8b9b9d]">Current scene</div><h2 className="mt-1 text-[17px] font-extrabold tracking-[-.02em]">Risk posture</h2></div>
            <Badge tone={riskTone}>{dashboard.riskLevel} · {dashboard.riskScore.toFixed(0)}/100</Badge>
          </div>
          <div className="grid gap-6 p-5 md:grid-cols-[.8fr_1.2fr]">
            <div className="rounded-xl bg-[#eaf2f0] p-5">
              <div className="mb-4 flex items-start justify-between"><span className="text-xs font-bold uppercase tracking-wider text-[#688084]">Composite risk</span><Gauge className="text-[#12696d]" size={20} /></div>
              <div data-testid="text-risk-score" className="text-5xl font-extrabold tracking-[-.06em] text-[#20343b]">{dashboard.riskScore.toFixed(0)}<span className="ml-1 text-lg font-bold text-[#8da0a1]">/100</span></div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#d5e2df]"><div className={`h-full rounded-full ${riskTone === 'red' ? 'bg-[#d65349]' : riskTone === 'amber' ? 'bg-[#e8b928]' : 'bg-[#2e9382]'}`} style={{ width: `${Math.min(100, Math.max(0, dashboard.riskScore))}%` }} /></div>
              <p className="mt-3 text-xs leading-5 text-[#708286]">Score is a weighted signal, not a prediction. Review the contributing factors before acting.</p>
            </div>
            <div>
              <div className="mb-3 flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider text-[#688084]">Why this score</span><span className="font-mono text-[10px] text-[#9aa8a8]">weighted inputs</span></div>
            <FactorBar label="Density" value={dashboard.factors.density} color="teal" />
            <FactorBar label="Movement change" value={dashboard.factors.movementChange} color="amber" />
            <FactorBar label="Density increase" value={dashboard.factors.densityIncrease} color="red" />
            <FactorBar label="Flow irregularity" value={dashboard.factors.flowIrregularity} color="slate" />
              <div className="mt-5 flex items-center justify-between border-t border-[#e4ecea] pt-4"><span className="text-xs text-[#708286]">Movement state</span><span data-testid="text-movement-state" className="text-sm font-extrabold text-[#20343b]">{dashboard.movementState || 'No movement state'}</span></div>
            </div>
          </div>
        </section>
        <section className="rounded-2xl border border-[#d8e5e2] bg-[#17343a] p-5 text-[#e0edeb] shadow-[0_10px_30px_rgba(28,64,67,.08)]">
          <div className="flex items-center justify-between"><div><div className="font-mono text-[10px] uppercase tracking-[.17em] text-[#80a4a0]">Operator brief</div><h2 className="mt-1 text-[17px] font-extrabold text-white">What changed</h2></div><Sparkles size={18} className="text-[#f4c84d]" /></div>
          <div className="mt-7 space-y-5">
            <BriefLine icon={Layers3} label="Density" value={`${dashboard.density.toFixed(1)}%`} note="relative image-space occupancy" />
            <BriefLine icon={ArrowUpRight} label="Flow" value={dashboard.direction || 'Unresolved'} note={dashboard.movementState || 'movement state unavailable'} />
            <BriefLine icon={Clock3} label="Freshness" value={formatTime(dashboard.updatedAt)} note="last successful frame" />
          </div>
          <Link href="/alerts" data-testid="link-view-alerts" className="mt-8 flex items-center justify-between border-t border-[#2c5053] pt-4 text-xs font-bold text-[#f4c84d] hover:text-white">Review alert history <ChevronRight size={15} /></Link>
        </section>
      </div>
    </div>
  );
}

function MetricCard({ label, value, detail, icon: Icon, tone, testId }: { label: string; value: string; detail: string; icon: LucideIcon; tone: Tone; testId: string }) {
  return <div data-testid={testId} className="rounded-2xl border border-[#d8e5e2] bg-white p-5 shadow-[0_8px_24px_rgba(28,64,67,.04)]"><div className="flex items-start justify-between"><span className="text-[11px] font-bold uppercase tracking-[.1em] text-[#809094]">{label}</span><div className={`rounded-lg border p-2 ${toneClasses(tone)}`}><Icon size={16} /></div></div><div className="mt-4 text-[28px] font-extrabold tracking-[-.06em] text-[#20343b]">{value}</div><div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-[#9aa8a8]">{detail}</div></div>;
}

function FactorBar({ label, value, color }: { label: string; value: number; color: Tone }) {
  const percent = Math.min(100, Math.max(0, value));
  return <div className="mb-4"><div className="mb-1.5 flex justify-between text-xs"><span className="font-semibold text-[#546b70]">{label}</span><span className="font-mono text-[10px] text-[#7d8f91]">{percent.toFixed(0)}%</span></div><div className="h-1.5 rounded-full bg-[#edf2f0]"><div className={`h-full rounded-full ${color === 'red' ? 'bg-[#d65349]' : color === 'amber' ? 'bg-[#e6b528]' : color === 'slate' ? 'bg-[#77969a]' : 'bg-[#329383]'}`} style={{ width: `${percent}%` }} /></div></div>;
}

function BriefLine({ icon: Icon, label, value, note }: { icon: LucideIcon; label: string; value: string; note: string }) {
  return <div className="flex gap-3"><div className="mt-0.5 text-[#f4c84d]"><Icon size={17} /></div><div><div className="text-[11px] font-bold uppercase tracking-wider text-[#8fb0ab]">{label}</div><div className="mt-1 text-xl font-extrabold text-white">{value}</div><div className="mt-0.5 text-xs text-[#88a3a0]">{note}</div></div></div>;
}

function MonitorPage() {
  const queryClient = useQueryClient();
  const [source, setSource] = useState('Demo plaza feed');
  const [mode, setMode] = useState('demo');
  const [selectedFile, setSelectedFile] = useState('');
  const [sessionId, setSessionId] = useState('');
  const startAnalysis = useStartAnalysis();
  const sessionQuery = useGetAnalysisSession(sessionId, { query: { enabled: Boolean(sessionId), queryKey: getGetAnalysisSessionQueryKey(sessionId), refetchInterval: sessionId ? 1400 : false } });
  const session = sessionQuery.data;
  const canStart = source.trim().length > 0 && !startAnalysis.isPending;

  const handleStart = () => {
    if (!canStart) return;
    startAnalysis.mutate({ data: { source: selectedFile || source.trim(), mode } }, { onSuccess: (created) => { setSessionId(created.id); queryClient.invalidateQueries({ queryKey: getGetAnalysisSessionQueryKey(created.id) }); } });
  };

  return <div className="scan-in"><SectionTitle eyebrow="Analysis lab" title="Monitor a source" detail="Run a demo or uploaded-video analysis and watch the read become more precise." />
    <div className="grid gap-5 lg:grid-cols-[.86fr_1.14fr]">
      <section className="rounded-2xl border border-[#d8e5e2] bg-white p-5 shadow-[0_10px_30px_rgba(28,64,67,.05)] sm:p-6">
        <div className="mb-5 flex items-center justify-between"><div><div className="font-mono text-[10px] uppercase tracking-[.17em] text-[#8b9b9d]">01 / Source</div><h2 className="mt-1 text-[17px] font-extrabold">Choose input</h2></div><Badge tone={mode === 'demo' ? 'amber' : 'teal'}>{mode === 'demo' ? 'Demo mode' : 'Uploaded video'}</Badge></div>
        <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-[#edf3f1] p-1"><button data-testid="button-mode-demo" onClick={() => setMode('demo')} className={`rounded-lg px-3 py-2.5 text-xs font-bold transition ${mode === 'demo' ? 'bg-white text-[#12696d] shadow-sm' : 'text-[#718285]'}`}><Radio size={14} className="mr-1.5 inline" /> Demo feed</button><button data-testid="button-mode-upload" onClick={() => setMode('upload')} className={`rounded-lg px-3 py-2.5 text-xs font-bold transition ${mode === 'upload' ? 'bg-white text-[#12696d] shadow-sm' : 'text-[#718285]'}`}><Upload size={14} className="mr-1.5 inline" /> Upload video</button></div>
        {mode === 'demo' ? <button data-testid="button-select-demo-source" onClick={() => setSource(source === 'Demo plaza feed' ? 'Station concourse feed' : 'Demo plaza feed')} className="group flex w-full items-center justify-between rounded-xl border border-[#d4e2df] bg-[#f8fbfa] p-4 text-left transition hover:border-[#12696d]"><div className="flex items-center gap-3"><div className="rounded-lg bg-[#dff0ed] p-2.5 text-[#12696d]"><Video size={19} /></div><div><div className="text-sm font-extrabold text-[#20343b]">{source}</div><div className="mt-1 text-xs text-[#829194]">Synthetic continuous feed · 1080p</div></div></div><ChevronRight className="text-[#9aabad] transition group-hover:translate-x-1 group-hover:text-[#12696d]" size={17} /></button> : <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#b9cfcc] bg-[#f8fbfa] px-5 py-10 text-center transition hover:border-[#12696d] hover:bg-[#f2f9f7]"><input data-testid="input-video-upload" type="file" accept="video/*" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) { setSelectedFile(file.name); setSource(file.name); } }} /><div className="rounded-lg bg-[#dff0ed] p-2.5 text-[#12696d]"><FileVideo size={21} /></div><div className="mt-3 text-sm font-extrabold text-[#20343b]">{selectedFile || 'Drop a video or browse files'}</div><div className="mt-1 text-xs text-[#829194]">MP4 or MOV · source name is sent to the analysis service</div></label>}
        <div className="mt-6 border-t border-[#e4ecea] pt-5"><div className="mb-2 flex justify-between"><label htmlFor="analysis-source" className="text-xs font-bold uppercase tracking-wider text-[#688084]">Source label</label><span className="font-mono text-[10px] text-[#9aa8a8]">{source.length}/80</span></div><input data-testid="input-analysis-source" id="analysis-source" value={source} maxLength={80} onChange={(event) => setSource(event.target.value)} className="w-full rounded-lg border border-[#d3e1de] bg-[#fbfdfc] px-3.5 py-3 text-sm text-[#20343b] outline-none transition placeholder:text-[#a0acad] focus:border-[#12696d] focus:ring-2 focus:ring-[#12696d]/10" placeholder="Name this source" /></div>
        {startAnalysis.isError && <div data-testid="status-start-error" className="mt-4 rounded-lg bg-[#fff1ee] px-3 py-2 text-xs font-semibold text-[#a0453d]">Could not start this session. Check the source and try again.</div>}
        <button data-testid="button-start-analysis" disabled={!canStart} onClick={handleStart} className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[#12696d] px-4 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#0d5559] disabled:cursor-not-allowed disabled:opacity-50">{startAnalysis.isPending ? <><Loader2 size={16} className="animate-spin" /> Starting session</> : <><Play size={16} fill="currentColor" /> Start analysis</>}</button>
      </section>
      <section className="rounded-2xl border border-[#d8e5e2] bg-[#17343a] p-5 text-[#e0edeb] shadow-[0_10px_30px_rgba(28,64,67,.08)] sm:p-6">
        <div className="flex items-start justify-between"><div><div className="font-mono text-[10px] uppercase tracking-[.17em] text-[#80a4a0]">02 / Progressive read</div><h2 className="mt-1 text-[17px] font-extrabold text-white">Session telemetry</h2></div>{session && <Badge tone={session.status?.toLowerCase().includes('complete') ? 'green' : 'amber'}>{session.status}</Badge>}</div>
        {!sessionId ? <div className="flex min-h-[370px] flex-col items-center justify-center text-center"><div className="bg-grid mb-5 flex h-24 w-24 items-center justify-center rounded-2xl border border-[#31575a] text-[#f4c84d]"><Activity size={32} /></div><div className="text-sm font-bold text-white">No active session</div><p className="mt-2 max-w-xs text-xs leading-5 text-[#8eaaa6]">Start an analysis to see frames, count, density, and risk appear progressively here.</p></div> : sessionQuery.isLoading ? <div className="flex min-h-[370px] items-center justify-center"><Loader2 className="animate-spin text-[#f4c84d]" size={24} /></div> : sessionQuery.isError ? <div className="flex min-h-[370px] items-center justify-center text-center"><div><CircleOff className="mx-auto mb-3 text-[#ee958a]" size={25} /><div className="text-sm font-bold text-white">Session read unavailable</div><button data-testid="button-retry-session" onClick={() => sessionQuery.refetch()} className="mt-4 text-xs font-bold text-[#f4c84d]">Retry session</button></div></div> : session ? <SessionRead session={session} /> : null}
      </section>
    </div>
  </div>;
}

function SessionRead({ session }: { session: AnalysisSession }) {
  const current = session.current;
  const progress = Math.min(100, Math.max(0, session.progress));
  return <div className="mt-7"><div className="flex items-end justify-between"><div><div className="font-mono text-[10px] uppercase tracking-widest text-[#7fa19d]">Processed frames</div><div data-testid="text-processed-frames" className="mt-1 text-3xl font-extrabold text-white">{session.processedFrames.toLocaleString()}<span className="ml-1 text-sm font-medium text-[#789794]">/ {session.totalFrames.toLocaleString()}</span></div></div><div data-testid="text-session-progress" className="font-mono text-sm font-medium text-[#f4c84d]">{progress.toFixed(0)}%</div></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-[#2c5053]"><div className="h-full rounded-full bg-[#f4c84d] transition-all duration-500" style={{ width: `${progress}%` }} /></div><div className="mt-7 grid grid-cols-2 gap-3"><DarkMetric label="People" value={String(current.currentCount)} /><DarkMetric label="Density" value={`${current.density.toFixed(1)}`} /><DarkMetric label="Risk score" value={`${current.riskScore.toFixed(0)}`} /><DarkMetric label="Speed" value={`${current.movementSpeed.toFixed(1)} m/s`} /></div><div className="mt-6 rounded-xl border border-[#31575a] p-4"><div className="flex justify-between text-xs"><span className="text-[#8eaaa6]">Current state</span><span data-testid="text-session-risk" className="font-bold text-[#f4c84d]">{current.riskLevel} · {current.movementState}</span></div><div className="mt-3 flex items-center gap-2 text-xs text-[#8eaaa6]"><span className="h-2 w-2 rounded-full bg-[#43b99f]" /> {session.status} · started {formatTime(session.startedAt)}</div></div></div>;
}

function DarkMetric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-[#204349] p-3"><div className="text-[10px] font-bold uppercase tracking-wider text-[#8eaaa6]">{label}</div><div className="mt-2 text-xl font-extrabold text-white">{value}</div></div>;
}

function CamerasPage() {
  const queryClient = useQueryClient();
  const camerasQuery = useGetCameras();
  const cameras = camerasQuery.data ?? [];
  const createCamera = useCreateCamera();
  const updateCamera = useUpdateCamera();
  const deleteCamera = useDeleteCamera();
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', location: '', source: '', sourceType: 'rtsp' });
  const [notice, setNotice] = useState('');
  const openCreate = () => { setEditingId(null); setForm({ name: '', location: '', source: '', sourceType: 'rtsp' }); setFormOpen(true); setNotice(''); };
  const openEdit = (camera: { id: string; name: string; location: string; source: string; sourceType: string }) => { setEditingId(camera.id); setForm({ name: camera.name, location: camera.location, source: camera.source, sourceType: camera.sourceType }); setFormOpen(true); setNotice(''); };
  const saveCamera = () => {
    if (!form.name.trim() || !form.location.trim() || !form.source.trim()) { setNotice('Name, location, and source are required.'); return; }
    if (editingId) updateCamera.mutate({ cameraId: editingId, data: form }, { onSuccess: () => { setFormOpen(false); setNotice('Camera configuration updated.'); queryClient.invalidateQueries({ queryKey: getGetCamerasQueryKey() }); }, onError: () => setNotice('Could not update camera.') });
    else createCamera.mutate({ data: form }, { onSuccess: () => { setFormOpen(false); setNotice('Camera added to workspace.'); queryClient.invalidateQueries({ queryKey: getGetCamerasQueryKey() }); }, onError: () => setNotice('Could not add camera.') });
  };
  const removeCamera = (id: string) => { if (!window.confirm('Remove this camera configuration?')) return; deleteCamera.mutate({ cameraId: id }, { onSuccess: () => { setNotice('Camera removed.'); queryClient.invalidateQueries({ queryKey: getGetCamerasQueryKey() }); }, onError: () => setNotice('Could not remove camera.') }); };
  if (camerasQuery.isLoading) return <><SectionTitle eyebrow="Sources" title="Camera configurations" /><div className="space-y-3"><MetricSkeleton /><MetricSkeleton /><MetricSkeleton /></div></>;
  if (camerasQuery.isError) return <><SectionTitle eyebrow="Sources" title="Camera configurations" /><PageError retry={() => camerasQuery.refetch()} /></>;
  return <div className="scan-in"><SectionTitle eyebrow="Sources" title="Camera configurations" detail={`${cameras.length} configured source${cameras.length === 1 ? '' : 's'} in this workspace.`} action={<button data-testid="button-add-camera" onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-[#12696d] px-3.5 py-2.5 text-xs font-extrabold text-white transition hover:bg-[#0d5559]"><Plus size={15} /> Add camera</button>} />
    {notice && <div data-testid="status-camera-notice" className="mb-5 flex items-center gap-2 rounded-lg border border-[#b9dfda] bg-[#eaf7f4] px-3.5 py-3 text-xs font-bold text-[#12696d]"><Check size={15} /> {notice}<button data-testid="button-dismiss-camera-notice" className="ml-auto" onClick={() => setNotice('')}><X size={15} /></button></div>}
    {formOpen && <CameraForm form={form} setForm={setForm} editing={Boolean(editingId)} pending={createCamera.isPending || updateCamera.isPending} notice={notice} onCancel={() => setFormOpen(false)} onSave={saveCamera} />}
    {cameras.length === 0 ? <EmptyState icon={Camera} title="No cameras configured" body="Add a source to give the operations desk a live signal to work with." /> : <div className="overflow-hidden rounded-2xl border border-[#d8e5e2] bg-white shadow-[0_10px_30px_rgba(28,64,67,.05)]"><div className="hidden grid-cols-[1.4fr_1fr_1fr_.8fr_40px] gap-4 border-b border-[#e4ecea] bg-[#f8fbfa] px-5 py-3 font-mono text-[9px] uppercase tracking-[.16em] text-[#8b9b9d] md:grid"><span>Camera</span><span>Source</span><span>Type</span><span>Last active</span><span /></div>{cameras.map((camera) => <div data-testid={`row-camera-${camera.id}`} key={camera.id} className="grid gap-3 border-b border-[#edf2f0] px-5 py-4 last:border-b-0 md:grid-cols-[1.4fr_1fr_1fr_.8fr_40px] md:items-center md:gap-4"><div className="flex min-w-0 items-center gap-3"><div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${camera.status?.toLowerCase() === 'active' || camera.status?.toLowerCase() === 'online' ? 'bg-[#e2f3ee] text-[#23816d]' : 'bg-[#edf1f2] text-[#819093]'}`}><Camera size={17} /></div><div className="min-w-0"><div className="truncate text-sm font-extrabold text-[#20343b]">{camera.name}</div><div className="mt-0.5 flex items-center gap-1 text-xs text-[#809094]"><MapPin size={11} /> {camera.location}</div></div></div><div className="truncate font-mono text-xs text-[#5e7378]">{camera.source}</div><div><Badge tone="slate">{camera.sourceType}</Badge><span className="ml-2 text-[11px] text-[#819093]">{camera.status}</span></div><div className="text-xs text-[#708286]">{formatDate(camera.lastActive)}<br /><span className="font-mono text-[10px] text-[#9aa8a8]">{formatTime(camera.lastActive)}</span></div><div className="flex items-center gap-1 md:justify-end"><button data-testid={`button-edit-camera-${camera.id}`} aria-label={`Edit ${camera.name}`} onClick={() => openEdit(camera)} className="rounded-lg p-2 text-[#789094] hover:bg-[#eaf3f1] hover:text-[#12696d]"><Settings2 size={15} /></button><button data-testid={`button-delete-camera-${camera.id}`} aria-label={`Delete ${camera.name}`} onClick={() => removeCamera(camera.id)} className="rounded-lg p-2 text-[#789094] hover:bg-[#fff0ee] hover:text-[#ad342d]"><Trash2 size={15} /></button></div></div>)}</div>}
  </div>;
}

function CameraForm({ form, setForm, editing, pending, notice, onCancel, onSave }: { form: { name: string; location: string; source: string; sourceType: string }; setForm: (form: { name: string; location: string; source: string; sourceType: string }) => void; editing: boolean; pending: boolean; notice: string; onCancel: () => void; onSave: () => void }) {
  const update = (key: keyof typeof form, value: string) => setForm({ ...form, [key]: value });
  return <section data-testid="panel-camera-form" className="mb-5 rounded-2xl border border-[#b9dfda] bg-[#f8fcfb] p-5 shadow-[0_8px_24px_rgba(28,64,67,.04)]"><div className="mb-5 flex items-center justify-between"><div><div className="font-mono text-[10px] uppercase tracking-[.17em] text-[#8b9b9d]">{editing ? 'Edit source' : 'New source'}</div><h2 className="mt-1 text-[17px] font-extrabold">{editing ? 'Update camera configuration' : 'Add a camera'}</h2></div><button data-testid="button-close-camera-form" onClick={onCancel} className="rounded-lg p-2 text-[#789094] hover:bg-[#e5f1ee]"><X size={17} /></button></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Camera name" value={form.name} onChange={(v) => update('name', v)} testId="input-camera-name" placeholder="North gate" /><Field label="Location" value={form.location} onChange={(v) => update('location', v)} testId="input-camera-location" placeholder="Main entrance" /><Field label="Source address" value={form.source} onChange={(v) => update('source', v)} testId="input-camera-source" placeholder="rtsp://..." /><div><label htmlFor="camera-source-type" className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#688084]">Source type</label><select data-testid="select-camera-source-type" id="camera-source-type" value={form.sourceType} onChange={(e) => update('sourceType', e.target.value)} className="w-full rounded-lg border border-[#d3e1de] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#12696d]"><option value="rtsp">RTSP stream</option><option value="hls">HLS stream</option><option value="upload">Uploaded video</option><option value="demo">Demo feed</option></select></div></div>{notice && <p data-testid="status-camera-form-error" className="mt-3 text-xs font-bold text-[#ad342d]">{notice}</p>}<div className="mt-5 flex justify-end gap-2"><button data-testid="button-cancel-camera" onClick={onCancel} className="rounded-lg px-4 py-2.5 text-xs font-bold text-[#718285] hover:bg-[#eaf2f0]">Cancel</button><button data-testid="button-save-camera" onClick={onSave} disabled={pending} className="inline-flex items-center gap-2 rounded-lg bg-[#12696d] px-4 py-2.5 text-xs font-extrabold text-white disabled:opacity-50">{pending && <Loader2 size={14} className="animate-spin" />}{editing ? 'Save changes' : 'Add camera'}</button></div></section>;
}

function Field({ label, value, onChange, testId, placeholder }: { label: string; value: string; onChange: (value: string) => void; testId: string; placeholder: string }) {
  return <div><label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#688084]">{label}</label><input data-testid={testId} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-lg border border-[#d3e1de] bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-[#a0acad] focus:border-[#12696d] focus:ring-2 focus:ring-[#12696d]/10" /></div>;
}

function AlertsPage() {
  const [draftSearch, setDraftSearch] = useState('');
  const [search, setSearch] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [status, setStatus] = useState('');
  const params = useMemo(() => ({ ...(search ? { search } : {}), ...(riskLevel ? { riskLevel } : {}), ...(status ? { status } : {}) }), [riskLevel, search, status]);
  const alertsQuery = useGetAlerts(params, { query: { queryKey: getGetAlertsQueryKey(params) } });
  const alerts = alertsQuery.data ?? [];
  const applySearch = (event: FormEvent) => { event.preventDefault(); setSearch(draftSearch.trim()); };
  return <div className="scan-in"><SectionTitle eyebrow="Events" title="Alert history" detail="Search the record by source, condition, or operator status." action={<div className="font-mono text-[10px] uppercase tracking-wider text-[#8b9b9d]">{alerts.length} results</div>} />
    <section className="mb-5 rounded-2xl border border-[#d8e5e2] bg-white p-4 shadow-[0_8px_24px_rgba(28,64,67,.04)]"><form onSubmit={applySearch} className="flex flex-col gap-3 lg:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#92a2a3]" size={16} /><input data-testid="input-alert-search" type="search" value={draftSearch} onChange={(e) => setDraftSearch(e.target.value)} placeholder="Search cameras or conditions" className="w-full rounded-lg border border-[#d3e1de] bg-[#fbfdfc] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#12696d]" /></div><div className="flex gap-2"><select data-testid="select-alert-risk" value={riskLevel} onChange={(e) => setRiskLevel(e.target.value)} className="rounded-lg border border-[#d3e1de] bg-[#fbfdfc] px-3 py-2.5 text-xs font-bold text-[#526a6f] outline-none focus:border-[#12696d]"><option value="">All risk levels</option><option value="critical">Critical</option><option value="high">High</option><option value="warning">Warning</option><option value="low">Low</option></select><select data-testid="select-alert-status" value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-[#d3e1de] bg-[#fbfdfc] px-3 py-2.5 text-xs font-bold text-[#526a6f] outline-none focus:border-[#12696d]"><option value="">All statuses</option><option value="open">Open</option><option value="acknowledged">Acknowledged</option><option value="resolved">Resolved</option></select><button data-testid="button-apply-alert-search" type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#17343a] px-4 py-2.5 text-xs font-extrabold text-white hover:bg-[#12696d]"><ListFilter size={14} /> Apply</button></div></form></section>
    {alertsQuery.isLoading ? <div className="space-y-3"><MetricSkeleton /><MetricSkeleton /><MetricSkeleton /></div> : alertsQuery.isError ? <PageError retry={() => alertsQuery.refetch()} /> : alerts.length === 0 ? <EmptyState icon={Bell} title="No alerts match those filters" body="Try a broader search or clear one of the filters. New events will appear here as the system detects them." /> : <div className="space-y-3">{alerts.map((alert) => <AlertRow key={alert.id} alert={alert} />)}</div>}
  </div>;
}

function AlertRow({ alert }: { alert: { id: string; timestamp: string; camera: string; riskLevel: string; riskScore: number; conditions: string[]; recommendedAction: string; status: string } }) {
  const [expanded, setExpanded] = useState(false);
  const tone = toneForRisk(alert.riskLevel);
  return <article data-testid={`row-alert-${alert.id}`} className={`rounded-2xl border bg-white shadow-[0_6px_20px_rgba(28,64,67,.035)] transition ${expanded ? 'border-[#b9dfda]' : 'border-[#d8e5e2]'}`}><button data-testid={`button-expand-alert-${alert.id}`} onClick={() => setExpanded(!expanded)} className="flex w-full items-center gap-4 p-4 text-left sm:p-5"><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${toneClasses(tone)}`}><AlertTriangle size={18} /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="text-sm font-extrabold text-[#20343b]">{alert.camera}</span><Badge tone={tone}>{alert.riskLevel} · {alert.riskScore.toFixed(0)}</Badge><Badge tone={alert.status?.toLowerCase() === 'resolved' ? 'green' : 'slate'}>{alert.status}</Badge></div><div className="mt-1 truncate text-xs text-[#76878a]">{alert.conditions?.join(' · ') || 'Condition details unavailable'}</div></div><div className="hidden text-right sm:block"><div className="font-mono text-xs text-[#62777b]">{formatTime(alert.timestamp)}</div><div className="mt-1 text-[10px] uppercase tracking-wider text-[#a0acad]">{formatDate(alert.timestamp)}</div></div><ChevronRight size={16} className={`shrink-0 text-[#9aabad] transition-transform ${expanded ? 'rotate-90' : ''}`} /></button>{expanded && <div className="border-t border-[#e4ecea] bg-[#f8fbfa] px-5 py-4 sm:pl-[76px]"><div className="grid gap-4 text-xs sm:grid-cols-2"><div><div className="font-mono text-[9px] uppercase tracking-widest text-[#8b9b9d]">Recommended action</div><p className="mt-1.5 font-bold leading-5 text-[#405b60]">{alert.recommendedAction || 'No recommendation supplied.'}</p></div><div><div className="font-mono text-[9px] uppercase tracking-widest text-[#8b9b9d]">Recorded</div><p className="mt-1.5 font-bold text-[#405b60]">{formatDate(alert.timestamp)} at {formatTime(alert.timestamp)}</p></div></div></div>}</article>;
}

function AnalyticsPage() {
  const analyticsQuery = useGetAnalytics({ query: { queryKey: getGetAnalyticsQueryKey() } });
  const analytics = analyticsQuery.data;
  if (analyticsQuery.isLoading) return <><SectionTitle eyebrow="Evidence" title="Analytics" /><div className="grid gap-5 lg:grid-cols-2"><MetricSkeleton /><MetricSkeleton /></div></>;
  if (analyticsQuery.isError) return <><SectionTitle eyebrow="Evidence" title="Analytics" /><PageError retry={() => analyticsQuery.refetch()} /></>;
  if (!analytics) return <><SectionTitle eyebrow="Evidence" title="Analytics" /><EmptyState icon={BarChart3} title="No processed analysis yet" body="Complete an analysis session to make trends and evaluation metrics available." /></>;
  const maxCount = Math.max(...analytics.points.map((point) => point.count), 1);
  return <div className="scan-in"><SectionTitle eyebrow="Evidence · processed trends" title="Analytics" detail="Trends from completed analysis sessions, kept separate from the live read." action={<Badge tone={analytics.evaluation.status?.toLowerCase().includes('ready') ? 'green' : 'amber'}>{analytics.evaluation.status}</Badge>} />
    <div className="grid gap-5 xl:grid-cols-[1.3fr_.7fr]"><section className="rounded-2xl border border-[#d8e5e2] bg-white p-5 shadow-[0_10px_30px_rgba(28,64,67,.05)] sm:p-6"><div className="flex items-center justify-between"><div><div className="font-mono text-[10px] uppercase tracking-[.17em] text-[#8b9b9d]">Observed over time</div><h2 className="mt-1 text-[17px] font-extrabold">People in frame</h2></div><Badge tone="teal"><Activity size={11} /> {analytics.points.length} points</Badge></div><div className="mt-8 h-[230px]">{analytics.points.length === 0 ? <div className="flex h-full items-center justify-center text-sm text-[#829194]">No time-series points returned.</div> : <div className="flex h-full items-end gap-1.5 border-b border-l border-[#dce7e5] px-3 pb-0 pt-4">{analytics.points.map((point, index) => <div data-testid={`bar-count-${index}`} key={`${point.time}-${index}`} className="group relative flex h-full flex-1 items-end"><div className="w-full rounded-t-[4px] bg-[#3c9b8a] transition-all duration-300 group-hover:bg-[#f4c84d]" style={{ height: `${Math.max(4, (point.count / maxCount) * 100)}%` }} title={`${point.count} people`} /></div>)}</div>}</div><div className="mt-4 flex justify-between font-mono text-[9px] uppercase tracking-wider text-[#9aa8a8]"><span>{formatTime(analytics.points[0]?.time)}</span><span>{formatTime(analytics.points.at(-1)?.time)}</span></div></section>
      <section className="rounded-2xl border border-[#d8e5e2] bg-white p-5 shadow-[0_10px_30px_rgba(28,64,67,.05)] sm:p-6"><div className="font-mono text-[10px] uppercase tracking-[.17em] text-[#8b9b9d]">Risk distribution</div><h2 className="mt-1 text-[17px] font-extrabold">Alerts by level</h2><div className="mt-7 space-y-4">{analytics.distribution.length === 0 ? <p className="text-sm text-[#829194]">No distribution data returned.</p> : analytics.distribution.map((item) => { const total = Math.max(...analytics.distribution.map((entry) => entry.count), 1); return <div data-testid={`distribution-${item.level}`} key={item.level}><div className="mb-1.5 flex justify-between text-xs"><span className="font-bold capitalize text-[#536b70]">{item.level}</span><span className="font-mono text-[#7f9092]">{item.count}</span></div><div className="h-2 rounded-full bg-[#edf2f0]"><div className={`h-full rounded-full ${toneForRisk(item.level) === 'red' ? 'bg-[#d65349]' : toneForRisk(item.level) === 'amber' ? 'bg-[#e3b42b]' : 'bg-[#3c9b8a]'}`} style={{ width: `${(item.count / total) * 100}%` }} /></div></div>; })}</div><div className="mt-8 border-t border-[#e4ecea] pt-5"><div className="font-mono text-[10px] uppercase tracking-widest text-[#8b9b9d]">Evaluation</div><div className="mt-3 space-y-2">{analytics.evaluation.metrics.map((metric) => <div data-testid={`metric-evaluation-${metric.name}`} key={metric.name} className="flex items-center justify-between text-xs"><span className="text-[#718285]">{metric.name}</span><span className="font-mono font-bold text-[#20343b]">{metric.value}</span></div>)}</div></div></section></div>
    <section className="mt-5 rounded-2xl border border-[#d8e5e2] bg-white p-5 shadow-[0_10px_30px_rgba(28,64,67,.05)] sm:p-6"><div className="flex items-center justify-between"><div><div className="font-mono text-[10px] uppercase tracking-[.17em] text-[#8b9b9d]">Weekly rhythm</div><h2 className="mt-1 text-[17px] font-extrabold">Alerts by day</h2></div><BarChart3 size={18} className="text-[#12696d]" /></div><div className="mt-7 grid grid-cols-7 gap-2 sm:gap-4">{analytics.weeklyAlerts.map((item) => { const max = Math.max(...analytics.weeklyAlerts.map((day) => day.count), 1); return <div data-testid={`weekly-alert-${item.day}`} key={item.day} className="text-center"><div className="flex h-28 items-end justify-center"><div className="w-full max-w-[32px] rounded-t-md bg-[#e0efec]" style={{ height: `${Math.max(6, (item.count / max) * 100)}%` }}><div className="h-1.5 rounded-t-md bg-[#f4c84d]" /></div></div><div className="mt-3 font-mono text-[10px] font-medium uppercase text-[#809094]">{item.day}</div><div className="mt-1 text-xs font-extrabold text-[#536b70]">{item.count}</div></div>; })}</div></section>
  </div>;
}

function SettingsPage() {
  const queryClient = useQueryClient();
  const settingsQuery = useGetRiskSettings();
  const updateSettings = useUpdateRiskSettings();
  const settings = settingsQuery.data;
  const [form, setForm] = useState({ warningThreshold: '', highThreshold: '', criticalThreshold: '', density: '', movement: '', densityChange: '', flow: '' });
  const [initialized, setInitialized] = useState(false);
  if (settings && !initialized) { setForm({ warningThreshold: String(settings.warningThreshold), highThreshold: String(settings.highThreshold), criticalThreshold: String(settings.criticalThreshold), density: String(settings.weights.density), movement: String(settings.weights.movement), densityChange: String(settings.weights.densityChange), flow: String(settings.weights.flow) }); setInitialized(true); }
  if (settingsQuery.isLoading) return <><SectionTitle eyebrow="Control plane" title="Risk settings" /><div className="grid gap-5 lg:grid-cols-2"><MetricSkeleton /><MetricSkeleton /></div></>;
  if (settingsQuery.isError) return <><SectionTitle eyebrow="Control plane" title="Risk settings" /><PageError retry={() => settingsQuery.refetch()} /></>;
  if (!settings) return <><SectionTitle eyebrow="Control plane" title="Risk settings" /><EmptyState icon={SlidersHorizontal} title="Settings are unavailable" body="The risk configuration service did not return a configuration." /></>;
  const save = () => { const payload = { warningThreshold: Number(form.warningThreshold), highThreshold: Number(form.highThreshold), criticalThreshold: Number(form.criticalThreshold), weights: { density: Number(form.density), movement: Number(form.movement), densityChange: Number(form.densityChange), flow: Number(form.flow) } }; if ([payload.warningThreshold, payload.highThreshold, payload.criticalThreshold, ...Object.values(payload.weights)].some((v) => Number.isNaN(v))) return; updateSettings.mutate({ data: payload }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetRiskSettingsQueryKey() }) }); };
  const update = (key: keyof typeof form, value: string) => setForm({ ...form, [key]: value });
  return <div className="scan-in"><SectionTitle eyebrow="Control plane" title="Risk settings" detail="Tune the thresholds and weights used to describe rising hazard conditions." action={<button data-testid="button-save-settings-top" onClick={save} disabled={updateSettings.isPending} className="inline-flex items-center gap-2 rounded-lg bg-[#12696d] px-3.5 py-2.5 text-xs font-extrabold text-white disabled:opacity-50">{updateSettings.isPending && <Loader2 size={14} className="animate-spin" />} Save changes</button>} />
    {updateSettings.isSuccess && <div data-testid="status-settings-saved" className="mb-5 flex items-center gap-2 rounded-lg border border-[#b9dfda] bg-[#eaf7f4] px-3.5 py-3 text-xs font-bold text-[#12696d]"><Check size={15} /> Risk configuration saved.</div>}
    {updateSettings.isError && <div data-testid="status-settings-error" className="mb-5 rounded-lg border border-[#f2bbb4] bg-[#fff1ee] px-3.5 py-3 text-xs font-bold text-[#ad342d]">Could not save risk configuration. Check the values and retry.</div>}
    <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]"><section className="rounded-2xl border border-[#d8e5e2] bg-white p-5 shadow-[0_10px_30px_rgba(28,64,67,.05)] sm:p-6"><div className="flex items-start gap-3"><div className="rounded-lg bg-[#fff4d6] p-2 text-[#956d00]"><Gauge size={18} /></div><div><div className="font-mono text-[10px] uppercase tracking-widest text-[#8b9b9d]">Risk bands</div><h2 className="mt-1 text-[17px] font-extrabold">Thresholds</h2><p className="mt-1 text-xs leading-5 text-[#809094]">Scores at or above each threshold change the operational label.</p></div></div><div className="mt-7 space-y-4"><NumberField label="Warning threshold" hint="Attention requested" value={form.warningThreshold} onChange={(v) => update('warningThreshold', v)} testId="input-warning-threshold" /><NumberField label="High threshold" hint="Review conditions now" value={form.highThreshold} onChange={(v) => update('highThreshold', v)} testId="input-high-threshold" /><NumberField label="Critical threshold" hint="Immediate response" value={form.criticalThreshold} onChange={(v) => update('criticalThreshold', v)} testId="input-critical-threshold" /></div><div className="mt-6 flex gap-2 rounded-lg bg-[#f8fbfa] p-3 text-xs leading-5 text-[#718285]"><Info size={15} className="mt-0.5 shrink-0 text-[#12696d]" />Keep thresholds ordered from lowest to highest so labels remain explainable.</div></section>
      <section className="rounded-2xl border border-[#d8e5e2] bg-white p-5 shadow-[0_10px_30px_rgba(28,64,67,.05)] sm:p-6"><div className="flex items-start gap-3"><div className="rounded-lg bg-[#e4f4f2] p-2 text-[#12696d]"><SlidersHorizontal size={18} /></div><div><div className="font-mono text-[10px] uppercase tracking-widest text-[#8b9b9d]">Composite score</div><h2 className="mt-1 text-[17px] font-extrabold">Signal weights</h2><p className="mt-1 text-xs leading-5 text-[#809094]">Relative influence of each explainable input, from 0 to 1.</p></div></div><div className="mt-7 space-y-4"><NumberField label="Density" value={form.density} onChange={(v) => update('density', v)} testId="input-weight-density" step="0.01" /><NumberField label="Movement" value={form.movement} onChange={(v) => update('movement', v)} testId="input-weight-movement" step="0.01" /><NumberField label="Density change" value={form.densityChange} onChange={(v) => update('densityChange', v)} testId="input-weight-density-change" step="0.01" /><NumberField label="Flow irregularity" value={form.flow} onChange={(v) => update('flow', v)} testId="input-weight-flow" step="0.01" /></div><button data-testid="button-save-settings" onClick={save} disabled={updateSettings.isPending} className="mt-7 w-full rounded-lg bg-[#17343a] px-4 py-3 text-xs font-extrabold text-white hover:bg-[#12696d] disabled:opacity-50">{updateSettings.isPending ? 'Saving configuration…' : 'Save risk configuration'}</button></section></div>
  </div>;
}

function NumberField({ label, hint, value, onChange, testId, step = '1' }: { label: string; hint?: string; value: string; onChange: (value: string) => void; testId: string; step?: string }) {
  return <div className="flex items-center justify-between gap-4 rounded-xl border border-[#e1eae7] bg-[#fbfdfc] p-3.5"><div><div className="text-sm font-bold text-[#405b60]">{label}</div>{hint && <div className="mt-0.5 text-[11px] text-[#8a9a9d]">{hint}</div>}</div><input data-testid={testId} type="number" min="0" max="100" step={step} value={value} onChange={(e) => onChange(e.target.value)} className="w-24 rounded-lg border border-[#d3e1de] bg-white px-3 py-2 text-right font-mono text-sm font-bold text-[#20343b] outline-none focus:border-[#12696d]" /></div>;
}

function AboutPage() {
  return <div className="scan-in"><SectionTitle eyebrow="CrowdSentinel" title="Methodology & limits" detail="A clear account of what the workspace can tell you—and what it cannot." /><div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]"><section className="rounded-2xl border border-[#d8e5e2] bg-white p-6 shadow-[0_10px_30px_rgba(28,64,67,.05)] sm:p-8"><Badge tone="teal"><ShieldCheck size={11} /> Explainable by design</Badge><h2 className="mt-5 max-w-xl text-3xl font-extrabold leading-tight tracking-[-.05em] text-[#20343b]">A signal is only useful when an operator can see its reason.</h2><p className="mt-5 max-w-xl text-[15px] leading-7 text-[#62777b]">CrowdSentinel combines observed density, movement change, density increase, and flow irregularity into a risk score. The workspace keeps the contributing factors beside the score so a team can assess context instead of treating a label as a verdict.</p><div className="mt-8 grid gap-3 sm:grid-cols-2"><MethodCard index="01" title="Observe" body="Frame-level people counts and movement signals are processed from the selected source." /><MethodCard index="02" title="Compare" body="Recent changes are considered alongside the current scene, not in isolation." /><MethodCard index="03" title="Weight" body="Risk settings determine how much each signal contributes to the composite score." /><MethodCard index="04" title="Explain" body="The live view surfaces the factors behind a score for operator review." /></div></section><section className="rounded-2xl border border-[#d8e5e2] bg-[#17343a] p-6 text-[#e0edeb] shadow-[0_10px_30px_rgba(28,64,67,.08)] sm:p-8"><div className="font-mono text-[10px] uppercase tracking-[.18em] text-[#80a4a0]">Read this first</div><h2 className="mt-2 text-xl font-extrabold text-white">Demo mode is not ground truth.</h2><p className="mt-4 text-sm leading-6 text-[#9bb5b1]">Synthetic feeds and processed examples are useful for learning the workflow. They do not represent a real crowd, camera placement, or incident environment.</p><div className="mt-8 space-y-5"><LimitLine title="No identity inference" body="The workspace is designed around aggregate movement and density, not person identification." /><LimitLine title="No guaranteed detection" body="Occlusion, lighting, camera angle, and source quality can reduce the reliability of any frame." /><LimitLine title="No automatic response" body="Scores and recommendations support a trained team; they do not replace human judgment or local procedure." /></div><Link href="/monitor" data-testid="link-about-monitor" className="mt-9 flex items-center justify-between border-t border-[#2c5053] pt-5 text-xs font-extrabold text-[#f4c84d] hover:text-white">Run a demo analysis <ChevronRight size={15} /></Link></section></div><section className="mt-5 rounded-2xl border border-[#d8e5e2] bg-[#e7f1ee] p-5 sm:p-6"><div className="flex flex-wrap items-start gap-4"><div className="rounded-lg bg-white p-2.5 text-[#12696d]"><CircleHelp size={19} /></div><div className="max-w-3xl"><h2 className="text-sm font-extrabold text-[#20343b]">Operational note</h2><p className="mt-1 text-sm leading-6 text-[#62777b]">Use thresholds as a conversation starter with the safety team. Validate them against the specific venue, camera geometry, normal traffic patterns, and escalation plan before relying on them in an active operation.</p></div></div></section></div>;
}

function MethodCard({ index, title, body }: { index: string; title: string; body: string }) {
  return <div className="rounded-xl border border-[#e2ebe8] bg-[#fbfdfc] p-4"><div className="font-mono text-[10px] font-medium text-[#f0b928]">{index}</div><div className="mt-2 text-sm font-extrabold text-[#405b60]">{title}</div><p className="mt-1 text-xs leading-5 text-[#7a8a8d]">{body}</p></div>;
}

function LimitLine({ title, body }: { title: string; body: string }) {
  return <div className="border-l-2 border-[#f4c84d] pl-4"><div className="text-sm font-extrabold text-white">{title}</div><p className="mt-1 text-xs leading-5 text-[#9bb5b1]">{body}</p></div>;
}

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={DashboardPage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/monitor" component={MonitorPage} />
        <Route path="/cameras" component={CamerasPage} />
        <Route path="/alerts" component={AlertsPage} />
        <Route path="/analytics" component={AnalyticsPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route path="/about" component={AboutPage} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
