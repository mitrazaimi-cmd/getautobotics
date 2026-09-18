"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type * as z from "zod/mini";
import { fieldErrorsFrom, HONEYPOT_FIELD, type FieldErrors } from "@/lib/validation";

export type SubmitStatus = "idle" | "submitting" | "success" | "error";

type Options<S extends z.ZodMiniObject> = {
  schema: S;
  initialValues: z.input<S>;
  endpoint: string;
  /** Field order for the error summary (matches visual order). */
  fieldOrder: Array<keyof z.input<S> & string>;
  /** Prefix for input ids so two forms can share a page. */
  idPrefix: string;
  onSuccess?: () => void;
};

/**
 * Client-side form state with Zod validation on blur and on submit,
 * a focusable error summary, honeypot + fill-time anti-spam fields,
 * and server field errors mapped back onto inputs.
 */
export function useValidatedForm<S extends z.ZodMiniObject>({
  schema,
  initialValues,
  endpoint,
  fieldOrder,
  idPrefix,
  onSuccess,
}: Options<S>) {
  type Values = z.input<S>;
  type Field = keyof Values & string;

  const [values, setValues] = useState<Values>(initialValues);
  const [errors, setErrors] = useState<FieldErrors<Field>>({});
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [summaryItems, setSummaryItems] = useState<Array<{ id: string; message: string }>>([]);
  const [honeypot, setHoneypot] = useState("");
  const startedAt = useRef<number>(0);
  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const validateField = useCallback(
    (field: Field, nextValues: Values) => {
      const result = schema.safeParse(nextValues);
      const message = result.success ? undefined : fieldErrorsFrom<Field>(result.error)[field];
      setErrors((prev) => {
        if (prev[field] === message) return prev;
        const next = { ...prev };
        if (message) next[field] = message;
        else delete next[field];
        return next;
      });
    },
    [schema],
  );

  const setValue = useCallback(
    <K extends Field>(field: K, value: Values[K]) => {
      const next = { ...values, [field]: value };
      setValues(next);
      // Once a field has been visited (or has an error), re-validate as the user fixes it.
      if (touched[field] || errors[field]) validateField(field, next);
    },
    [values, touched, errors, validateField],
  );

  const onBlur = useCallback(
    (field: Field) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      validateField(field, values);
    },
    [values, validateField],
  );

  const showSummary = (fieldErrors: FieldErrors<Field>) => {
    const items = fieldOrder
      .filter((f) => fieldErrors[f])
      .map((f) => ({ id: `${idPrefix}-${f}`, message: fieldErrors[f]! }));
    setSummaryItems(items);
    requestAnimationFrame(() => summaryRef.current?.focus());
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "submitting") return;
    setFormError(null);

    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors = fieldErrorsFrom<Field>(parsed.error);
      setErrors(fieldErrors);
      setTouched(Object.fromEntries(fieldOrder.map((f) => [f, true])) as Record<Field, boolean>);
      showSummary(fieldErrors);
      return;
    }

    setSummaryItems([]);
    setStatus("submitting");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, [HONEYPOT_FIELD]: honeypot, startedAt: startedAt.current }),
      });
      const body = (await res.json().catch(() => ({}))) as { fieldErrors?: FieldErrors<Field>; error?: string };

      if (res.ok) {
        setStatus("success");
        onSuccess?.();
        return;
      }
      if (res.status === 400 && body.fieldErrors && Object.keys(body.fieldErrors).length) {
        setErrors(body.fieldErrors);
        showSummary(body.fieldErrors);
        setStatus("idle");
        return;
      }
      setFormError(body.error ?? "Something went wrong on our side. Please try again in a moment.");
      setStatus("error");
    } catch {
      setFormError("We couldn’t reach the server. Check your connection and try again.");
      setStatus("error");
    }
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setSummaryItems([]);
    setStatus("idle");
    startedAt.current = Date.now();
  };

  return {
    values,
    errors,
    status,
    formError,
    summaryItems,
    summaryRef,
    honeypot,
    setHoneypot,
    setValue,
    onBlur,
    onSubmit,
    reset,
    fieldId: (field: Field) => `${idPrefix}-${field}`,
  };
}
