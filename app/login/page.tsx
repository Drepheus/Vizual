import { Suspense } from "react";
import { LoginPage } from "@/components/auth/login-page";

function LoginLoading() {
  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="loading-spinner" />
          <p className="loading-text">Loading...</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginRoute() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginPage />
    </Suspense>
  );
}
