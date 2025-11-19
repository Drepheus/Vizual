"use client";

import { useRouter } from "next/navigation";
import GoogleAIStudio from "@/src/GoogleAIStudio";

export default function GoogleAIStudioPage() {
  const router = useRouter();

  return (
    <div className="page-transition fade-in">
      <GoogleAIStudio />
    </div>
  );
}
