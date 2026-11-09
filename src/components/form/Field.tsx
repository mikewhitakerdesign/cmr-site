import type { ReactNode } from "react";

/**
 * A labelled form field: visible label, optional hint, linked error. The control
 * is passed as children and must carry the matching `id`, plus
 * `aria-describedby` pointing at `${id}-hint` and/or `${id}-error` when they show.
 *
 * Shared by the Questions panel and the Join form (extracted from
 * QuestionsWidget with no behavior change).
 */
export function Field({
  id,
  label,
  hint,
  optional,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  optional?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-p-sm font-medium">
        {label}
        {optional && <span className="font-normal text-muted-foreground"> (optional)</span>}
      </label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="text-p-mini text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-p-mini font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
