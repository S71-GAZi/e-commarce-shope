import { RegisterForm } from "@/components/auth/register-form"

export const metadata = {
  title: "Register - E-Commerce Store",
  description: "Create a new account",
}

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/30">
      <RegisterForm />
    </div>
  )
}
