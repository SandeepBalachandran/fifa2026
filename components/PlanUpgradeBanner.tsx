export function PlanUpgradeBanner() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-6 text-center dark:border-amber-800/50 dark:bg-amber-950/30">
      <p className="text-2xl">🔒</p>
      <div>
        <p className="font-bold text-amber-900 dark:text-amber-200">Historical Data Requires a Subscription</p>
        <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
          Access to past seasons is available on paid plans. Subscription plans coming soon!
        </p>
      </div>
      <button
        disabled
        className="mt-1 cursor-not-allowed rounded-full bg-amber-400/50 px-5 py-1.5 text-sm font-semibold text-amber-900/60 dark:bg-amber-700/30 dark:text-amber-400/60"
      >
        Subscribe — Coming Soon
      </button>
    </div>
  );
}
