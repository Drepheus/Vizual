"use client";

import { useRouter } from "next/navigation";
import CustomVizuals from "@/src/CustomVizuals";

export default function CustomVizualsPage() {
  const router = useRouter();

  return (
    <div className="page-transition fade-in">
      <CustomVizuals onClose={() => router.push('/command-hub')} />
    </div>
  );
}
