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
  FileCode2,
  Copy,
  ExternalLink,
  Award,
  RefreshCw,
  Video,
} from 'lucide-react';
import { VideoTestBench } from '@/components/VideoTestBench';

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
    let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    let strokeColor = '#16a34a';
    let advisory = 'Normal crowd movement. Parameters within standard safe tolerances.';

    if (score >= 76) {
      level = 'CRITICAL';
      badgeColor = 'bg-red-50 text-red-700 border-red-200';
      strokeColor = '#dc2626';
      advisory = 'URGENT: Extreme escalation signal. Open auxiliary egress routes and notify incident commander.';
    } else if (score >= 51) {
      level = 'HIGH RISK';
      badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
      strokeColor = '#d97706';
      advisory = 'ELEVATED: High crowd risk signal detected. Dispatch marshals to verify throughput.';
    } else if (score >= 31) {
      level = 'WARNING';
      badgeColor = 'bg-orange-50 text-orange-700 border-orange-200';
      strokeColor = '#ea580c';
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
        { label: 'Occupancy Density', pct: pctD, val: `${density}%`, color: 'bg-orange-600' },
        { label: 'Inflow Growth (ΔD)', pct: pctDC, val: `${Math.round(fDensityChange)}%`, color: 'bg-amber-500' },
        { label: 'Movement Velocity', pct: pctM, val: `${speed.toFixed(1)} m/s`, color: 'bg-slate-700' },
        { label: 'Flow Turbulence & Chaos', pct: pctTurb, val: `${turbulence}%`, color: 'bg-red-500' },
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
    { id: 'seq_02_bottleneck_congestion', title: 'Bottleneck Congestion', desc: 'Progressive spatial compression and velocity breakdown.', risk: 'HIGH RISK', icon: Layers3 },
    { id: 'seq_03_counter_flow_surge', title: 'Counter-Flow Surge', desc: 'Opposing crowd cross-streams with high directional variance.', risk: 'CRITICAL', icon: Zap },
    { id: 'seq_04_rapid_panic_dispersion', title: 'Rapid Panic Dispersion', desc: 'Radial velocity spikes and extreme flow turbulence.', risk: 'CRITICAL', icon: Activity },
    { id: 'seq_05_dense_standstill', title: 'High-Density Standstill', desc: 'Static dense gathering with micro-fluctuations.', risk: 'WARNING', icon: ShieldCheck },
    { id: 'seq_06_steady_concourse', title: 'Steady Transit Concourse', desc: 'Continuous bi-directional transit flow monitoring.', risk: 'NORMAL', icon: Eye },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-orange-500 selection:text-white">
      {/* Top Clean Minimalist Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-600 text-white shadow-sm">
              <ShieldCheck size={22} strokeWidth={2.4} />
            </div>
            <div>
              <div className="text-base font-bold tracking-tight text-slate-900">CrowdSentinel</div>
              <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-orange-600">Safety & Risk Monitor</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            <a href="#simulator" className="text-xs font-semibold uppercase tracking-wider text-slate-600 transition hover:text-orange-600">
              Live Simulator
            </a>
            <a href="#results" className="text-xs font-semibold uppercase tracking-wider text-slate-600 transition hover:text-orange-600">
              Testbench & Accuracy
            </a>
            <a href="#pipeline" className="text-xs font-semibold uppercase tracking-wider text-slate-600 transition hover:text-orange-600">
              Architecture
            </a>
            <a href="#benchmarks" className="text-xs font-semibold uppercase tracking-wider text-slate-600 transition hover:text-orange-600">
              Benchmark Suites
            </a>
            <Link href="/research" className="text-xs font-semibold uppercase tracking-wider text-slate-600 transition hover:text-orange-600">
              IEEE Paper Hub
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-orange-600 hover:bg-orange-700 px-4 py-2 text-xs font-semibold text-white shadow-sm transition"
            >
              <Radio size={13} className="animate-pulse" /> Launch Console
            </Link>
          </div>
        </div>
      </header>

      {/* Clean Academic / Engineering Hero Section */}
      <section className="relative px-6 pt-16 pb-20 md:pt-24 md:pb-24 border-b border-slate-100 bg-slate-50/40">
        <div className="relative mx-auto max-w-5xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3.5 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-600" />
            <span className="font-mono text-xs font-semibold text-orange-700">
              IEEE Research & Capstone Platform
            </span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            Early Crowd Risk Detection Through{' '}
            <span className="text-orange-600">
              Density & Motion Analysis
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
            An explainable decision-support system that fuses single-pass YOLO person detection with Farnebäck optical flow turbulence over temporal sliding windows to forecast hazardous crowd build-ups before critical escalation.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-orange-600 hover:bg-orange-700 px-6 py-3 text-xs font-semibold text-white shadow-sm transition"
            >
              <Radio size={15} /> Open Operations Console <ArrowRight size={15} />
            </Link>
            <Link
              href="/research"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 px-5 py-3 text-xs font-semibold text-slate-700 shadow-2xs transition"
            >
              <Layers3 size={15} className="text-orange-600" /> View IEEE Results (Tables I–VI)
            </Link>
          </div>

          {/* Highlight Metrics Grid */}
          <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-left">
              <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-orange-600">Macro F1-Score</div>
              <div className="mt-1.5 text-3xl font-bold text-slate-900">0.827</div>
              <div className="mt-1 text-xs text-slate-500">+0.503 over baseline (0.323)</div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-left">
              <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-700">False Alarm Rate</div>
              <div className="mt-1.5 text-3xl font-bold text-emerald-700">0.00%</div>
              <div className="mt-1 text-xs text-slate-500">With K=5 persistence filter</div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-left">
              <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-orange-600">Early Warning Lead</div>
              <div className="mt-1.5 text-3xl font-bold text-orange-600">2.52s</div>
              <div className="mt-1 text-xs text-slate-500">Ahead of physical blockage</div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-left">
              <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-600">Processing Speed</div>
              <div className="mt-1.5 text-3xl font-bold text-slate-900">7.4 FPS</div>
              <div className="mt-1 text-xs text-slate-500">Full multi-modal CPU pipeline</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Live Risk Simulator */}
      <section id="simulator" className="border-b border-slate-200 bg-slate-50/70 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <div className="font-mono text-xs font-bold uppercase tracking-wider text-orange-600">
              Interactive Multi-Modal Sandbox
            </div>
            <h2 className="mt-1.5 text-2xl sm:text-3xl font-bold text-slate-900">
              Live Decision-Support Risk Simulator
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              Adjust physical crowd variables to observe how the mathematical engine calculates the composite risk score and factor percentage breakdown in real-time.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            {/* Controls */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-2">
                  <Sliders size={16} className="text-orange-600" />
                  <span className="text-sm font-bold text-slate-900">Physical Parameter Controls</span>
                </div>
                <button
                  onClick={() => { setDensity(65); setSpeed(1.8); setTurbulence(55); }}
                  className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-slate-500 hover:text-orange-600"
                >
                  <RefreshCw size={11} /> Reset
                </button>
              </div>

              <div className="space-y-5">
                {/* Density Slider */}
                <div>
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">Relative Image Density (D)</span>
                    <span className="font-mono font-bold text-orange-600">{density}% occupancy</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={density}
                    onChange={(e) => setDensity(Number(e.target.value))}
                    className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-orange-600"
                  />
                  <div className="mt-1 flex justify-between font-mono text-[10px] text-slate-400">
                    <span>Sparse (5%)</span>
                    <span>Moderate (50%)</span>
                    <span>High Packing (100%)</span>
                  </div>
                </div>

                {/* Speed Slider */}
                <div>
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">Movement Velocity (M)</span>
                    <span className="font-mono font-bold text-slate-900">{speed.toFixed(1)} m/s</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="4.0"
                    step="0.1"
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-orange-600"
                  />
                  <div className="mt-1 flex justify-between font-mono text-[10px] text-slate-400">
                    <span>Standstill (0.1 m/s)</span>
                    <span>Walking (1.4 m/s)</span>
                    <span>Rush Surge (4.0 m/s)</span>
                  </div>
                </div>

                {/* Turbulence Slider */}
                <div>
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">Flow Turbulence & Chaos (σ²_θ, I_flow)</span>
                    <span className="font-mono font-bold text-red-600">{turbulence}% chaos</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={turbulence}
                    onChange={(e) => setTurbulence(Number(e.target.value))}
                    className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-red-600"
                  />
                  <div className="mt-1 flex justify-between font-mono text-[10px] text-slate-400">
                    <span>Laminar (0%)</span>
                    <span>Cross-Flow (50%)</span>
                    <span>Extreme Turbulence (100%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Readout & Radial Speedometer */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Decision Readout</span>
                  <span className={`rounded-full border px-2.5 py-0.5 font-mono text-xs font-bold uppercase ${simulation.badgeColor}`}>
                    {simulation.level}
                  </span>
                </div>

                {/* Speedometer Gauge Visual */}
                <div className="my-5 flex items-center justify-center">
                  <div className="relative flex h-40 w-40 items-center justify-center">
                    <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="8" />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke={simulation.strokeColor}
                        strokeWidth="8"
                        strokeDasharray="251.2"
                        strokeDashoffset={251.2 - (251.2 * simulation.score) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-300"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <div className="text-3xl font-bold text-slate-900">{simulation.score}</div>
                      <div className="font-mono text-[10px] uppercase text-slate-400">/ 100 Risk Score</div>
                    </div>
                  </div>
                </div>

                {/* Explainable Factor Breakdown */}
                <div className="space-y-2.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Mathematical Factor Contributions (C_i)
                  </div>
                  {simulation.factors.map((f, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600 font-medium">{f.label}</span>
                        <span className="font-mono font-bold text-slate-900">{f.pct}% ({f.val})</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div className={`h-full ${f.color} transition-all duration-300`} style={{ width: `${f.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Operational Advisory */}
              <div className="mt-5 rounded-xl border border-orange-200 bg-orange-50/60 p-3 text-xs text-slate-700">
                <strong className="text-orange-800">Protocol:</strong> {simulation.advisory}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real-Time Video Testbench & Model Accuracy Bench */}
      <section id="results" className="border-b border-slate-200 bg-white px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <VideoTestBench isEmbedded={true} />
        </div>
      </section>

      {/* 5-Stage Architecture Pipeline Showcase */}
      <section id="pipeline" className="border-b border-slate-200 bg-slate-50/50 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <div className="font-mono text-xs font-bold uppercase tracking-wider text-orange-600">
              End-to-End Processing Architecture
            </div>
            <h2 className="mt-1.5 text-2xl sm:text-3xl font-bold text-slate-900">
              5-Stage Multi-Modal Vision Pipeline
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              How CrowdSentinel transforms uncalibrated raw video frames into mathematical safety indices with zero temporal leakage.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-5">
            {[
              { num: '01', title: 'Frame Ingestion', desc: 'Continuous RTSP stream extraction or MP4 video ingestion at 20 FPS.' },
              { num: '02', title: 'YOLO Detection', desc: 'Single-model cached person detection extracting bounding boxes and counts.' },
              { num: '03', title: 'Farnebäck Flow', desc: 'Dense pixel displacement computing velocity, variance, and flow turbulence.' },
              { num: '04', title: 'Feature Fusion', desc: 'Temporal sliding window aggregation into 6D vector F = [D, ΔD, M, ΔM, σ², I].' },
              { num: '05', title: 'Explainable Risk', desc: 'Weighted decision-support scoring with exact mathematical factor contributions.' },
            ].map((step, idx) => (
              <div key={idx} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="font-mono text-xs font-bold text-orange-600">{step.num}</div>
                <h3 className="mt-2 text-sm font-bold text-slate-900">{step.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benchmark Video Sequences */}
      <section id="benchmarks" className="border-b border-slate-200 bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <div className="font-mono text-xs font-bold uppercase tracking-wider text-orange-600">
              Standardized Evaluation Sequences
            </div>
            <h2 className="mt-1.5 text-2xl sm:text-3xl font-bold text-slate-900">
              Verified Benchmark Dataset Suite
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              6 reproducible benchmark sequences (1,240 frames) synthesized with realistic pedestrian dynamics and ground-truth transitions.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {benchmarkSequences.map((seq) => {
              const Icon = seq.icon;
              return (
                <div key={seq.id} className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-orange-500 hover:shadow-md">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="rounded-lg bg-orange-50 p-2.5 text-orange-600 border border-orange-200">
                        <Icon size={18} />
                      </div>
                      <span className="font-mono text-[10px] font-bold uppercase text-orange-600">{seq.risk}</span>
                    </div>
                    <h3 className="mt-3.5 text-sm font-bold text-slate-900">{seq.title}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{seq.desc}</p>
                  </div>
                  <Link
                    href="/monitor"
                    className="mt-4 inline-flex items-center gap-1 font-mono text-xs font-semibold text-orange-600 hover:text-orange-700"
                  >
                    <Play size={11} fill="currentColor" /> Test in Video Lab
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* IEEE Publication & Citation Section */}
      <section className="px-6 py-20 bg-slate-50/50">
        <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <Award size={16} className="text-orange-600" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-orange-600">
                  IEEE Research Package
                </span>
              </div>
              <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                Ready for IEEE Conference Submission
              </h2>
            </div>
            <Link
              href="/research"
              className="inline-flex items-center gap-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition"
            >
              Open Research Portal <ChevronRight size={14} />
            </Link>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Paper Title</h4>
              <p className="mt-1 text-sm font-medium text-slate-900">
                "CrowdSentinel: AI-Based Early Crowd Risk Detection Using Multi-Modal Spatial Density and Motion Dynamics"
              </p>

              <h4 className="mt-5 text-xs font-bold uppercase tracking-wider text-slate-500">Verified Research Findings</h4>
              <ul className="mt-2 space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-600 shrink-0" /> Test Macro F1-Score: <strong className="text-slate-900">0.827</strong> (vs 0.275 Heuristic & 0.443 Density-Only)
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-600 shrink-0" /> Test False Alarm Rate suppressed to <strong className="text-slate-900">0.00%</strong> with persistence gating
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-600 shrink-0" /> Mean Early Warning Lead: <strong className="text-slate-900">2.52 seconds</strong> prior to event onset
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-600 shrink-0" /> Zero temporal leakage with strict video-level sequence partitioning
                </li>
              </ul>
            </div>

            {/* BibTeX Citation Box */}
            <div className="rounded-xl border border-slate-200 bg-slate-900 p-4 text-slate-100">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-mono text-[10px] uppercase text-slate-400">BibTeX Citation</span>
                <button
                  onClick={copyBibtex}
                  className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-orange-400 hover:text-orange-300"
                >
                  {copiedBib ? <Check size={11} /> : <Copy size={11} />} {copiedBib ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="overflow-x-auto font-mono text-[11px] text-slate-300 leading-relaxed">
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

      {/* Clean Minimal Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-10 text-xs text-slate-500">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-600 text-white">
              <ShieldCheck size={16} strokeWidth={2.4} />
            </div>
            <div>
              <div className="font-bold text-slate-900">CrowdSentinel Safety Monitor</div>
              <div className="font-mono text-[10px] text-slate-400">IEEE Research & Capstone Platform</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 font-mono text-xs">
            <Link href="/dashboard" className="hover:text-slate-900">Live Operations</Link>
            <Link href="/results" className="hover:text-slate-900">Video Testbench</Link>
            <Link href="/monitor" className="hover:text-slate-900">Video Lab</Link>
            <Link href="/research" className="hover:text-slate-900">IEEE Tables & Figures</Link>
            <Link href="/about" className="hover:text-slate-900">Methodology Limits</Link>
          </div>

          <div className="text-[11px] text-slate-400">
            Strictly Decision-Support Tool · No Guaranteed Prediction Claims
          </div>
        </div>
      </footer>
    </div>
  );
}