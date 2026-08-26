import { createInsertSchema } from "drizzle-zod";
import { integer, jsonb, pgTable, real, text, timestamp } from "drizzle-orm/pg-core";

export const camerasTable = pgTable("cameras", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  source: text("source").notNull(),
  sourceType: text("source_type").notNull(),
  status: text("status").notNull().default("OFFLINE"),
  lastActive: timestamp("last_active", { withTimezone: true }).notNull(),
});

export const detectionsTable = pgTable("detections", {
  id: text("id").primaryKey(),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
  cameraId: text("camera_id").notNull(),
  personCount: integer("person_count").notNull(),
  density: real("density").notNull(),
  movementSpeed: real("movement_speed").notNull(),
  movementDirection: text("movement_direction").notNull(),
});

export const riskEventsTable = pgTable("risk_events", {
  id: text("id").primaryKey(),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
  cameraId: text("camera_id").notNull(),
  riskScore: integer("risk_score").notNull(),
  riskLevel: text("risk_level").notNull(),
  reason: jsonb("reason").notNull(),
});

export const alertsTable = pgTable("alerts", {
  id: text("id").primaryKey(),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
  riskEventId: text("risk_event_id").notNull(),
  alertType: text("alert_type").notNull(),
  status: text("status").notNull(),
});

export const analysisSessionsTable = pgTable("analysis_sessions", {
  id: text("id").primaryKey(),
  source: text("source").notNull(),
  mode: text("mode").notNull(),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true }),
  summary: jsonb("summary").notNull(),
});

export const experimentsTable = pgTable("experiments", {
  id: text("id").primaryKey(),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
  modelName: text("model_name").notNull(),
  datasetName: text("dataset_name").notNull(),
  configuration: jsonb("configuration").notNull(),
  metrics: jsonb("metrics").notNull(),
  manifest: jsonb("manifest").notNull(),
});

export const insertCameraSchema = createInsertSchema(camerasTable);
export type Camera = typeof camerasTable.$inferSelect;

export const insertExperimentSchema = createInsertSchema(experimentsTable);
export type ExperimentRecord = typeof experimentsTable.$inferSelect;