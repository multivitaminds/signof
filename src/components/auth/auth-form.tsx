import { Card, CardContent } from "@/components/ui/card";
import Separator from "@/components/ui/separator";
import SocialLoginButton from "@/components/auth/social-login-button";
import Link from "next/link";

interface AuthFormProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerText: string;
  footerLinkText: string;
  footerLinkHref: string;
}

export default function AuthForm({
  title,
  subtitle,
  children,
  footerText,
  footerLinkText,
  footerLinkHref,
}: AuthFormProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>

        {children}

        <div className="relative my-6">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface px-3 text-xs text-muted-foreground">
            or continue with
          </span>
        </div>

        <div className="flex gap-3">
          <SocialLoginButton provider="google" />
          <SocialLoginButton provider="microsoft" />
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {footerText}{" "}
          <Link
            href={footerLinkHref}
            className="font-medium text-accent hover:underline"
          >
            {footerLinkText}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
