import { useState } from "react";

export type TypeResumeSuggestions = {
  miss: string[];
  improve: string[];
  add: string[];
  weak: string[];
};

export type ResumeSuggestionsProps = {
  sessionId: string;
  suggestions: TypeResumeSuggestions;
};

const SuggestionTypes = {
  miss: "MISS",
  improve: "IMPROVE",
  add: "ADD",
  weak: "WEAK",
} as const;

type SuggestionTypes = (typeof SuggestionTypes)[keyof typeof SuggestionTypes];

export function TrackResumeSuggestions(props: ResumeSuggestionsProps) {
  const [suggestionType, setSuggestionType] = useState<SuggestionTypes>("MISS");
  const [suggestion, setSuggestion] = useState();

  return (
    <div>
      {props.suggestions.miss.map((suggestion, i) => (
        <div
          className="card bg-error w-96 shadow-sm border border-red-500"
          key={i}
        >
          <div className="card-body">
            <h2 className="card-title">Miss</h2>
            <p>{suggestion}</p>
          </div>
        </div>
      ))}

      {props.suggestions.improve.map((suggestion, i) => (
        <div className="card bg-success w-96 shadow-sm" key={i}>
          <div className="card-body">
            <h2 className="card-title">Improve</h2>
            <p>{suggestion}</p>
          </div>
        </div>
      ))}

      {props.suggestions.add.map((suggestion, i) => (
        <div className="card bg-info w-96 shadow-sm" key={i}>
          <div className="card-body">
            <h2 className="card-title">Add</h2>
            <p>{suggestion}</p>
          </div>
        </div>
      ))}

      {props.suggestions.weak.map((suggestion, i) => (
        <div className="card bg-warning w-96 shadow-sm" key={i}>
          <div className="card-body">
            <h2 className="card-title">Weak</h2>
            <p>{suggestion}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
