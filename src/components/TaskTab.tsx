import type { FormEvent } from "react";
import { RefreshCw, Send } from "lucide-react";

import type { ServerJob, UiText } from "../appData";

interface TaskTabProps {
  t: UiText;
  jobs: ServerJob[];
  selectedJob: ServerJob | null;
  setSelectedJob: (job: ServerJob) => void;
  isLoadingJobs: boolean;
  loadJobsFromServer: () => void;
  sendCompletedTask: (event: FormEvent) => void | Promise<void>;
  jobResponse: string;
  setJobResponse: (value: string) => void;
  displayReward: (reward: string) => string;
  isRtl: boolean;
}

export function TaskTab({
  t,
  jobs,
  selectedJob,
  setSelectedJob,
  isLoadingJobs,
  loadJobsFromServer,
  sendCompletedTask,
  jobResponse,
  setJobResponse,
  displayReward,
  isRtl,
}: TaskTabProps) {
  return (
    <div className="space-y-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black">{t.tasksTitle}</h2>
          <p className="mt-1 text-sm text-slate-600">{t.tasksSubtitle}</p>
        </div>
        <button
          type="button"
          onClick={loadJobsFromServer}
          disabled={isLoadingJobs}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-800 hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw size={15} className={isLoadingJobs ? "animate-spin" : ""} />
          {isLoadingJobs ? t.loading : t.refresh}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {jobs.map((job) => {
          const isSelected = selectedJob?.id === job.id;
          return (
            <button
              key={job.id}
              type="button"
              onClick={() => setSelectedJob(job)}
              className={`flex min-h-36 flex-col rounded-lg border p-4 text-left transition ${
                isSelected
                  ? "border-emerald-600 bg-emerald-50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              } ${isRtl ? "text-right" : "text-left"}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-slate-900 px-2 py-1 text-[11px] font-black uppercase text-white">{job.type}</span>
                <span className="text-sm font-black text-emerald-800">{displayReward(job.reward)}</span>
              </div>
              <h3 className="mt-3 text-sm font-black text-slate-900">{job.id}</h3>
              <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">{job.payload}</p>
              <div className="mt-auto flex items-center justify-between border-t border-slate-200 pt-3 text-xs font-bold text-slate-500">
                <span>{job.dataSizeKb} KB</span>
                <span>{isSelected ? t.selected : t.select}</span>
              </div>
            </button>
          );
        })}
      </div>

      {selectedJob && (
        <form onSubmit={sendCompletedTask} className="rounded-lg border border-slate-200 bg-slate-50 p-4 sm:p-5">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase text-emerald-700">{t.selectedTask}</p>
              <h3 className="mt-1 text-lg font-black text-slate-900">{selectedJob.hindTask}</h3>
            </div>
            <span className="rounded-lg bg-white px-3 py-2 text-sm font-black text-emerald-800 shadow-sm">{displayReward(selectedJob.reward)}</span>
          </div>

          <div className="mb-4 rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-xs font-black uppercase text-slate-500">{t.taskData}</p>
            <p className="mt-1 text-sm leading-6 text-slate-800">{selectedJob.payload}</p>
          </div>

          <label htmlFor="response-field" className="mb-2 block text-sm font-black text-slate-800">
            {t.answerLabel}
          </label>
          <textarea
            id="response-field"
            rows={5}
            value={jobResponse}
            onChange={(e) => setJobResponse(e.target.value)}
            placeholder={t.answerPlaceholder}
            className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
            maxLength={220}
            required
          />

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-semibold text-slate-500">{t.deskHint}</p>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-800 active:scale-[0.99]"
            >
              {t.submit}
              <Send size={16} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
