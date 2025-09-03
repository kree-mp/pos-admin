import { LoginForm } from "@/components/login-form";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <LoginForm />
      <PWAInstallPrompt />
    </main>
  );
}
