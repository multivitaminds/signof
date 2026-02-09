import AuthForm from "@/components/auth/auth-form";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";

export default function LoginPage() {
  return (
    <AuthForm
      title="Welcome back"
      subtitle="Sign in to your account to continue"
      footerText="Don't have an account?"
      footerLinkText="Sign up"
      footerLinkHref="/signup"
    >
      <form className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
        />
        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
        />
        <Button type="submit" className="w-full" size="lg">
          Sign in
        </Button>
      </form>
    </AuthForm>
  );
}
