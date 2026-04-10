import { Link } from "react-router-dom";

type ApplicationCardProps = {
  id: string;
  role: string;
  company: string;
  status: "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED";
  appliedDate: Date;
  notes: null | string;
  jobUrl: null | string;
};

export default function ApplicationCard(props: ApplicationCardProps) {
  return (
    <Link to={`/applications/${props.id}`}>
      <div
        key={props.id}
        className="card bg-base-100 shadow-md border border-base-200 hover:shadow-lg hover:cursor-pointer transition-shadow"
      >
        <div className="card-body gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="card-title text-lg wrap-break-word">
                {props.role}
              </h2>
              <p className="text-base-content/70 font-medium truncate">
                {props.company}
              </p>
            </div>
            <div
              className={`badge badge-soft shrink-0 ${
                props.status === "APPLIED"
                  ? "badge-info"
                  : props.status === "INTERVIEW"
                    ? "badge-warning"
                    : props.status === "OFFER"
                      ? "badge-success"
                      : props.status === "REJECTED"
                        ? "badge-error"
                        : "badge-neutral"
              }`}
            >
              {props.status}
            </div>
          </div>

          <div className="divider my-0" />

          <div className="flex flex-col gap-1 text-sm text-base-content/70">
            <p>
              ⏰ Applied:{" "}
              <span className="text-base-content font-medium">
                {new Date(props.appliedDate).toLocaleDateString()}
              </span>
            </p>
            {props.notes && (
              <p>
                📖 <span className="text-base-content">{props.notes}</span>
              </p>
            )}
          </div>

          {props.jobUrl && (
            <div className="card-actions justify-end mt-1">
              <a
                href={props.jobUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-soft btn-primary btn-sm"
              >
                View Job →
              </a>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
