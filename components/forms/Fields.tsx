"use client";

import { forwardRef, type ComponentProps, type ReactNode } from "react";
import { CircleAlert, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

const controlBase =
  "block w-full rounded-[8px] border bg-white px-4 text-base text-navy transition-colors duration-150 placeholder:text-muted focus:border-blue focus:outline-3 focus:outline-offset-1 focus:outline-blue disabled:bg-surface";

function controlClass(error?: string) {
  return cn(controlBase, error ? "border-danger" : "border-field");
}

type FieldShellProps = {
  id: string;
  label: string;
  required?: boolean;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
  className?: string;
};

export function describedBy(id: string, hint?: ReactNode, error?: string) {
  return [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
}

function FieldShell({ id, label, required, hint, error, children, className }: FieldShellProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-[0.9375rem] font-semibold text-navy">
        {label}{" "}
        <span className="font-normal text-muted">{required ? "(required)" : "(optional)"}</span>
      </label>
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-sm text-muted">
          {hint}
        </p>
      )}
      <div className="mt-2">{children}</div>
      <FieldError id={id} error={error} />
    </div>
  );
}

export function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={`${id}-error`} className="mt-2 flex items-start gap-1.5 text-sm font-medium text-danger">
      <CircleAlert size={16} strokeWidth={2} aria-hidden="true" className="mt-0.5 shrink-0" />
      <span>{error}</span>
    </p>
  );
}

type BaseProps = { id: string; label: string; required?: boolean; hint?: ReactNode; error?: string; className?: string };

export const TextField = forwardRef<HTMLInputElement, BaseProps & Omit<ComponentProps<"input">, "id" | "className">>(
  function TextField({ id, label, required, hint, error, className, ...input }, ref) {
    return (
      <FieldShell id={id} label={label} required={required} hint={hint} error={error} className={className}>
        <input
          ref={ref}
          id={id}
          name={id}
          required={required}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
          className={cn(controlClass(error), "min-h-12 py-2.5")}
          {...input}
        />
      </FieldShell>
    );
  },
);

export const TextAreaField = forwardRef<
  HTMLTextAreaElement,
  BaseProps & Omit<ComponentProps<"textarea">, "id" | "className">
>(function TextAreaField({ id, label, required, hint, error, className, ...textarea }, ref) {
  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={error} className={className}>
      <textarea
        ref={ref}
        id={id}
        name={id}
        required={required}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn(controlClass(error), "min-h-36 resize-y py-3 leading-relaxed")}
        {...textarea}
      />
    </FieldShell>
  );
});

export const SelectField = forwardRef<
  HTMLSelectElement,
  BaseProps & { options: ReadonlyArray<{ value: string; label: string }>; placeholder: string } & Omit<
      ComponentProps<"select">,
      "id" | "className"
    >
>(function SelectField({ id, label, required, hint, error, className, options, placeholder, ...select }, ref) {
  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={error} className={className}>
      <div className="relative">
        <select
          ref={ref}
          id={id}
          name={id}
          required={required}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
          className={cn(controlClass(error), "min-h-12 appearance-none py-2.5 pr-11")}
          {...select}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={20}
          strokeWidth={1.75}
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-navy"
        />
      </div>
    </FieldShell>
  );
});

export const CheckboxField = forwardRef<
  HTMLInputElement,
  { id: string; label: ReactNode; error?: string; className?: string } & Omit<ComponentProps<"input">, "id" | "type" | "className">
>(function CheckboxField({ id, label, error, className, ...input }, ref) {
  return (
    <div className={className}>
      <div className="flex items-start gap-3">
        <input
          ref={ref}
          id={id}
          name={id}
          type="checkbox"
          required
          aria-required
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="mt-0.5 size-6 shrink-0 cursor-pointer rounded-[4px] border-field accent-blue"
          {...input}
        />
        <label htmlFor={id} className="text-[0.9375rem] leading-relaxed text-navy">
          {label} <span className="text-muted">(required)</span>
        </label>
      </div>
      <FieldError id={id} error={error} />
    </div>
  );
});

/** Hidden from people and assistive tech; bots tend to fill it. */
export function Honeypot({ name, value, onChange }: { name: string; value: string; onChange: (v: string) => void }) {
  return (
    <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
      <label htmlFor={`hp-${name}`}>Leave this field empty</label>
      <input
        id={`hp-${name}`}
        name={name}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

type SummaryItem = { id: string; message: string };

export const ErrorSummary = forwardRef<HTMLDivElement, { items: SummaryItem[]; title?: string }>(function ErrorSummary(
  { items, title = "Please check a few details" },
  ref,
) {
  if (items.length === 0) return null;
  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="alert"
      aria-labelledby="error-summary-title"
      className="rounded-[8px] border border-danger bg-danger-bg p-5 text-navy focus:outline-3 focus:outline-offset-2 focus:outline-danger"
    >
      <h3 id="error-summary-title" className="flex items-center gap-2 text-base font-semibold text-danger">
        <CircleAlert size={20} strokeWidth={2} aria-hidden="true" />
        {title}
      </h3>
      <ul className="mt-3 list-disc space-y-1.5 pl-9 text-[0.9375rem]">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="font-medium text-navy underline decoration-danger decoration-2 underline-offset-4"
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(item.id);
                el?.focus();
                el?.scrollIntoView({ block: "center", behavior: "smooth" });
              }}
            >
              {item.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
});

export function FormAlert({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className="rounded-[8px] border border-danger bg-danger-bg p-4 text-[0.9375rem] text-navy">
      {children}
    </div>
  );
}
