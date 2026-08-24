import { Router, type IRouter } from "express";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db, camerasTable } from "@workspace/db";
import {
  CreateCameraBody,
  CreateCameraResponse,
  DeleteCameraParams,
  GetAlertsQueryParams,
  GetAlertsResponse,
  GetAnalysisSessionParams,
  GetAnalysisSessionResponse,
  GetAnalyticsResponse,
  GetCamerasResponse,
  GetDashboardResponse,
  GetRiskSettingsResponse,
  StartAnalysisBody,
  StartAnalysisResponse,
  UpdateCameraBody,
  UpdateCameraParams,
  UpdateCameraResponse,
  UpdateRiskSettingsBody,
  UpdateRiskSettingsResponse,
} from "@workspace/api-zod";
import { randomUUID } from "node:crypto";

const router: IRouter = Router();
const sessions = new Map<string, ReturnType<typeof createSession>>();
let riskSettings = {
  warningThreshold: 31,
  highThreshold: 51,
  criticalThreshold: 76,
  weights: { density: 0.35, movement: 0.25, densityChange: 0.2, flow: 0.2 },
};

const iso = () => new Date().toISOString();
const riskLevel = (score: number) => score >= 76 ? "CRITICAL" : score >= 51 ? "HIGH RISK" : score >= 31 ? "WARNING" : "NORMAL";

function currentSnapshot(tick = 0) {
  const count = Math.round(42 + Math.sin(tick / 3) * 9);
  const density = Math.round((38 + Math.sin(tick / 4) * 8) * 10) / 10;
  const speed = Math.round((0.72 + Math.abs(Math.cos(tick / 4)) * 0.18) * 100) / 100;
  const score = Math.round(Math.min(100, density * 0.7 + speed * 20 + Math.abs(Math.sin(tick / 2)) * 16));
  return {
    status: "MONITORING", mode: "DEMO / SIMULATED ANALYSIS", currentCount: count,
    density, movementSpeed: speed, direction: "NORTH-EAST", movementState: score > 51 ? "ABNORMAL SURGE" : "NORMAL FLOW",
    riskLevel: riskLevel(score), riskScore: score, activeAlerts: score > 51 ? 2 : 1, fps: 18.4,
    source: "Main Gate / CAM-001", factors: {
      density: Math.round(density), movementChange: Math.round(speed * 55),
      densityIncrease: Math.round((45 + Math.abs(Math.sin(tick)) * 30)), flowIrregularity: Math.round(score * 0.72),
    }, updatedAt: iso(),
  };
}

function createSession(source: string, mode: string) {
  const id = randomUUID();
  const current = currentSnapshot(0);
  return { id, source, mode, status: "PROCESSING", progress: 18, processedFrames: 54, totalFrames: 300,
    current, points: Array.from({ length: 8 }, (_, i) => ({ time: `${String(10 + i).padStart(2, "0")}:2${i}`, count: 34 + i * 2, density: 31 + i * 2.1, speed: 0.5 + i * 0.04, risk: 24 + i * 4 })), startedAt: iso() };
}

router.get("/dashboard", async (_req, res): Promise<void> => {
  res.json(GetDashboardResponse.parse(currentSnapshot(4)));
});

router.get("/cameras", async (_req, res): Promise<void> => {
  const rows = await db.select().from(camerasTable);
  const cameras = rows.map((camera) => ({ ...camera, lastActive: camera.lastActive.toISOString() }));
  res.json(GetCamerasResponse.parse(cameras));
});

router.post("/cameras", async (req, res): Promise<void> => {
  const parsed = CreateCameraBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const camera = { id: `CAM-${String(Date.now()).slice(-3)}`, ...parsed.data, status: "OFFLINE", lastActive: new Date() };
  const [created] = await db.insert(camerasTable).values(camera).returning();
  res.status(201).json(CreateCameraResponse.parse({ ...created, lastActive: created.lastActive.toISOString() }));
});

router.patch("/cameras/:cameraId", async (req, res): Promise<void> => {
  const params = UpdateCameraParams.safeParse(req.params);
  const body = UpdateCameraBody.safeParse(req.body);
  if (!params.success || !body.success) { res.status(400).json({ error: "Invalid camera data" }); return; }
  const [updated] = await db.update(camerasTable).set(body.data).where(eq(camerasTable.id, params.data.cameraId)).returning();
  if (!updated) { res.status(404).json({ error: "Camera not found" }); return; }
  res.json(UpdateCameraResponse.parse({ ...updated, lastActive: updated.lastActive.toISOString() }));
});

router.delete("/cameras/:cameraId", async (req, res): Promise<void> => {
  const params = DeleteCameraParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  await db.delete(camerasTable).where(eq(camerasTable.id, params.data.cameraId));
  res.sendStatus(204);
});

router.get("/alerts", async (req, res): Promise<void> => {
  const query = GetAlertsQueryParams.safeParse(req.query);
  if (!query.success) { res.status(400).json({ error: query.error.message }); return; }
  const alerts = [
    { id: "ALT-1042", timestamp: iso(), camera: "Main Gate / CAM-001", riskLevel: "HIGH RISK", riskScore: 62, conditions: ["High crowd density", "Movement change detected"], recommendedAction: "Review gate throughput and notify floor team.", status: "ACTIVE" },
    { id: "ALT-1039", timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(), camera: "Stadium Entrance / CAM-002", riskLevel: "WARNING", riskScore: 44, conditions: ["Density increase"], recommendedAction: "Continue monitoring inflow.", status: "ACKNOWLEDGED" },
    { id: "ALT-1034", timestamp: new Date(Date.now() - 1000 * 60 * 53).toISOString(), camera: "Main Gate / CAM-001", riskLevel: "CRITICAL", riskScore: 81, conditions: ["Abnormal flow direction", "Sudden movement increase"], recommendedAction: "Escalate to incident commander and open alternate exit.", status: "RESOLVED" },
  ].filter((alert) => !query.data.status || alert.status === query.data.status)
    .filter((alert) => !query.data.riskLevel || alert.riskLevel === query.data.riskLevel)
    .filter((alert) => !query.data.search || `${alert.id} ${alert.camera} ${alert.conditions.join(" ")}`.toLowerCase().includes(query.data.search.toLowerCase()));
  res.json(GetAlertsResponse.parse(alerts));
});

router.post("/monitoring/session", async (req, res): Promise<void> => {
  const parsed = StartAnalysisBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const session = createSession(parsed.data.source, parsed.data.mode);
  sessions.set(session.id, session);
  res.status(201).json(StartAnalysisResponse.parse(session));
});

router.get("/monitoring/session/:sessionId", async (req, res): Promise<void> => {
  const params = GetAnalysisSessionParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const session = sessions.get(params.data.sessionId);
  if (!session) { res.status(404).json({ error: "Analysis session not found" }); return; }
  if (session.progress < 100) {
    session.progress = Math.min(100, session.progress + 16);
    session.processedFrames = Math.round(session.totalFrames * session.progress / 100);
    session.current = currentSnapshot(session.progress / 10);
    session.status = session.progress >= 100 ? "COMPLETED" : "PROCESSING";
  }
  res.json(GetAnalysisSessionResponse.parse(session));
});

router.get("/analytics", async (_req, res): Promise<void> => {
  const points = Array.from({ length: 12 }, (_, i) => ({ time: `${String(9 + Math.floor(i / 2)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`, count: 28 + i * 2, density: 24 + i * 2.4, speed: 0.42 + i * 0.035, risk: 18 + i * 3.8 }));
  const analytics = { points, distribution: [{ level: "NORMAL", count: 18 }, { level: "WARNING", count: 9 }, { level: "HIGH RISK", count: 4 }, { level: "CRITICAL", count: 1 }], weeklyAlerts: [{ day: "Mon", count: 3 }, { day: "Tue", count: 5 }, { day: "Wed", count: 2 }, { day: "Thu", count: 7 }, { day: "Fri", count: 4 }, { day: "Sat", count: 6 }, { day: "Sun", count: 3 }], evaluation: { status: "Evaluation Pending", metrics: [{ name: "Accuracy", value: "—" }, { name: "Precision", value: "—" }, { name: "Recall", value: "—" }, { name: "F1-score", value: "—" }, { name: "False Alarm Rate", value: "—" }, { name: "Response Time", value: "—" }, { name: "Processing FPS", value: "18.4 actual" }] } };
  res.json(GetAnalyticsResponse.parse(analytics));
});

router.get("/settings/risk", async (_req, res): Promise<void> => { res.json(GetRiskSettingsResponse.parse(riskSettings)); });
router.put("/settings/risk", async (req, res): Promise<void> => {
  const parsed = UpdateRiskSettingsBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  riskSettings = parsed.data;
  res.json(UpdateRiskSettingsResponse.parse(riskSettings));
});

export default router;