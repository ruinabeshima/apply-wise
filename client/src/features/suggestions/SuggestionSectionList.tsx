import type { ResumeSuggestions } from "@apply-wise/shared";
import SuggestionCard from "./SuggestionCard";

type SuggestionSectionListProps = {
  suggestions: ResumeSuggestions;
  hidden: Set<string>;
  loading: boolean;
  onAccept: (key: string, e: React.MouseEvent<HTMLButtonElement>) => void;
  onDismiss: (key: string, e: React.MouseEvent<HTMLButtonElement>) => void;
};

export default function SuggestionSectionList(
  props: SuggestionSectionListProps,
) {
  const sections = [
    {
      key: "miss",
      label: "Missing",
      tone: "badge-error",
      border: "border-error/40",
      description: "Critical gaps to fill.",
      items: props.suggestions.miss,
    },
    {
      key: "improve",
      label: "Improve",
      tone: "badge-warning",
      border: "border-warning/40",
      description: "Refine clarity and impact.",
      items: props.suggestions.improve,
    },
    {
      key: "add",
      label: "Add",
      tone: "badge-info",
      border: "border-info/40",
      description: "Add relevant details.",
      items: props.suggestions.add,
    },
    {
      key: "weak",
      label: "Weak",
      tone: "badge-secondary",
      border: "border-secondary/40",
      description: "Strengthen these areas.",
      items: props.suggestions.weak,
    },
  ];
  return (
    <div className="flex flex-col gap-6">
      {sections.map((section) =>
        section.items.length === 0 ? null : (
          <div key={section.key} className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`badge ${section.tone}`}>{section.label}</span>
              <span className="text-sm text-base-content/60">
                {section.description}
              </span>
              <span className="text-xs text-base-content/50">
                {section.items.length} items
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {section.items.map((suggestion, i) => {
                const key = `${section.key}-${i}`;
                if (props.hidden.has(key)) return null;

                return (
                  <SuggestionCard
                    key={key}
                    label={section.label}
                    tone={section.tone}
                    border={section.border}
                    suggestion={suggestion}
                    disabled={props.loading}
                    onAccept={(e) => props.onAccept(key, e)}
                    onDismiss={(e) => props.onDismiss(key, e)}
                  />
                );
              })}
            </div>
          </div>
        ),
      )}
    </div>
  );
}
