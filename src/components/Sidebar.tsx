import { Camera, CheckCircle2, Fingerprint, Wifi, WifiOff } from "lucide-react";

import { FINGERS, type SubmittedWork, type UiText } from "../appData";

interface SidebarProps {
  t: UiText;
  systemAlert: string;
  lowBandwidthMode: boolean;
  setLowBandwidthMode: (value: boolean) => void;
  showToast: (message: string) => void;
  scanProgress: number;
  scannedFingers: string[];
  scanFinger: (finger: string) => void;
  earningsLedger: SubmittedWork[];
  completedCount: number;
  displayReward: (reward: string) => string;
  isRtl: boolean;
}

export function Sidebar({
  t,
  systemAlert,
  lowBandwidthMode,
  setLowBandwidthMode,
  showToast,
  scanProgress,
  scannedFingers,
  scanFinger,
  earningsLedger,
  completedCount,
  displayReward,
  isRtl,
}: SidebarProps) {
  return (
    <aside className="space-y-4 xl:sticky xl:top-40 xl:self-start">
      {systemAlert && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
          {systemAlert}
        </div>
      )}

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-black uppercase text-slate-800">
            <Camera size={16} className="text-emerald-700" />
            {t.mobileEngine}
          </h2>
          <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600">{t.prototype}</span>
        </div>
        <p className="mb-4 text-sm leading-6 text-slate-600">{t.engineNote}</p>
        <button
          type="button"
          onClick={() => {
            const next = !lowBandwidthMode;
            setLowBandwidthMode(next);
            showToast(next ? t.lightMode : t.standardMode);
          }}
          className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-black transition ${
            lowBandwidthMode
              ? "bg-emerald-700 text-white hover:bg-emerald-800"
              : "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
          }`}
        >
          {lowBandwidthMode ? <WifiOff size={16} /> : <Wifi size={16} />}
          {lowBandwidthMode ? t.dataSaverButtonOn : t.dataSaverButtonOff}
        </button>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-black uppercase text-slate-800">
            <Fingerprint size={16} className="text-emerald-700" />
            {t.fingerScan}
          </h2>
          <span className="text-xs font-bold text-slate-500">{scanProgress}% {t.readyPercent}</span>
        </div>
        <div className="mb-3 h-2 rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-emerald-700 transition-all" style={{ width: `${scanProgress}%` }} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {FINGERS.map((finger) => {
            const scanned = scannedFingers.includes(finger);
            return (
              <button
                key={finger}
                type="button"
                onClick={() => scanFinger(finger)}
                className={`rounded-lg border px-3 py-2 text-left text-xs font-black transition ${
                  scanned ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                } ${isRtl ? "text-right" : "text-left"}`}
              >
                {finger}
                <span className="mt-1 block text-[10px] font-bold text-slate-500">{scanned ? t.scanned : t.tapToScan}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-black uppercase text-slate-800">
            <CheckCircle2 size={16} className="text-emerald-700" />
            {t.record}
          </h2>
          <span className="text-xs font-bold text-slate-500">{completedCount} {t.submittedCount}</span>
        </div>
        <div className="space-y-2">
          {earningsLedger.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-500">
              {t.emptyRecord}
            </div>
          ) : (
            earningsLedger.slice(0, 4).map((record, index) => (
              <div key={`${record.jobId}-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black text-slate-800">{record.jobId}</span>
                  <span className="rounded-md bg-emerald-700 px-2 py-1 text-xs font-black text-white">+{displayReward(record.rewardValue)}</span>
                </div>
                <p className="mt-1 truncate text-sm text-slate-600">{record.answer}</p>
                <p className="mt-1 text-[11px] font-semibold text-slate-400">{record.timestamp}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </aside>
  );
}
