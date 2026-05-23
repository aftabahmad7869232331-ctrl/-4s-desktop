import { Camera, Check, Edit3, Languages, MonitorUp, PanelTopOpen, ShieldCheck, Sparkles, User, Wifi, WifiOff } from "lucide-react";

import type { Language, UiText } from "../appData";

interface AppHeaderProps {
  t: UiText;
  language: Language;
  setLanguage: (language: Language) => void;
  lowBandwidthMode: boolean;
  earnedToday: number;
  workerName: string;
  isEditingName: boolean;
  setIsEditingName: (isEditing: boolean) => void;
  newNameInput: string;
  setNewNameInput: (name: string) => void;
  setWorkerName: (name: string) => void;
  showToast: (message: string) => void;
  onOpenDesk: () => void;
  onOpenFloatingController: () => void;
  onOpenCompactController: () => void;
}

export function AppHeader({
  t,
  language,
  setLanguage,
  lowBandwidthMode,
  earnedToday,
  workerName,
  isEditingName,
  setIsEditingName,
  newNameInput,
  setNewNameInput,
  setWorkerName,
  showToast,
  onOpenDesk,
  onOpenFloatingController,
  onOpenCompactController,
}: AppHeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-700 text-base font-black text-white">
            4S
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-black">{t.pocketTitle}</h1>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                {lowBandwidthMode ? <WifiOff size={12} /> : <Wifi size={12} />}
                {lowBandwidthMode ? t.dataSaverOn : t.ready}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] font-bold text-sky-800">
                <Sparkles size={12} />
                {t.wingsReady}
              </span>
            </div>
            <p className="text-sm text-slate-600">{t.pocketSubtitle}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          <span className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-black text-emerald-900">
            <Camera size={15} />
            {t.cameraOnly}
          </span>
          <span className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-black text-slate-700">
            <ShieldCheck size={15} />
            {t.localOnly}
          </span>
          <button
            type="button"
            onClick={onOpenDesk}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-black text-white hover:bg-slate-800"
            title={t.wallPreview}
          >
            <MonitorUp size={16} />
            {t.wallMode}
          </button>
          <button
            type="button"
            onClick={onOpenFloatingController}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-black text-white hover:bg-emerald-800"
            title={t.pipMode}
          >
            <PanelTopOpen size={16} />
            {t.floatMode}
          </button>
          <button
            type="button"
            onClick={onOpenCompactController}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-black text-slate-800 hover:bg-slate-50"
            title={t.compactMode}
          >
            <PanelTopOpen size={16} />
            {t.compactModeShort}
          </button>
          <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700">
            <Languages size={15} className="text-slate-500" />
            <span className="sr-only">{t.language}</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-transparent text-sm font-black outline-none"
              aria-label={t.language}
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="ur">اردو</option>
            </select>
          </label>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <span className="block text-[11px] font-bold uppercase text-slate-500">{t.earnings}</span>
            <span className="text-lg font-black text-emerald-800">Rs {earnedToday}</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <User size={15} className="text-slate-500" />
            {isEditingName ? (
              <>
                <input
                  value={newNameInput}
                  onChange={(e) => setNewNameInput(e.target.value)}
                  className="w-28 rounded-md border border-slate-300 bg-white px-2 py-1 text-sm outline-none focus:border-emerald-600"
                  maxLength={18}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newNameInput.trim()) {
                      setWorkerName(newNameInput.trim());
                      setIsEditingName(false);
                      showToast(t.nameSaved);
                    }
                  }}
                  className="rounded-md bg-emerald-700 p-1.5 text-white hover:bg-emerald-800"
                  aria-label="Save name"
                >
                  <Check size={14} />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setNewNameInput(workerName);
                  setIsEditingName(true);
                }}
                className="flex items-center gap-1 text-sm font-bold text-slate-800 hover:text-emerald-800"
              >
                {workerName}
                <Edit3 size={13} />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
