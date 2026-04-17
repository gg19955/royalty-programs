import { Nav } from "@/components/nav";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-semibold">Sign in to Lively Rewards</h1>
        <p className="mt-1 text-sm text-gray-600">
          We&apos;ll email you a magic link — no password needed.
        </p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </main>
    </>
  );
}
