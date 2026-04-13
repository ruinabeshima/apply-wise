type SuggestionHeaderStatsProps = {
  total: number;
  remaining: number;
  acceptedCount: number;
  dismissedCount: number;
  loading: boolean;
  loadingLabel: string;
  resumeName: string;
  onResumeNameChange: (name: string) => void;
};

export default function SuggestionHeaderStats(
  props: SuggestionHeaderStatsProps,
) {
  return (
    <>
      <label className="form-control w-full lg:max-w-xs">
        <div className="label">
          <span className="label-text">Tailored resume name</span>
        </div>
        <input
          type="text"
          className="input input-bordered"
          placeholder="e.g. Product Designer - Stripe"
          value={props.resumeName}
          maxLength={30}
          onChange={(event) => props.onResumeNameChange(event.target.value)}
        />
        <div className="label">
          <span className="label-text-alt text-base-content/50">
            Optional. Enter before finishing all suggestions.
          </span>
        </div>
      </label>
      <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-base-content/50">
                Tailored Suggestions
              </p>
              <h3 className="text-lg font-semibold">
                Review and refine your resume
              </h3>
              <p className="text-sm text-base-content/60">
                Accept or dismiss each suggestion to generate a tailored
                version.
              </p>
            </div>
          </div>

          <div className="stats stats-vertical lg:stats-horizontal bg-base-200/40">
            <div className="stat">
              <div className="stat-title">Total</div>
              <div className="stat-value text-primary">{props.total}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Remaining</div>
              <div className="stat-value text-accent">{props.remaining}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Accepted</div>
              <div className="stat-value text-success">
                {props.acceptedCount}
              </div>
            </div>
            <div className="stat">
              <div className="stat-title">Dismissed</div>
              <div className="stat-value text-error">
                {props.dismissedCount}
              </div>
            </div>
          </div>

          <progress
            className="progress progress-primary"
            value={props.total - props.remaining}
            max={Math.max(props.total, 1)}
          ></progress>

          {props.loading && (
            <div className="alert alert-info">
              <span className="loading loading-spinner loading-sm"></span>
              <span>{props.loadingLabel}</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
