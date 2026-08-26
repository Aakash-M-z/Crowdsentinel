import { Router, type IRouter } from "express";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const router: IRouter = Router();
const RESULTS_DIR = path.resolve(process.cwd(), "../../results");
const SUMMARY_METRICS_PATH = path.join(RESULTS_DIR, "metrics", "summary_metrics.json");
const MANIFEST_PATH = path.join(RESULTS_DIR, "experiment_manifest.json");

router.get("/experiments", async (_req, res): Promise<void> => {
  try {
    let summary: any = null;
    let manifest: any = null;

    if (fs.existsSync(SUMMARY_METRICS_PATH)) {
      summary = JSON.parse(fs.readFileSync(SUMMARY_METRICS_PATH, "utf-8"));
    }
    if (fs.existsSync(MANIFEST_PATH)) {
      manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));
    }

    res.json({
      status: summary ? "COMPLETED" : "PENDING",
      summary,
      manifest,
      tablesAvailable: [
        "table_1_dataset_statistics",
        "table_2_detection_performance",
        "table_3_risk_classification",
        "table_4_baseline_comparison",
        "table_5_ablation_study",
        "table_6_runtime_performance",
      ],
      plotsAvailable: [
        "fig_1_architecture.png",
        "fig_2_pipeline.png",
        "fig_3_detection_example.png",
        "fig_4_tracking_example.png",
        "fig_5_density_visualization.png",
        "fig_6_optical_flow_visualization.png",
        "fig_7_risk_score_over_time.png",
        "fig_8_confusion_matrix.png",
        "fig_9_baseline_comparison.png",
        "fig_10_ablation_study.png",
      ],
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/experiments/manifest", async (_req, res): Promise<void> => {
  if (fs.existsSync(MANIFEST_PATH)) {
    const data = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));
    res.json(data);
    return;
  }
  res.status(404).json({ error: "Experiment manifest not found. Run experiments first." });
});

router.get("/experiments/tables/:tableId", async (req, res): Promise<void> => {
  const tableFile = path.join(RESULTS_DIR, "tables", `${req.params.tableId}.csv`);
  if (fs.existsSync(tableFile)) {
    const csvContent = fs.readFileSync(tableFile, "utf-8");
    res.type("text/csv").send(csvContent);
    return;
  }
  res.status(404).json({ error: `Table ${req.params.tableId} not found.` });
});

router.get("/experiments/plots/:plotName", async (req, res): Promise<void> => {
  const plotFile = path.join(RESULTS_DIR, "plots", req.params.plotName);
  if (fs.existsSync(plotFile)) {
    res.sendFile(plotFile);
    return;
  }
  res.status(404).json({ error: `Plot ${req.params.plotName} not found.` });
});

router.post("/experiments/run", async (_req, res): Promise<void> => {
  try {
    const rootDir = path.resolve(process.cwd(), "../..");
    const pyProcess = spawn("python", ["-m", "experiments.run_all"], {
      cwd: rootDir,
      shell: true,
      stdio: "ignore",
      detached: true,
    });
    pyProcess.unref();

    res.json({
      status: "STARTED",
      message: "Experiment suite execution launched in background.",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;