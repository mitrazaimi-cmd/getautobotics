"use client";

import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";
import { login, type ActionState } from "@/app/admin/actions";
import { TextField, FormAlert } from "@/components/forms/Fields";
import { Button } from "@/components/ui/Button";

export function LoginForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(login, {});

  return (
    <form action={action} className="mt-8 space-y-5">
      {state.error && (
        <FormAlert>
          <p>{state.error}</p>
        </FormAlert>
      )}
      <TextField id="email" label="Email" type="email" autoComplete="username" required />
      <TextField id="password" label="Password" type="password" autoComplete="current-password" required />
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? (
          <>
            <LoaderCircle size={20} className="animate-spin" aria-hidden="true" /> Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}
