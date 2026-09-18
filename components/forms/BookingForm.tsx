"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  CheckboxField,
  ErrorSummary,
  FormAlert,
  Honeypot,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/forms/Fields";
import { useValidatedForm } from "@/components/forms/useValidatedForm";
import {
  bookingSchema,
  challengeOptions,
  companySizeOptions,
  HONEYPOT_FIELD,
  LIMITS,
  type BookingInput,
} from "@/lib/validation";
import { cta } from "@/content/messages";
import { contact, isPlaceholder } from "@/content/site";

const initialValues: BookingInput = {
  fullName: "",
  email: "",
  phone: "",
  companyName: "",
  companySize: "" as BookingInput["companySize"],
  mainChallenge: "" as BookingInput["mainChallenge"],
  description: "",
  preferredTimes: "",
  referralSource: "",
  consent: false as unknown as true,
  timezone: "",
};

const fieldOrder = [
  "fullName",
  "email",
  "phone",
  "companyName",
  "companySize",
  "mainChallenge",
  "description",
  "preferredTimes",
  "referralSource",
  "consent",
] as const;

export function BookingForm({ idPrefix = "book" }: { idPrefix?: string }) {
  const router = useRouter();
  const form = useValidatedForm({
    schema: bookingSchema,
    initialValues,
    endpoint: "/api/book",
    fieldOrder: [...fieldOrder],
    idPrefix,
    onSuccess: () => router.push("/book/success"),
  });
  const { values, errors, setValue, onBlur, fieldId, status } = form;
  const submitting = status === "submitting" || status === "success";

  // Capture the visitor's time zone so confirmed times can be shown in their local time.
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) setValue("timezone", tz);
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const text = (field: (typeof fieldOrder)[number]) => ({
    id: fieldId(field),
    value: (values[field] as string) ?? "",
    error: errors[field],
    onBlur: () => onBlur(field),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setValue(field, e.target.value as never),
  });

  return (
    <form noValidate onSubmit={form.onSubmit} aria-describedby={`${idPrefix}-intro`} className="relative space-y-6">
      <p id={`${idPrefix}-intro`} className="text-[0.9375rem] text-muted">
        It takes about 3 minutes. Fields marked “required” are needed so we can prepare for the conversation.
      </p>

      <ErrorSummary ref={form.summaryRef} items={form.summaryItems} />

      <Honeypot name={HONEYPOT_FIELD} value={form.honeypot} onChange={form.setHoneypot} />

      <fieldset className="space-y-6">
        <legend className="mb-4 float-left w-full text-lg font-semibold text-navy">About you</legend>
        <div className="clear-both grid gap-6 sm:grid-cols-2">
          <TextField label="Full name" required autoComplete="name" maxLength={LIMITS.name} {...text("fullName")} />
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
        <TextField
          label="Phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          maxLength={LIMITS.phone}
          hint="Only if you’d prefer a call."
          className="sm:max-w-[calc(50%-0.75rem)]"
          {...text("phone")}
        />
      </fieldset>

      <fieldset className="space-y-6 border-t border-line pt-6">
        <legend className="mb-4 float-left w-full text-lg font-semibold text-navy">About your business</legend>
        <div className="clear-both grid gap-6 sm:grid-cols-2">
          <TextField
            label="Company name"
            required
            autoComplete="organization"
            maxLength={LIMITS.company}
            className="sm:col-span-2"
            {...text("companyName")}
          />
          <SelectField
            label="Company size"
            required
            options={companySizeOptions}
            placeholder="Choose company size"
            {...text("companySize")}
          />
          <SelectField
            label="Main challenge"
            required
            options={challengeOptions}
            placeholder="Choose the best fit"
            {...text("mainChallenge")}
          />
        </div>
        <TextAreaField
          label="What would you like help with?"
          required
          maxLength={LIMITS.description}
          rows={5}
          hint="Describe the repetitive work or bottleneck in your own words. No technical detail needed."
          {...text("description")}
        />
      </fieldset>

      <fieldset className="space-y-6 border-t border-line pt-6">
        <legend className="mb-4 float-left w-full text-lg font-semibold text-navy">Scheduling</legend>
        <div className="clear-both">
          <TextField
            label="Preferred days, times, and time zone"
            maxLength={LIMITS.preferredTimes}
            hint="For example: Tuesday or Thursday mornings, Eastern Time."
            {...text("preferredTimes")}
          />
        </div>
        <TextField
          label="How did you hear about us?"
          maxLength={LIMITS.referral}
          {...text("referralSource")}
        />
      </fieldset>

      <div className="border-t border-line pt-6">
        <CheckboxField
          id={fieldId("consent")}
          checked={values.consent === true}
          error={errors.consent}
          // setValue re-validates with the new value once the field has an error
          onChange={(e) => setValue("consent", e.target.checked as true)}
          label={
            <>
              I agree that Auto Botics may store the details I’ve shared and email me about my consultation request.
              See the{" "}
              <Link href="/privacy" className="link-inline">
                privacy policy
              </Link>
              .
            </>
          }
        />
      </div>

      {form.formError && (
        <FormAlert>
          <p className="font-semibold">Your request wasn’t sent.</p>
          <p className="mt-1">
            {form.formError}
            {!isPlaceholder(contact.email) && (
              <>
                {" "}
                You can also email{" "}
                <a className="link-inline" href={`mailto:${contact.email}`}>
                  {contact.email}
                </a>
                .
              </>
            )}
          </p>
        </FormAlert>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="submit" disabled={submitting} aria-disabled={submitting} className="w-full sm:w-auto sm:shrink-0">
          {submitting ? (
            <>
              <LoaderCircle size={20} strokeWidth={2} aria-hidden="true" className="animate-spin" />
              Sending your request…
            </>
          ) : (
            cta.primary
          )}
        </Button>
        <p aria-live="polite" className="text-sm text-muted">
          {submitting ? "Sending — please don’t close this page." : "We’ll reply by email to arrange a time."}
        </p>
      </div>
    </form>
  );
}
