import { LoginForm } from "@/components/auth/login-form"

export const metadata = {
  title: "Login - E-Commerce Store",
  description: "Sign in to your account",
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/30">
      <LoginForm />
    </div>
  )
}
