"use client";

/** FR-14 summary cards. stats comes from lib/tasks.computeStats. */
export default function DashboardStats({ projectCount = 0, stats = {} }) {
  const { total = 0, todo = 0, in_progress = 0, done = 0, overdue = 0 } = stats;

  const cards = [
    {
      title: "Active Projects",
      value: projectCount,
      change: "+12%",
      iconClass:
        "bg-green-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
          <polyline points="2 17 12 22 22 17"></polyline>
          <polyline points="2 12 12 17 22 12"></polyline>
        </svg>
      ),
    },
    {
      title: "Total Tasks",
      value: total,
      change: "+8%",
      iconClass: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"></path>
          <rect x="9" y="3" width="6" height="4" rx="1"></rect>
        </svg>
      ),
    },
    {
      title: "Completed Tasks",
      value: done,
      change: "+15%",
      iconClass:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6 9 17l-5-5"></path>
        </svg>
      ),
    },
    {
      title: "Overdue Tasks",
      value: overdue,
      danger: overdue > 0,
      change: overdue > 0 ? "Needs attention" : "All clear",
      iconClass: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-300",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      ),
    },
  ];

  return (
    <section aria-label="Summary" className="mb-8">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`flex flex-col justify-between rounded-[20px] border p-6 shadow-sm transition-[transform,box-shadow] duration-200 ${
              card.danger
                ? "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30"
                : "border-slate-100 bg-white dark:border-slate-700 dark:bg-slate-800"
            }`}
          >
            {/* Icon and trend indicator */}
            <div className="mb-4 flex items-start justify-between">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.iconClass}`}
              >
                {card.icon}
              </div>
              <div className="flex h-7.5 w-7.5 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="7" y1="17" x2="17" y2="7"></line>
                  <polyline points="7 7 17 7 17 17"></polyline>
                </svg>
              </div>
            </div>

            {/* Metric title and value */}
            <div>
              <span className="mb-1.5 block text-[13px] font-semibold text-slate-500 dark:text-slate-400">
                {card.title}
              </span>
              <div
                className={`text-[32px] font-extrabold tracking-tight ${card.danger ? "text-red-600 dark:text-red-400" : "text-slate-800 dark:text-white"}`}
              >
                {card.value}
              </div>
            </div>

            {/* Change indicator */}
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-700">
              <span
                className={`text-xs font-semibold ${card.danger ? "text-red-600 dark:text-red-400" : "text-teal-700 dark:text-teal-400"}`}
              >
                {card.change}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                Dynamic changes
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
