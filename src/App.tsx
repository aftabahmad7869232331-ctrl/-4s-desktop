import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ExternalLink,
  Hand,
  Keyboard,
  MonitorUp,
  MousePointer2,
  PanelTopOpen,
  ScanLine,
} from "lucide-react";

import { FINGERS, KEYBOARD_KEYS, fallbackJobs, ui, type GestureMode, type Language, type ServerJob, type SubmittedWork, type TabId } from "./appData";
import { createControllerMarkup } from "./controllerMarkup";
import { AppHeader } from "./components/AppHeader";
import { AppNavbar } from "./components/AppNavbar";
import { Sidebar } from "./components/Sidebar";
import { SetupGuide } from "./components/SetupGuide";
import { TaskTab } from "./components/TaskTab";

function readCachedLedger() {
  try {
    const cached = localStorage.getItem("air_cached_ledger");
    const parsed = cached ? JSON.parse(cached) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Unable to read cached 4S ledger.", error);
    return [];
  }
}

export default function App() {
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem("4s_language") as Language) || "en");
  const [activeTab, setActiveTab] = useState<TabId>("tasks");
  const [lowBandwidthMode, setLowBandwidthMode] = useState(() => localStorage.getItem("air_low_bw") === "true");
  const [workerName, setWorkerName] = useState(() => localStorage.getItem("air_worker_name") || "Student");
  const [isEditingName, setIsEditingName] = useState(false);
  const [newNameInput, setNewNameInput] = useState(workerName);
  const [systemAlert, setSystemAlert] = useState<string>(ui.en.alert);
  const [jobs, setJobs] = useState<ServerJob[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [selectedJob, setSelectedJob] = useState<ServerJob | null>(null);
  const [jobResponse, setJobResponse] = useState("");
  const [earningsLedger, setEarningsLedger] = useState<SubmittedWork[]>(readCachedLedger);
  const [earnedToday, setEarnedToday] = useState(() => Number(localStorage.getItem("air_earned_today")) || 0);
  const [scannedFingers, setScannedFingers] = useState<string[]>(["L Index", "R Index"]);
  const [activeFinger, setActiveFinger] = useState("R Index");
  const [airMouse, setAirMouse] = useState({ x: 56, y: 42 });
  const [gestureMode, setGestureMode] = useState<GestureMode>("typing");
  const [wallScale, setWallScale] = useState(82);
  const [isCompactControllerOpen, setIsCompactControllerOpen] = useState(false);

  const t = ui[language];
  const isRtl = language === "ur";
  const completedCount = earningsLedger.length;
  const nextJob = useMemo(() => jobs.find((job) => job.id !== selectedJob?.id) || jobs[0], [jobs, selectedJob]);
  const scanProgress = Math.round((scannedFingers.length / FINGERS.length) * 100);

  const showToast = (message: string) => {
    setSystemAlert(message);
    window.setTimeout(() => setSystemAlert(""), 4200);
  };

  useEffect(() => {
    localStorage.setItem("4s_language", language);
    document.documentElement.lang = language;
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
    setSystemAlert(ui[language].alert);
  }, [language, isRtl]);

  useEffect(() => {
    localStorage.setItem("air_low_bw", String(lowBandwidthMode));
  }, [lowBandwidthMode]);

  useEffect(() => {
    localStorage.setItem("air_worker_name", workerName);
  }, [workerName]);

  useEffect(() => {
    localStorage.setItem("air_cached_ledger", JSON.stringify(earningsLedger));
  }, [earningsLedger]);

  useEffect(() => {
    localStorage.setItem("air_earned_today", String(earnedToday));
  }, [earnedToday]);

  const loadJobsFromServer = async () => {
    setIsLoadingJobs(true);
    try {
      const res = await fetch("/api/jobs");
      const result = await res.json();
      if (result.success && result.data?.length) {
        setJobs(result.data);
        setSelectedJob((current) => current || result.data[0]);
        showToast(t.jobsLoaded);
      } else {
        throw new Error("No jobs returned");
      }
    } catch (error) {
      console.warn("Jobs API unavailable, using local fallback jobs.", error);
      setJobs(fallbackJobs);
      setSelectedJob((current) => current || fallbackJobs[0]);
      showToast(t.localJobs);
    } finally {
      setIsLoadingJobs(false);
    }
  };

  useEffect(() => {
    loadJobsFromServer();
    // Initial fetch should run once. Language changes should not refetch tasks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const parseReward = (reward: string) => Number(reward.replace(/[^\d]/g, "")) || 10;
  const displayReward = (reward: string) => {
    const amount = parseReward(reward);
    return amount ? `Rs ${amount}` : reward;
  };

  const appendText = (value: string) => {
    setJobResponse((current) => `${current}${value}`);
  };

  const runControllerCommand = (command: string, value = "") => {
    if (command === "append") appendText(value);
    if (command === "space") appendText(" ");
    if (command === "back") setJobResponse((current) => current.slice(0, -1));
    if (command === "desk") setActiveTab("desk");
    if (command === "tasks") setActiveTab("tasks");
  };

  useEffect(() => {
    const channel = "BroadcastChannel" in window ? new BroadcastChannel("4s-controller") : null;
    const handleMessage = (event: MessageEvent) => {
      const { command, value } = event.data || {};
      if (typeof command === "string") runControllerCommand(command, value);
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== "4s_controller_command" || !event.newValue) return;
      try {
        const { command, value } = JSON.parse(event.newValue);
        if (typeof command === "string") runControllerCommand(command, value);
      } catch (error) {
        console.warn("Unable to read 4S controller command.", error);
      }
    };

    channel?.addEventListener("message", handleMessage);
    window.addEventListener("storage", handleStorage);
    return () => {
      channel?.removeEventListener("message", handleMessage);
      channel?.close();
      window.removeEventListener("storage", handleStorage);
    };
    // Controller commands use stable React state setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const writeControllerWindow = (controller: Window, title: string, description: string, note: string) => {
    controller.document.write(createControllerMarkup(title, description, note));
    controller.document.close();
    controller.focus();
  };

  const shouldUseInAppController = () => {
    return window.matchMedia("(max-width: 760px), (pointer: coarse)").matches;
  };

  const openCompanionController = () => {
    if (shouldUseInAppController()) {
      setIsCompactControllerOpen(true);
      showToast(t.compactModeNote);
      return;
    }

    const controller = window.open("", "4s-companion-controller", "width=360,height=520,resizable=yes,scrollbars=no");
    if (!controller) {
      showToast(t.companionBlocked);
      return;
    }

    writeControllerWindow(
      controller,
      "4S companion",
      "Keep this small window beside another app. Minimized browser windows may pause camera gestures.",
      "For other apps, use side-by-side or paste the typed answer. A web app cannot safely control every app after the main 4S window is minimized."
    );
    showToast(t.companionOpened);
  };

  const openFloatingController = async () => {
    if (shouldUseInAppController()) {
      setIsCompactControllerOpen(true);
      showToast(t.compactModeNote);
      return;
    }

    const pipApi = (window as typeof window & {
      documentPictureInPicture?: {
        requestWindow: (options?: { width?: number; height?: number }) => Promise<Window>;
      };
    }).documentPictureInPicture;

    if (!pipApi?.requestWindow) {
      openCompanionController();
      return;
    }

    try {
      const controller = await pipApi.requestWindow({ width: 360, height: 520 });
      writeControllerWindow(
        controller,
        "4S floating keyboard",
        "This small controller is made for Chrome and Edge. Keep 4S open in the background and use another app beside it.",
        "This floating screen shows the ready keyboard only. If the browser minimizes fully, camera gestures may still pause."
      );
      showToast(t.pipOpened);
    } catch (error) {
      console.warn("Picture-in-picture controller unavailable, opening pop-out fallback.", error);
      openCompanionController();
    }
  };

  const scanFinger = (finger: string) => {
    setActiveFinger(finger);
    setScannedFingers((current) => current.includes(finger) ? current : [...current, finger]);
    showToast(`${finger} ${t.scanDone}`);
  };

  const scanNextFinger = () => {
    const nextFinger = FINGERS.find((finger) => !scannedFingers.includes(finger));
    if (!nextFinger) {
      showToast(t.allFingersReady);
      return;
    }

    scanFinger(nextFinger);
  };

  const minimize4s = () => {
    setActiveTab("desk");
    setGestureMode("typing");
    setIsCompactControllerOpen(true);
    void openFloatingController();
  };

  const sendCompletedTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob || !jobResponse.trim()) {
      showToast(t.needAnswer);
      return;
    }

    const record: SubmittedWork = {
      jobId: selectedJob.id,
      answer: jobResponse.trim(),
      workerName,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      rewardValue: selectedJob.reward,
    };

    try {
      const resp = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: selectedJob.id,
          answer: jobResponse.trim(),
          workerName,
        }),
      });
      const result = await resp.json();
      if (!result.success) throw new Error(result.message || "Submit failed");
      showToast(`${t.submitted} ${displayReward(selectedJob.reward)}`);
    } catch (err) {
      console.warn("Submit failed, saving locally.", err);
      record.timestamp = `${record.timestamp} (offline)`;
      showToast(`${t.savedOffline} ${displayReward(selectedJob.reward)}`);
    }

    setEarningsLedger((current) => [record, ...current]);
    setEarnedToday((current) => current + parseReward(selectedJob.reward));
    setJobResponse("");

    const currentIndex = jobs.findIndex((job) => job.id === selectedJob.id);
    const followingJob = jobs[currentIndex + 1] || nextJob;
    if (followingJob) setSelectedJob(followingJob);
  };

  return (
    <div className="min-h-screen bg-[#f8f4ec] text-slate-900 antialiased" dir={isRtl ? "rtl" : "ltr"}>
      <div className="sticky top-0 z-40 shadow-sm">
        <AppHeader
          t={t}
          language={language}
          setLanguage={setLanguage}
          lowBandwidthMode={lowBandwidthMode}
          earnedToday={earnedToday}
          workerName={workerName}
          isEditingName={isEditingName}
          setIsEditingName={setIsEditingName}
          newNameInput={newNameInput}
          setNewNameInput={setNewNameInput}
          setWorkerName={setWorkerName}
          showToast={showToast}
          onOpenDesk={() => setActiveTab("desk")}
          onOpenFloatingController={openFloatingController}
          onOpenCompactController={() => setIsCompactControllerOpen(true)}
        />

        <AppNavbar
          t={t}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedJob={selectedJob}
          completedCount={completedCount}
          scanProgress={scanProgress}
          onScanNext={scanNextFinger}
          onMinimize4s={minimize4s}
        />
      </div>

      <main className="mx-auto grid max-w-[1280px] grid-cols-1 gap-5 px-4 py-5 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Sidebar
          t={t}
          systemAlert={systemAlert}
          lowBandwidthMode={lowBandwidthMode}
          setLowBandwidthMode={setLowBandwidthMode}
          showToast={showToast}
          scanProgress={scanProgress}
          scannedFingers={scannedFingers}
          scanFinger={scanFinger}
          earningsLedger={earningsLedger}
          completedCount={completedCount}
          displayReward={displayReward}
          isRtl={isRtl}
        />

        <section className="min-w-0 space-y-4">
          {activeTab === "tasks" && (
            <TaskTab
              t={t}
              jobs={jobs}
              selectedJob={selectedJob}
              setSelectedJob={setSelectedJob}
              isLoadingJobs={isLoadingJobs}
              loadJobsFromServer={loadJobsFromServer}
              sendCompletedTask={sendCompletedTask}
              jobResponse={jobResponse}
              setJobResponse={setJobResponse}
              displayReward={displayReward}
              isRtl={isRtl}
            />
          )}

          {activeTab === "desk" && (
            <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="grid gap-4 xl:grid-cols-[1fr_280px]">
                <section className="rounded-lg border border-slate-200 bg-slate-950 p-4 text-white">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <h2 className="flex items-center gap-2 text-xl font-black">
                        <MonitorUp size={20} />
                        {t.wallPreview}
                      </h2>
                      <p className="mt-1 text-sm text-slate-300">{t.wallPreviewText}</p>
                    </div>
                    <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-black text-emerald-200">{t.scale} {wallScale}%</span>
                  </div>

                  <div className="relative min-h-[340px] overflow-hidden rounded-lg border border-white/10 bg-[#e9f7f0] p-4 text-slate-900">
                    <div className="mb-3 flex items-center justify-between rounded-md bg-white px-3 py-2 shadow-sm">
                      <div className="flex items-center gap-2 text-xs font-black text-slate-700">
                        <span className="h-3 w-3 rounded-full bg-red-400" />
                        <span className="h-3 w-3 rounded-full bg-amber-400" />
                        <span className="h-3 w-3 rounded-full bg-emerald-500" />
                        {t.desktopTitle}
                      </div>
                      <span className="text-xs font-bold text-slate-500">{activeFinger} {t.active}</span>
                    </div>

                    <div
                      className="grid gap-3 transition-transform"
                      style={{ transform: `scale(${wallScale / 100})`, transformOrigin: "top center" }}
                    >
                      <div className="rounded-lg border border-emerald-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-black uppercase text-emerald-700">{t.currentTask}</p>
                        <h3 className="mt-1 text-lg font-black">{selectedJob?.hindTask || t.chooseTask}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{selectedJob?.payload || t.wallTaskFallback}</p>
                      </div>

                      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-black uppercase text-slate-500">{t.typedAnswer}</p>
                        <p className="mt-2 min-h-16 text-lg font-bold leading-8">{jobResponse || t.typeFallback}</p>
                      </div>
                    </div>

                    <div
                      className="absolute flex h-8 w-8 items-center justify-center rounded-full border-2 border-emerald-700 bg-white text-emerald-800 shadow-lg transition-all"
                      style={{ left: `${airMouse.x}%`, top: `${airMouse.y}%`, transform: "translate(-50%, -50%)" }}
                    >
                      <MousePointer2 size={17} />
                    </div>
                  </div>
                </section>

                <section className="space-y-3">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <h3 className="flex items-center gap-2 text-sm font-black uppercase text-slate-800">
                      <ScanLine size={16} className="text-emerald-700" />
                      {t.gestureMode}
                    </h3>
                    <div className="mt-3 grid gap-2">
                      {[
                        { id: "typing", label: t.modes.typing, icon: Keyboard },
                        { id: "mouse", label: t.modes.mouse, icon: MousePointer2 },
                        { id: "scroll", label: t.modes.scroll, icon: Hand },
                      ].map((mode) => {
                        const Icon = mode.icon;
                        return (
                          <button
                            key={mode.id}
                            type="button"
                            onClick={() => setGestureMode(mode.id as GestureMode)}
                            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-black transition ${
                              gestureMode === mode.id ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <Icon size={15} />
                            {mode.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <h3 className="flex items-center gap-2 text-sm font-black uppercase text-amber-950">
                      <PanelTopOpen size={16} />
                      {t.workflowContinuity}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-amber-900">{t.workflowNote}</p>
                    <div className="mt-3 grid gap-2">
                      <button
                        type="button"
                        onClick={openFloatingController}
                        className="flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-black text-white hover:bg-emerald-800"
                      >
                        <ExternalLink size={15} />
                        {t.pipMode}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCompactControllerOpen(true)}
                        className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-black text-white hover:bg-slate-800"
                      >
                        <PanelTopOpen size={15} />
                        {t.compactMode}
                      </button>
                      <button
                        type="button"
                        onClick={openCompanionController}
                        className="flex items-center justify-center gap-2 rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm font-black text-amber-950 hover:bg-amber-100"
                      >
                        <ExternalLink size={15} />
                        {t.popoutMode}
                      </button>
                    </div>
                    <div className="mt-3 space-y-1 text-xs font-semibold leading-5 text-amber-900">
                      <p>{t.pipModeNote}</p>
                      <p>{t.compactModeNote}</p>
                      <p>{t.popoutModeNote}</p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <h3 className="mb-3 text-sm font-black uppercase text-slate-800">{t.airMouseControl}</h3>
                    <label className="mb-2 block text-xs font-bold text-slate-500">{t.xPosition}</label>
                    <input
                      type="range"
                      min="5"
                      max="95"
                      value={airMouse.x}
                      onChange={(e) => setAirMouse((current) => ({ ...current, x: Number(e.target.value) }))}
                      className="mb-3 w-full accent-emerald-700"
                    />
                    <label className="mb-2 block text-xs font-bold text-slate-500">{t.yPosition}</label>
                    <input
                      type="range"
                      min="12"
                      max="88"
                      value={airMouse.y}
                      onChange={(e) => setAirMouse((current) => ({ ...current, y: Number(e.target.value) }))}
                      className="mb-3 w-full accent-emerald-700"
                    />
                    <label className="mb-2 block text-xs font-bold text-slate-500">{t.wallScale}</label>
                    <input
                      type="range"
                      min="72"
                      max="100"
                      value={wallScale}
                      onChange={(e) => setWallScale(Number(e.target.value))}
                      className="w-full accent-emerald-700"
                    />
                  </div>
                </section>
              </div>

              <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-sm font-black uppercase text-slate-800">{t.airKeyboard}</h3>
                    <p className="text-sm text-slate-600">{t.airKeyboardNote}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-600">{t.mode}: {gestureMode}</span>
                </div>
                <div className="grid grid-cols-7 gap-2 sm:grid-cols-10">
                  {KEYBOARD_KEYS.map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => appendText(key)}
                      className="min-h-11 rounded-lg border border-slate-300 bg-white text-sm font-black text-slate-800 hover:bg-slate-50"
                    >
                      {key}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => appendText(" ")}
                    className="col-span-3 min-h-11 rounded-lg bg-slate-900 text-sm font-black text-white hover:bg-slate-800"
                  >
                    {t.space}
                  </button>
                  <button
                    type="button"
                    onClick={() => setJobResponse((current) => current.slice(0, -1))}
                    className="col-span-2 min-h-11 rounded-lg border border-slate-300 bg-white text-sm font-black text-slate-800 hover:bg-slate-50"
                  >
                    {t.back}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("tasks")}
                    className="col-span-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-emerald-700 text-sm font-black text-white hover:bg-emerald-800"
                  >
                    {t.submitSide}
                    <ArrowRight size={15} />
                  </button>
                </div>
              </section>
            </div>
          )}

          {activeTab === "setup" && (
            <SetupGuide
              t={t}
              scanProgress={scanProgress}
              onScanNext={scanNextFinger}
              onOpenDesk={() => setActiveTab("desk")}
              onMinimize4s={minimize4s}
            />
          )}

          {activeTab === "help" && (
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black">{t.helpTitle}</h2>
              <div className="mt-4 grid gap-3 text-sm leading-6 text-slate-700">
                {t.helpItems.map(([title, body]) => (
                  <p key={title}>
                    <strong>{title}:</strong> {body}
                  </p>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      {isCompactControllerOpen && (
        <div className="fixed inset-x-3 bottom-3 z-50 rounded-lg border border-slate-300 bg-white p-3 shadow-2xl md:left-auto md:w-[420px]">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-black uppercase text-slate-900">
                <PanelTopOpen size={15} className="text-emerald-700" />
                {t.compactMode}
              </h2>
              <p className="text-xs font-semibold text-slate-500">{t.mode}: {gestureMode}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsCompactControllerOpen(false)}
              className="rounded-md border border-slate-200 px-2 py-1 text-xs font-black text-slate-700 hover:bg-slate-50"
            >
              {t.compactClose}
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {KEYBOARD_KEYS.slice(0, 21).map((key) => (
              <button
                key={`compact-${key}`}
                type="button"
                onClick={() => appendText(key)}
                className="min-h-9 rounded-md border border-slate-300 bg-white text-xs font-black text-slate-800 hover:bg-slate-50"
              >
                {key}
              </button>
            ))}
            <button
              type="button"
              onClick={() => appendText(" ")}
              className="col-span-2 min-h-9 rounded-md bg-slate-900 text-xs font-black text-white hover:bg-slate-800"
            >
              {t.space}
            </button>
            <button
              type="button"
              onClick={() => setJobResponse((current) => current.slice(0, -1))}
              className="col-span-2 min-h-9 rounded-md border border-slate-300 bg-white text-xs font-black text-slate-800 hover:bg-slate-50"
            >
              {t.back}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("tasks")}
              className="col-span-3 min-h-9 rounded-md bg-emerald-700 text-xs font-black text-white hover:bg-emerald-800"
            >
              {t.submitSide}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
