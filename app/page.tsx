"use client";

import * as React from "react";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { CoachingSessionForm } from "@/components/CoachingSessionForm";
import { CoachingHistory } from "@/components/CoachingHistory";
import { ArrowUpRight, CheckCircle2, FileDown, Mail, Target } from "lucide-react";
import { campaigns, CampaignId } from "@/lib/campaigns";

export default function Home() {
  const [activeTab, setActiveTab] = React.useState<"form" | "history">("form");
  const [campaign, setCampaign] = React.useState<CampaignId>("maquinarias");
  const [auditType, setAuditType] = React.useState("Refuerzo Semanal");
  const currentCampaign = campaigns[campaign];

  return (
    <div className="min-h-screen bg-[#f4f4f0] text-stone-950">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} campaign={campaign} onCampaignChange={setCampaign} />

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <section className="mb-6 grid grid-cols-1 gap-3 lg:grid-cols-12">
          <div className="relative flex min-h-80 items-center justify-center overflow-hidden rounded-[1.75rem] bg-stone-950 p-7 text-center text-white sm:p-9 lg:col-span-7">
            <div className="absolute -right-12 -top-16 size-64 rounded-full opacity-25 blur-3xl" style={{ backgroundColor: currentCampaign.accent }} />
            <div className="relative flex flex-col items-center">
              <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400">Espacio de calidad · {currentCampaign.name}</p>
              <h1 className="max-w-xl text-3xl font-black tracking-[-0.04em] sm:text-5xl">{activeTab === "form" ? "Una conversación mejor, registro a registro." : "Lo importante, siempre a la vista."}</h1>
              <p className="mt-5 max-w-lg text-sm leading-6 text-stone-300">{activeTab === "form" ? "Registra una sesión clara, humana y accionable para tu equipo." : "Explora acuerdos, aprendizajes y el contexto de cada sesión."}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-2">
            <div className="rounded-[1.75rem] border border-stone-200 bg-white p-5">
              <div className="relative mb-5 size-14 overflow-hidden rounded-2xl border border-stone-100 bg-stone-50 p-1"><ImageCampaign campaign={campaign} /></div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Campaña activa</p>
              <p className="mt-1 text-xl font-extrabold tracking-tight">{currentCampaign.name}</p>
              <p className="mt-2 text-xs leading-5 text-stone-500">{currentCampaign.description}</p>
            </div>
            <div className="flex flex-col justify-between rounded-[1.75rem] p-5 text-white" style={{ backgroundColor: currentCampaign.accent }}>
              <Target className="size-5" />
              <div><p className="text-xs font-bold uppercase tracking-wider text-white/70">Flujo de hoy</p><p className="mt-1 text-lg font-extrabold leading-tight">{auditType}</p><ArrowUpRight className="mt-3 size-5" /></div>
            </div>
            <div className="rounded-[1.75rem] border border-stone-200 bg-white p-5 sm:col-span-2">
              <div className="grid grid-cols-3 divide-x divide-stone-100">
                <Metric icon={<CheckCircle2 className="size-4" />} label="Registro" value="Claro" />
                <Metric icon={<Mail className="size-4" />} label="Resumen" value="Email" />
                <Metric icon={<FileDown className="size-4" />} label="Acta" value="PDF" />
              </div>
            </div>
          </div>
        </section>

        {activeTab === "form" ? <CoachingSessionForm campaign={campaign} auditType={auditType} onAuditTypeChange={setAuditType} /> : <CoachingHistory campaign={campaign} />}
      </main>

      {/* Footer corporativo */}
      <footer className="mx-auto flex max-w-7xl items-center justify-between px-4 py-7 text-xs text-stone-400 sm:px-6 lg:px-8">
        <p>© {new Date().getFullYear()} NN Feedback</p>
        <p>Calidad que se conversa.</p>
      </footer>
    </div>
  );
}

function ImageCampaign({ campaign }: { campaign: CampaignId }) {
  return <Image src={campaigns[campaign].logo} alt="" fill sizes="56px" className="object-contain" />;
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="px-3 first:pl-0 last:pr-0"><div className="mb-3 text-stone-400">{icon}</div><p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">{label}</p><p className="mt-0.5 text-sm font-bold text-stone-900">{value}</p></div>;
}
