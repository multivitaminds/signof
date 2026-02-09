import AuthForm from "@/components/auth/auth-form";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";

export default function SignupPage() {
  return (
    <AuthForm
      title="Create your account"
      subtitle="Get started with SignOf today"
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerLinkHref="/login"
    >
      <form className="space-y-4">
        <Input
          label="Full name"
          type="text"
          placeholder="Jane Smith"
          autoComplete="name"
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
        />
        <Input
          label="Password"
          type="password"
          placeholder="Create a password"
          autoComplete="new-password"
        />
        <Button type="submit" className="w-full" size="lg">
          Create account
        </Button>
      </form>
    </AuthForm>
  );
}
