"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { History, LayoutGrid, PlusCircle, LogOut, ChevronDown, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { campaigns, CampaignId } from "@/lib/campaigns";

interface NavbarProps {
  activeTab: "form" | "history";
  onTabChange: (tab: "form" | "history") => void;
  campaign: CampaignId;
  onCampaignChange: (campaign: CampaignId) => void;
  onCreateSupervisor?: () => void;
  user?: {
    id?: string;
    name: string;
    email?: string;
    role?: string | null;
  };
}

export function Navbar({
  activeTab,
  onTabChange,
  campaign,
  onCampaignChange,
  onCreateSupervisor,
  user,
}: NavbarProps) {
  const router = useRouter();
  const activeCampaign = campaigns[campaign];

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  };

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

        <div className="flex items-center gap-2">
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

          {user?.role === "admin" && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCreateSupervisor}
              className="hidden sm:inline-flex rounded-lg text-xs border-stone-300 bg-white hover:bg-stone-50 text-stone-900 font-semibold shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5 mr-1.5 text-stone-700" />
              Nuevo Supervisor
            </Button>
          )}

          {user && (
            <div className="ml-1 pl-2 border-l border-stone-200">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-800 shadow-xs hover:bg-stone-50 hover:text-stone-950 transition cursor-pointer"
                  >
                    <div className="flex size-6 items-center justify-center rounded-lg bg-stone-900 text-[11px] font-bold text-white">
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <span className="hidden sm:inline-block max-w-[120px] truncate">{user.name}</span>
                    <ChevronDown className="size-3.5 text-stone-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl border-stone-200 bg-white p-1.5 shadow-lg">
                  <DropdownMenuLabel className="px-2 py-1.5 font-normal">
                    <p className="text-xs font-bold text-stone-900 truncate">{user.name}</p>
                    <p className="text-[11px] font-medium text-stone-500">
                      {user.role === "admin" ? "Administrador" : "Supervisor"}
                    </p>
                    {user.email && (
                      <p className="text-[10px] text-stone-400 truncate mt-0.5">{user.email}</p>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-stone-100 my-1" />
                  {user.role === "admin" && (
                    <>
                      <DropdownMenuItem
                        onClick={onCreateSupervisor}
                        className="cursor-pointer text-stone-800 focus:bg-stone-50 rounded-lg text-xs font-semibold"
                      >
                        <UserPlus className="mr-2 size-3.5 text-stone-600" />
                        Crear Supervisor
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-stone-100 my-1" />
                    </>
                  )}
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700 rounded-lg text-xs font-semibold"
                  >
                    <LogOut className="mr-2 size-3.5" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
