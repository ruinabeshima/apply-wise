type SuggestionCardProps = {
  label: string;
  tone: string;
  border: string;
  suggestion: string;
  disabled: boolean;
  onAccept: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onDismiss: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

export default function SuggestionCard(props: SuggestionCardProps) {
  return (
    <div
      className={`card bg-base-100 border ${props.border} shadow-sm transition-shadow hover:shadow-md`}
    >
      <div className="card-body gap-3">
        <div className="flex items-start justify-between gap-3">
          <h4 className="font-semibold text-base-content">{props.label}</h4>
          <span className={`badge badge-outline ${props.tone}`}>
            Suggestion
          </span>
        </div>
        <p className="text-sm text-base-content/70">{props.suggestion}</p>
        <div className="card-actions justify-end gap-2">
          <button
            className="btn btn-sm btn-outline btn-success"
            aria-label="Accept suggestion"
            onClick={props.onAccept}
            disabled={props.disabled}
          >
            Accept
          </button>
          <button
            className="btn btn-sm btn-outline btn-error"
            aria-label="Dismiss suggestion"
            onClick={props.onDismiss}
            disabled={props.disabled}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
