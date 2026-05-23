import { Activity, BookOpenCheck, CheckCircle2, HelpCircle, Minimize2, MonitorUp, ScanLine, Sparkles, type LucideIcon } from "lucide-react";

import type { ServerJob, TabId, UiText } from "../appData";

interface AppNavbarProps {
  t: UiText;
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  selectedJob: ServerJob | null;
  completedCount: number;
  scanProgress: number;
  onScanNext: () => void;
  onMinimize4s: () => void;
}

const tabs: Array<{ id: TabId; icon: LucideIcon }> = [
  { id: "tasks", icon: Sparkles },
  { id: "desk", icon: MonitorUp },
  { id: "setup", icon: BookOpenCheck },
  { id: "help", icon: HelpCircle },
];

export function AppNavbar({
  t,
  activeTab,
  setActiveTab,
  selectedJob,
  completedCount,
  scanProgress,
  onScanNext,
  onMinimize4s,
}: AppNavbarProps) {
  return (
    <nav className="border-b border-slate-200 bg-[#f8f4ec]/95 backdrop-blur">
      <div className="mx-auto grid max-w-[1500px] gap-3 px-4 py-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="grid grid-cols-2 gap-2 rounded-lg border border-slate-200 bg-white p-1.5 shadow-sm sm:grid-cols-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex min-h-11 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-black transition ${
                  isActive ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon size={16} />
                {t.tabs[tab.id]}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-600 sm:grid-cols-[minmax(140px,1fr)_auto_auto_auto_auto]">
          <div className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 shadow-sm">
            <Activity size={15} className="text-emerald-700" />
            <span className="truncate">{selectedJob ? selectedJob.id : t.chooseTask}</span>
          </div>
          <button
            type="button"
            onClick={onScanNext}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 font-black text-emerald-900 shadow-sm hover:bg-emerald-100"
          >
            <ScanLine size={15} />
            {t.scanButton}
          </button>
          <button
            type="button"
            onClick={onMinimize4s}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 font-black text-white shadow-sm hover:bg-slate-800"
          >
            <Minimize2 size={15} />
            {t.minimize4s}
          </button>
          <div className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 shadow-sm">
            <MonitorUp size={15} className="text-slate-500" />
            <span>{scanProgress}% {t.readyPercent}</span>
          </div>
          <div className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 shadow-sm">
            <CheckCircle2 size={15} className="text-emerald-700" />
            <span>{completedCount} {t.submittedCount}</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
