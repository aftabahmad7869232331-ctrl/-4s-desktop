import { CheckCircle2, Keyboard, Minimize2, MonitorUp, ScanLine } from "lucide-react";

import type { UiText } from "../appData";

interface SetupGuideProps {
  t: UiText;
  scanProgress: number;
  onScanNext: () => void;
  onOpenDesk: () => void;
  onMinimize4s: () => void;
}

const stepIcons = [ScanLine, MonitorUp, Minimize2, Keyboard];

export function SetupGuide({ t, scanProgress, onScanNext, onOpenDesk, onMinimize4s }: SetupGuideProps) {
  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black">{t.setupTitle}</h2>
          <p className="mt-1 text-sm text-slate-600">{t.workflowNote}</p>
        </div>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-900">
          {scanProgress}% {t.readyPercent}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {t.setupSteps.map(([title, body], index) => {
          const Icon = stepIcons[index] || CheckCircle2;
          return (
            <section key={title} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
                  <Icon size={17} />
                </span>
                <h3 className="text-sm font-black uppercase text-slate-900">{title}</h3>
              </div>
              <p className="text-sm leading-6 text-slate-600">{body}</p>
            </section>
          );
        })}
      </div>

      <div className="grid gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={onScanNext}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-3 text-sm font-black text-emerald-900 shadow-sm hover:bg-emerald-50"
        >
          <ScanLine size={16} />
          {t.scanButton}
        </button>
        <button
          type="button"
          onClick={onOpenDesk}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-3 text-sm font-black text-slate-900 shadow-sm hover:bg-slate-50"
        >
          <MonitorUp size={16} />
          {t.wallMode}
        </button>
        <button
          type="button"
          onClick={onMinimize4s}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 text-sm font-black text-white shadow-sm hover:bg-slate-800"
        >
          <Minimize2 size={16} />
          {t.minimize4s}
        </button>
      </div>
    </div>
  );
}
