"use client";

import Image from "next/image";
import { History, LayoutGrid, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { campaigns, CampaignId } from "@/lib/campaigns";

interface NavbarProps {
  activeTab: "form" | "history";
  onTabChange: (tab: "form" | "history") => void;
  campaign: CampaignId;
  onCampaignChange: (campaign: CampaignId) => void;
}

export function Navbar({ activeTab, onTabChange, campaign, onCampaignChange }: NavbarProps) {
  const activeCampaign = campaigns[campaign];
  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200/80 bg-[#fafaf9]/90 backdrop-blur-xl">
      <div className="mx-auto flex min-h-18 max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-stone-900 text-white shadow-sm">
            <LayoutGrid className="size-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">NN</span>
            <span className="text-sm font-extrabold tracking-tight text-stone-950">Feedback</span>
          </div>
          <div className="hidden h-7 w-px bg-stone-200 sm:block" />
          <div className="relative hidden h-9 w-9 overflow-hidden rounded-lg border border-stone-200 bg-white sm:block">
            <Image
              src={activeCampaign.logo}
              alt={activeCampaign.name}
              fill
              sizes="36px"
              className="object-contain p-0.5"
              priority
            />
          </div>
        </div>

        <div className="order-3 flex w-full gap-1 overflow-x-auto rounded-xl border border-stone-200 bg-white p-1 sm:order-2 sm:w-auto">
          {(Object.keys(campaigns) as CampaignId[]).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => onCampaignChange(id)}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${campaign === id ? "bg-stone-900 text-white shadow-sm" : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"}`}
            >
              <span className="relative size-5 overflow-hidden rounded bg-white">
                <Image src={campaigns[id].logo} alt="" fill sizes="20px" className="object-contain" />
              </span>
              {campaigns[id].name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant={activeTab === "form" ? "default" : "ghost"}
            size="sm"
            onClick={() => onTabChange("form")}
            className={
              activeTab === "form"
                ? "bg-stone-900 text-white shadow-sm hover:bg-stone-800"
                : "text-stone-500 hover:text-stone-950"
            }
          >
            <PlusCircle className="w-4 h-4 mr-1.5" />
            Nueva Auditoría
          </Button>

          <Button
            variant={activeTab === "history" ? "default" : "ghost"}
            size="sm"
            onClick={() => onTabChange("history")}
            className={
              activeTab === "history"
                ? "bg-stone-900 text-white shadow-sm hover:bg-stone-800"
                : "text-stone-500 hover:text-stone-950"
            }
          >
            <History className="w-4 h-4 mr-1.5" />
            Historial
          </Button>
        </div>
      </div>
    </header>
  );
}
