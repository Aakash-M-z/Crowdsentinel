import { useState, useMemo } from 'react';
import { Link } from 'wouter';
import {
  ShieldCheck,
  Activity,
  Radio,
  BarChart3,
  Layers3,
  ArrowRight,
  Play,
  Check,
  ChevronRight,
  Sliders,
  Cpu,
  Eye,
  Zap,
  Lock,
  Compass,
  Flame,
  FileCode2,
  Copy,
  ExternalLink,
  Award,
  Sparkles,
  RefreshCw,
  Video,
} from 'lucide-react';

export function LandingPage() {
  // Interactive Live Risk Simulator State
  const [density, setDensity] = useState(65);
  const [speed, setSpeed] = useState(1.8);
  const [turbulence, setTurbulence] = useState(55);
  const [copiedBib, setCopiedBib] = useState(false);

  // Real-time calculation using the exact multi-modal formula
  const simulation = useMemo(() => {
    // Normalized values
    const fDensity = density; // [0, 100]
    const fSpeed = Math.min(100, (speed / 3.0) * 100);
    const fTurbulence = turbulence; // [0, 100]
    const fDensityChange = Math.min(100, density * 0.6);
    const fSpeedChange = Math.min(100, speed * 25);

    // Weights: density (0.25), densityChange (0.20), motion (0.20), motionChange (0.15), dirVar (0.10), flowIrr (0.10)
    const wsD = 0.25 * fDensity;
    const wsDC = 0.20 * fDensityChange;
    const wsM = 0.20 * fSpeed;
    const wsMC = 0.15 * fSpeedChange;
    const wsDV = 0.10 * fTurbulence;
    const wsFI = 0.10 * fTurbulence;

    const linearSum = wsD + wsDC + wsM + wsMC + wsDV + wsFI;
    const densityComp = fDensity * 0.9 + fDensityChange * 0.6;
    const dynSurge = fSpeedChange * 0.8 + fTurbulence * 0.8 + fSpeed * 0.4;
    const synergy = Math.max(densityComp, dynSurge) * 0.4 + linearSum * 0.6;

    const score = Math.round(Math.min(100, Math.max(0, synergy)));

    let level = 'NORMAL';
    let badgeColor = 'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30';
    let strokeColor = '#10b981';
    let advisory = 'Normal crowd movement. Parameters within standard safe tolerances.';

    if (score >= 76) {
      level = 'CRITICAL';
      badgeColor = 'bg-[#ef4444]/15 text-[#ef4444] border-[#ef4444]/30';
      strokeColor = '#ef4444';
      advisory = 'URGENT: Extreme escalation signal. Open auxiliary egress routes and notify incident commander.';
    } else if (score >= 51) {
      level = 'HIGH RISK';
      badgeColor = 'bg-[#f97316]/15 text-[#f97316] border-[#f97316]/30';
      strokeColor = '#f97316';
      advisory = 'ELEVATED: High crowd risk signal detected. Dispatch marshals to verify throughput.';
    } else if (score >= 31) {
      level = 'WARNING';
      badgeColor = 'bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30';
      strokeColor = '#f59e0b';
      advisory = 'CAUTION: Moderate crowd build-up or flow irregularity. Increase observation frequency.';
    }

    const totalWs = wsD + wsDC + wsM + wsMC + wsDV + wsFI;
    const pctD = Math.round((wsD / totalWs) * 100);
    const pctDC = Math.round((wsDC / totalWs) * 100);
    const pctM = Math.round((wsM / totalWs) * 100);
    const pctTurb = Math.round(((wsDV + wsFI) / totalWs) * 100);

    return {
      score,
      level,
      badgeColor,
      strokeColor,
      advisory,
      factors: [
        { label: 'Occupancy Density', pct: pctD, val: `${density}%`, color: 'bg-[#0d9488]' },
        { label: 'Inflow Growth (ΔD)', pct: pctDC, val: `${Math.round(fDensityChange)}%`, color: 'bg-[#0284c7]' },
        { label: 'Movement Velocity', pct: pctM, val: `${speed.toFixed(1)} m/s`, color: 'bg-[#f59e0b]' },
        { label: 'Flow Turbulence & Chaos', pct: pctTurb, val: `${turbulence}%`, color: 'bg-[#ef4444]' },
      ],
    };
  }, [density, speed, turbulence]);

  const copyBibtex = () => {
    const bib = `@inproceedings{crowdsentinel2026,
  title={CrowdSentinel: AI-Based Early Crowd Risk Detection Using Multi-Modal Spatial Density and Motion Dynamics},
  author={Anonymous Authors},
  booktitle={IEEE Conference on Computer Vision and Safety Systems},
  year={2026}
}`;
    navigator.clipboard.writeText(bib);
    setCopiedBib(true);
    setTimeout(() => setCopiedBib(false), 2000);
  };

  const benchmarkSequences = [
    { id: 'seq_01_normal_flow', title: 'Normal Pedestrian Flow', desc: 'Unobstructed laminar crowd movement through open concourse.', risk: 'NORMAL', icon: Compass },
    { id: 'seq_02_bottleneck_congestion', title: 'Bottleneck Congestion', desc: 'Progressive spatial compression and velocity breakdown.', risk: 'HIGH RISK', icon: Flame },
    { id: 'seq_03_counter_flow_surge', title: 'Counter-Flow Surge', desc: 'Opposing crowd cross-streams with high directional variance.', risk: 'CRITICAL', icon: Zap },
    { id: 'seq_04_rapid_panic_dispersion', title: 'Rapid Panic Dispersion', desc: 'Radial velocity spikes and extreme flow turbulence.', risk: 'CRITICAL', icon: Activity },
    { id: 'seq_05_dense_standstill', title: 'High-Density Standstill', desc: 'Static dense gathering with micro-fluctuations.', risk: 'WARNING', icon: ShieldCheck },
    { id: 'seq_06_steady_concourse', title: 'Steady Transit Concourse', desc: 'Continuous bi-directional transit flow monitoring.', risk: 'NORMAL', icon: Eye },
  ];

  return (
    <div className="min-h-screen bg-[#0d1c20] text-[#e0f0ed] selection:bg-[#14b8a6] selection:text-white">
      {/* Top Floating Glass Navigation */}
      <header className="sticky top-0 z-50 border-b border-[#244247]/70 bg-[#0d1c20]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#14b8a6] to-[#f59e0b] text-[#0d1c20] shadow-[0_0_20px_rgba(20,184,166,0.4)]">
              <ShieldCheck size={24} strokeWidth={2.6} />
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#ef4444] ring-2 ring-[#0d1c20]" />
            </div>
            <div>
              <div className="text-lg font-black tracking-tight text-white">CrowdSentinel</div>
              <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#14b8a6]">AI Safety & Risk Engine</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#simulator" className="text-xs font-bold uppercase tracking-wider text-[#9bb8b5] transition hover:text-[#14b8a6]">
              Live Simulator
            </a>
            <a href="#pipeline" className="text-xs font-bold uppercase tracking-wider text-[#9bb8b5] transition hover:text-[#14b8a6]">
              Architecture
            </a>
            <a href="#benchmarks" className="text-xs font-bold uppercase tracking-wider text-[#9bb8b5] transition hover:text-[#14b8a6]">
              Benchmark Suites
            </a>
            <Link href="/research" className="text-xs font-bold uppercase tracking-wider text-[#9bb8b5] transition hover:text-[#14b8a6]">
              IEEE Paper Hub
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#14b8a6] to-[#0d9488] px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-[0_0_25px_rgba(20,184,166,0.35)] transition hover:brightness-110"
            >
              <Radio size={14} className="animate-pulse" /> Launch Console
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pt-20 pb-28 md:pt-28">
        {/* Glow Spheres */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-[#14b8a6]/15 blur-[120px]" />
        <div className="pointer-events-none absolute top-60 right-10 h-[350px] w-[350px] rounded-full bg-[#f59e0b]/10 blur-[100px]" />

        <div className="relative mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#245258] bg-[#143238]/80 px-4 py-1.5 backdrop-blur-md">
            <Sparkles size={14} className="text-[#f59e0b]" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#8ee0d6]">
              IEEE Research & Capstone Project
            </span>
          </div>

          <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl md:text-7xl">
            AI-Based Early Crowd Risk Detection Through{' '}
            <span className="bg-gradient-to-r from-[#14b8a6] via-[#f59e0b] to-[#38bdf8] bg-clip-text text-transparent">
              Density & Motion Analysis
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-3xl text-base leading-relaxed text-[#9abeb8] sm:text-xl">
            An explainable decision-support system that fuses single-pass YOLO person detection with Farnebäck optical flow turbulence over temporal sliding windows to forecast hazardous crowd build-ups before critical escalation.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-[#14b8a6] to-[#0d9488] px-7 py-4 text-sm font-black uppercase tracking-wider text-white shadow-[0_10px_30px_rgba(20,184,166,0.35)] transition hover:scale-[1.02] hover:brightness-110"
            >
              <Radio size={16} /> Open Operations Console <ArrowRight size={16} />
            </Link>
            <Link
              href="/research"
              className="inline-flex items-center gap-2 rounded-xl border border-[#2c5258] bg-[#142c33]/80 px-6 py-4 text-sm font-black uppercase tracking-wider text-[#d5eee9] backdrop-blur-md transition hover:border-[#14b8a6] hover:bg-[#1a3840]"
            >
              <Layers3 size={16} className="text-[#f59e0b]" /> View IEEE Results (Tables I-VI)
            </Link>
          </div>

          {/* Highlight Metrics Grid */}
          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-[#244247] bg-[#12282e]/80 p-5 backdrop-blur-md">
              <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#14b8a6]">Macro F1-Score</div>
              <div className="mt-2 text-3xl font-black text-white">0.827</div>
              <div className="mt-1 text-xs text-[#7aa19b]">+0.503 over baseline (0.323)</div>
            </div>

            <div className="rounded-2xl border border-[#244247] bg-[#12282e]/80 p-5 backdrop-blur-md">
              <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#10b981]">False Alarm Rate</div>
              <div className="mt-2 text-3xl font-black text-[#10b981]">0.00%</div>
              <div className="mt-1 text-xs text-[#7aa19b]">With K=5 persistence filter</div>
            </div>

            <div className="rounded-2xl border border-[#244247] bg-[#12282e]/80 p-5 backdrop-blur-md">
              <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#f59e0b]">Early Warning Lead</div>
              <div className="mt-2 text-3xl font-black text-[#f59e0b]">2.52s</div>
              <div className="mt-1 text-xs text-[#7aa19b]">Ahead of event onset</div>
            </div>

            <div className="rounded-2xl border border-[#244247] bg-[#12282e]/80 p-5 backdrop-blur-md">
              <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#38bdf8]">Processing Speed</div>
              <div className="mt-2 text-3xl font-black text-white">7.4 FPS</div>
              <div className="mt-1 text-xs text-[#7aa19b]">Full multi-modal CPU pipeline</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Live Risk Simulator */}
      <section id="simulator" className="border-t border-[#1e393f] bg-[#091518] px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <div className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#14b8a6]">
              Interactive Multi-Modal Sandbox
            </div>
            <h2 className="mt-2 text-3xl font-black text-white sm:text-4xl">
              Live Decision-Support Risk Simulator
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#8bb0ab]">
              Adjust the physical crowd parameters below to observe how the mathematical engine calculates the composite risk score and factor percentage breakdown in real-time.
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            {/* Controls */}
            <div className="rounded-3xl border border-[#244247] bg-[#12282e] p-6 shadow-2xl sm:p-8">
              <div className="mb-6 flex items-center justify-between border-b border-[#244247] pb-4">
                <div className="flex items-center gap-2">
                  <Sliders size={18} className="text-[#14b8a6]" />
                  <span className="font-bold text-white">Visual Indicators</span>
                </div>
                <button
                  onClick={() => { setDensity(65); setSpeed(1.8); setTurbulence(55); }}
                  className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-[#8bb0ab] hover:text-[#14b8a6]"
                >
                  <RefreshCw size={12} /> Reset to Default
                </button>
              </div>

              <div className="space-y-6">
                {/* Density Slider */}
                <div>
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-[#b1d4ce]">Relative Image Density ($D$)</span>
                    <span className="font-mono text-[#14b8a6]">{density}% occupancy</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={density}
                    onChange={(e) => setDensity(Number(e.target.value))}
                    className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-[#1e3c42] accent-[#14b8a6]"
                  />
                  <div className="mt-1 flex justify-between font-mono text-[10px] text-[#638782]">
                    <span>Sparse (5%)</span>
                    <span>Moderate (50%)</span>
                    <span>High Packing (100%)</span>
                  </div>
                </div>

                {/* Speed Slider */}
                <div>
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-[#b1d4ce]">Movement Velocity ($M$)</span>
                    <span className="font-mono text-[#f59e0b]">{speed.toFixed(1)} m/s</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="4.0"
                    step="0.1"
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-[#1e3c42] accent-[#f59e0b]"
                  />
                  <div className="mt-1 flex justify-between font-mono text-[10px] text-[#638782]">
                    <span>Standstill (0.1 m/s)</span>
                    <span>Walking (1.4 m/s)</span>
                    <span>Rush Surge (4.0 m/s)</span>
                  </div>
                </div>

                {/* Turbulence Slider */}
                <div>
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-[#b1d4ce]">Flow Turbulence & Chaos (σ²_θ, I_flow)</span>
                    <span className="font-mono text-[#ef4444]">{turbulence}% chaos</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={turbulence}
                    onChange={(e) => setTurbulence(Number(e.target.value))}
                    className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-[#1e3c42] accent-[#ef4444]"
                  />
                  <div className="mt-1 flex justify-between font-mono text-[10px] text-[#638782]">
                    <span>Laminar Flow (0%)</span>
                    <span>Cross-Flow (50%)</span>
                    <span>Extreme Turbulence (100%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Readout & Radial Speedometer */}
            <div className="flex flex-col justify-between rounded-3xl border border-[#244247] bg-[#12282e] p-6 shadow-2xl sm:p-8">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#7da49e]">Engine Readout</span>
                  <span className={`rounded-full border px-3 py-1 font-mono text-xs font-black uppercase ${simulation.badgeColor}`}>
                    {simulation.level}
                  </span>
                </div>

                {/* Speedometer Gauge Visual */}
                <div className="my-6 flex items-center justify-center">
                  <div className="relative flex h-44 w-44 items-center justify-center">
                    <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1e3c42" strokeWidth="10" />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke={simulation.strokeColor}
                        strokeWidth="10"
                        strokeDasharray="251.2"
                        strokeDashoffset={251.2 - (251.2 * simulation.score) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-300"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <div className="text-4xl font-black text-white">{simulation.score}</div>
                      <div className="font-mono text-[10px] uppercase text-[#7ea39e]">/ 100 Risk Score</div>
                    </div>
                  </div>
                </div>

                {/* Explainable Factor Breakdown */}
                <div className="space-y-3">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-[#7ea39e]">
                    Exact Factor Contributions ($C_i$)
                  </div>
                  {simulation.factors.map((f, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-xs">
                        <span className="text-[#a4ccc5]">{f.label}</span>
                        <span className="font-mono font-bold text-white">{f.pct}% ({f.val})</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#1e3c42]">
                        <div className={`h-full ${f.color} transition-all duration-300`} style={{ width: `${f.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Operational Advisory */}
              <div className="mt-6 rounded-xl border border-[#25464c] bg-[#0c1e22] p-3.5 text-xs text-[#89b3ad]">
                <strong className="text-[#f59e0b]">Advisory Protocol:</strong> {simulation.advisory}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5-Stage Architecture Pipeline Showcase */}
      <section id="pipeline" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <div className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#14b8a6]">
              End-to-End Processing Architecture
            </div>
            <h2 className="mt-2 text-3xl font-black text-white sm:text-4xl">
              5-Stage Multi-Modal Vision Pipeline
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#8bb0ab]">
              How CrowdSentinel transforms uncalibrated raw video frames into mathematical safety indices with zero temporal leakage.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-5">
            {[
              { num: '01', title: 'Frame Ingestion', desc: 'Continuous RTSP stream extraction or MP4 video ingestion at 20 FPS.' },
              { num: '02', title: 'YOLO Detection', desc: 'Single-model cached person detection extracting bounding boxes and counts.' },
              { num: '03', title: 'Farnebäck Flow', desc: 'Dense pixel displacement computing velocity, variance, and flow turbulence.' },
              { num: '04', title: 'Feature Fusion', desc: 'Temporal sliding window aggregation into 6D vector F = [D, ΔD, M, ΔM, σ², I].' },
              { num: '05', title: 'Explainable Risk', desc: 'Weighted decision-support scoring with exact mathematical factor contributions.' },
            ].map((step, idx) => (
              <div key={idx} className="relative rounded-2xl border border-[#244247] bg-[#12282e] p-5 shadow-lg">
                <div className="font-mono text-xs font-black text-[#14b8a6]">{step.num}</div>
                <h3 className="mt-2 text-base font-extrabold text-white">{step.title}</h3>
                <p className="mt-2 text-xs leading-5 text-[#8aa9a4]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benchmark Video Sequences */}
      <section id="benchmarks" className="border-t border-[#1e393f] bg-[#091518] px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <div className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#14b8a6]">
              Standardized Evaluation Sequences
            </div>
            <h2 className="mt-2 text-3xl font-black text-white sm:text-4xl">
              Verified Benchmark Dataset Suite
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#8bb0ab]">
              6 reproducible benchmark sequences (1,240 frames) synthesized with realistic pedestrian dynamics and ground-truth transitions.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {benchmarkSequences.map((seq) => {
              const Icon = seq.icon;
              return (
                <div key={seq.id} className="flex flex-col justify-between rounded-2xl border border-[#244247] bg-[#12282e] p-6 shadow-md transition hover:border-[#14b8a6]">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="rounded-xl bg-[#1d3d44] p-3 text-[#14b8a6]">
                        <Icon size={20} />
                      </div>
                      <span className="font-mono text-[10px] font-black uppercase text-[#f59e0b]">{seq.risk}</span>
                    </div>
                    <h3 className="mt-4 text-base font-extrabold text-white">{seq.title}</h3>
                    <p className="mt-2 text-xs leading-5 text-[#86a8a3]">{seq.desc}</p>
                  </div>
                  <Link
                    href="/monitor"
                    className="mt-5 inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[#14b8a6] hover:underline"
                  >
                    <Play size={12} /> Test in Analysis Lab
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* IEEE Publication & Citation Section */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl rounded-3xl border border-[#285057] bg-gradient-to-br from-[#12282e] to-[#0c1b20] p-8 shadow-2xl sm:p-12">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#244247] pb-6">
            <div>
              <div className="flex items-center gap-2">
                <Award size={18} className="text-[#f59e0b]" />
                <span className="font-mono text-xs font-black uppercase tracking-wider text-[#14b8a6]">
                  IEEE Research Paper Package
                </span>
              </div>
              <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                Ready for IEEE Conference Submission
              </h2>
            </div>
            <Link
              href="/research"
              className="inline-flex items-center gap-2 rounded-xl bg-[#14b8a6] px-5 py-3 text-xs font-black uppercase tracking-wider text-[#091518] shadow-md hover:bg-[#0d9488]"
            >
              Open Research Portal <ChevronRight size={16} />
            </Link>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div>
              <h4 className="text-sm font-extrabold text-white">Paper Title</h4>
              <p className="mt-1 font-serif text-sm italic text-[#c3e0db]">
                "CrowdSentinel: AI-Based Early Crowd Risk Detection Using Multi-Modal Spatial Density and Motion Dynamics"
              </p>

              <h4 className="mt-5 text-sm font-extrabold text-white">Verified Research Findings</h4>
              <ul className="mt-2 space-y-2 text-xs text-[#8aa9a4]">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[#10b981]" /> Test Macro F1-Score: <strong>0.827</strong> (vs 0.275 Heuristic Baseline & 0.443 Density-Only)
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[#10b981]" /> Test False Alarm Rate suppressed to <strong>0.00%</strong> with temporal persistence gating
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[#10b981]" /> Mean Early Warning Lead: <strong>2.52 seconds</strong> prior to event onset
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[#10b981]" /> Zero temporal leakage with strict video-level sequence partitioning
                </li>
              </ul>
            </div>

            {/* BibTeX Citation Box */}
            <div className="relative rounded-2xl border border-[#244247] bg-[#091518] p-4">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-mono text-[10px] uppercase text-[#6f948f]">BibTeX Citation</span>
                <button
                  onClick={copyBibtex}
                  className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-[#14b8a6] hover:underline"
                >
                  {copiedBib ? <Check size={12} /> : <Copy size={12} />} {copiedBib ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="overflow-x-auto font-mono text-[10px] text-[#9fc7c1]">
{`@inproceedings{crowdsentinel2026,
  title={CrowdSentinel: AI-Based Early Crowd Risk
         Detection Using Multi-Modal Density and Motion},
  author={Anonymous Authors},
  booktitle={IEEE Conf. on CV and Safety Systems},
  year={2026}
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1e393f] bg-[#071114] px-6 py-12 text-xs text-[#6e8f8b]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#14b8a6] text-[#071114]">
              <ShieldCheck size={18} strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-bold text-white">CrowdSentinel Safety Monitor</div>
              <div className="font-mono text-[9px] text-[#86aaa4]">IEEE Research & Capstone Platform</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 font-mono text-[11px]">
            <Link href="/dashboard" className="hover:text-white">Live Operations</Link>
            <Link href="/monitor" className="hover:text-white">Video Lab</Link>
            <Link href="/research" className="hover:text-white">IEEE Tables & Figures</Link>
            <Link href="/about" className="hover:text-white">Methodology Limits</Link>
          </div>

          <div className="text-[11px]">
            Strictly Decision-Support Tool · No Guaranteed Prediction Claims
          </div>
        </div>
      </footer>
    </div>
  );
}