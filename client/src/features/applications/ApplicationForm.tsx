import useApplicationForm from "../../hooks/useApplicationForm";
import useApplicationSubmit from "../../hooks/useApplicationSubmit";

type ApplicationFormProps = {
  isOnboarding?: boolean;
  isEdit?: boolean;
  id?: string;
  role?: string;
  company?: string;
  status?: string;
  appliedDate?: string;
  notes?: string | null;
  jobUrl?: string | null;
  onSkip?: () => void;
};

export default function ApplicationForm(props: ApplicationFormProps) {
  const { fields, setters, buildPayload } = useApplicationForm(props);
  const { loading, error, handleSubmit } = useApplicationSubmit(props);

  return (
    <div className="card card-border bg-base-100 w-full max-w-3xl">
      <div className="card-body gap-6">
        <div className="flex flex-col gap-2">
          {props.isOnboarding ? (
            <h2 className="card-title">2. Add an Application (Optional)</h2>
          ) : props.isEdit ? (
            <h2 className="card-title">Update Application</h2>
          ) : (
            <h2 className="card-title">Add an Application</h2>
          )}
          <p className="text-sm text-base-content/60">
            Keep it simple now. You can always edit details later.
          </p>
        </div>

        <form
          className="space-y-6"
          onSubmit={(event) => handleSubmit(event, buildPayload())}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Role</legend>
              <input
                required
                type="text"
                className="input w-full"
                placeholder="e.g. Sales Assistant"
                value={fields.role}
                onChange={(event) => {
                  setters.setRole(event.target.value);
                }}
              />
              <p className="label">Required</p>
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">Company</legend>
              <input
                required
                type="text"
                className="input w-full"
                placeholder="e.g. Acme Company Inc"
                value={fields.company}
                onChange={(event) => {
                  setters.setCompany(event.target.value);
                }}
              />
              <p className="label">Required</p>
            </fieldset>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Application Status</legend>
              <select
                className="select w-full"
                value={fields.status}
                onChange={(event) => setters.setStatus(event.target.value)}
              >
                <option value="APPLIED">Applied</option>
                <option value="INTERVIEW">Interview</option>
                <option value="OFFER">Offer</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <p className="label">Required</p>
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">Application Date</legend>
              <input
                type="datetime-local"
                className="input w-full"
                value={fields.appliedDate}
                onChange={(event) => {
                  setters.setAppliedDate(event.target.value);
                }}
              />
              <p className="label">Optional</p>
            </fieldset>
          </div>

          <div className="grid gap-4">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Extra Notes</legend>
              <textarea
                className="textarea h-24 w-full"
                placeholder="e.g. On-site, Internship"
                value={fields.notes}
                onChange={(event) => {
                  setters.setNotes(event.target.value);
                }}
              ></textarea>
              <div className="label">Optional</div>
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">Job Link</legend>
              <label className="input validator w-full">
                <svg
                  className="h-[1em] opacity-50"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <g
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    strokeWidth="2.5"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                  </g>
                </svg>
                <input
                  type="url"
                  placeholder="https://"
                  value={fields.link}
                  onChange={(event) => {
                    setters.setLink(event.target.value);
                  }}
                  pattern="^(https?://)?([a-zA-Z0-9]([a-zA-Z0-9\-].*[a-zA-Z0-9])?\.)+[a-zA-Z].*$"
                  title="Must be valid URL"
                />
              </label>
              <p className="label">Optional</p>
              <p className="validator-hint">Must be valid URL</p>
            </fieldset>
          </div>

          {error && (
            <div role="alert" className="alert alert-error">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 shrink-0 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {props.isOnboarding ? (
            <section className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-neutral"
                  onClick={props.onSkip}
                >
                  Skip for now
                </button>
                <button
                  className={`btn ${loading ? "btn-disabled" : "btn-primary"}`}
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save & Finish"}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Skip takes you to your dashboard. You can add applications
                later.
              </p>
            </section>
          ) : (
            <div className="flex items-center justify-end">
              <button
                className={`btn ${loading ? "btn-disabled" : "btn-primary"}`}
                type="submit"
              >
                {loading ? "Saving..." : "Save Application"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
