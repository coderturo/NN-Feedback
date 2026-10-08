import { pgTable, uuid, timestamp, varchar, text, boolean } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const supervisorSignatures = pgTable("supervisor_signatures", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  dataUrl: text("data_url").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const coachingSessions = pgTable("coaching_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  fecha: timestamp("fecha").notNull(),
  campaign: varchar("campaign", { length: 50 }).notNull().default("maquinarias"),
  tema: varchar("tema", { length: 100 }).notNull(),
  supervisorId: text("supervisor_id").references(() => user.id),
  supervisorNombre: varchar("supervisor_nombre", { length: 150 }).notNull(),
  supervisorEmail: varchar("supervisor_email", { length: 255 }),
  asesorNombre: varchar("asesor_nombre", { length: 150 }).notNull(),
  asesorEmail: varchar("asesor_email", { length: 255 }).notNull(),
  detalleLlamada: text("detalle_llamada").notNull(),
  meGusta: text("me_gusta").notNull(),
  mePreocupa: text("me_preocupa").notNull(),
  teSugiero: text("te_sugiero"),
  compromiso: text("compromiso").notNull(),
  firmaSupervisor: text("firma_supervisor"),
  cumplido: boolean("cumplido").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CoachingSession = typeof coachingSessions.$inferSelect;
export type NewCoachingSession = typeof coachingSessions.$inferInsert;
export type SupervisorSignature = typeof supervisorSignatures.$inferSelect;
export type NewSupervisorSignature = typeof supervisorSignatures.$inferInsert;
