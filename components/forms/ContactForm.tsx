"use client";

import { CircleCheck, LoaderCircle } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { ErrorSummary, FormAlert, Honeypot, TextAreaField, TextField } from "@/components/forms/Fields";
import { useValidatedForm } from "@/components/forms/useValidatedForm";
import { contactSchema, HONEYPOT_FIELD, LIMITS, type ContactInput } from "@/lib/validation";

const initialValues: ContactInput = { name: "", email: "", message: "" };
const fieldOrder = ["name", "email", "message"] as const;

export function ContactForm() {
  const form = useValidatedForm({
    schema: contactSchema,
    initialValues,
    endpoint: "/api/contact",
    fieldOrder: [...fieldOrder],
    idPrefix: "contact",
  });
  const { values, errors, setValue, onBlur, fieldId, status } = form;
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  if (status === "success") {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="rounded-[8px] border border-line bg-white p-6 outline-none sm:p-8"
      >
        <CircleCheck size={32} strokeWidth={1.75} aria-hidden="true" className="text-success" />
        <h3 className="mt-4 text-xl">Thanks — your message is on its way.</h3>
        <p className="mt-2 text-muted">We’ll read it personally and reply by email.</p>
        <Button variant="secondary" className="mt-6" onClick={form.reset}>
          Send another message
        </Button>
      </div>
    );
  }

  const text = (field: (typeof fieldOrder)[number]) => ({
    id: fieldId(field),
    value: values[field],
    error: errors[field],
    onBlur: () => onBlur(field),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValue(field, e.target.value),
  });

  const submitting = status === "submitting";

  return (
    <form noValidate onSubmit={form.onSubmit} className="relative space-y-6 rounded-[8px] border border-line bg-white p-6 sm:p-8">
      <ErrorSummary ref={form.summaryRef} items={form.summaryItems} />
      <Honeypot name={HONEYPOT_FIELD} value={form.honeypot} onChange={form.setHoneypot} />

      <div className="grid gap-6 sm:grid-cols-2">
        <TextField label="Name" required autoComplete="name" maxLength={LIMITS.name} {...text("name")} />
        <TextField
          label="Email"
          required
          type="email"
          inputMode="email"
          autoComplete="email"
          spellCheck={false}
          maxLength={LIMITS.email}
          {...text("email")}
        />
      </div>
      <TextAreaField label="Message" required rows={5} maxLength={LIMITS.message} {...text("message")} />

      {form.formError && (
        <FormAlert>
          <p className="font-semibold">Your message wasn’t sent.</p>
          <p className="mt-1">{form.formError}</p>
        </FormAlert>
      )}

      <Button type="submit" variant="secondary" disabled={submitting} className="w-full sm:w-auto">
        {submitting ? (
          <>
            <LoaderCircle size={20} strokeWidth={2} aria-hidden="true" className="animate-spin" />
            Sending…
          </>
        ) : (
          "Send message"
        )}
      </Button>
    </form>
  );
}
