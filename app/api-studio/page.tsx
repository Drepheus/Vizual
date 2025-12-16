"use client";

import { useRouter } from "next/navigation";
import APIStudio from "@/src/APIStudio";

export default function APIStudioPage() {
  const router = useRouter();

  return (
    <div className="page-transition fade-in">
      <APIStudio onClose={() => router.back()} />
    </div>
  );
}
