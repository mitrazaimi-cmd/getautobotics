import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Image from "next/image";
import { isAdmin } from "@/lib/auth";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-[8px] border border-line bg-white p-8">
        <Image src="/logo.png" alt="Auto Botics" width={111} height={60} className="mx-auto h-[60px] w-auto" priority />
        <h1 className="mt-6 text-center text-2xl">Admin sign in</h1>
        <p className="mt-2 text-center text-[0.9375rem] text-muted">Manage consultation requests and messages.</p>
        <LoginForm />
      </div>
    </main>
  );
}
