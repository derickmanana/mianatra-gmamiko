import { useQuery } from "@tanstack/react-query";
import { Coins } from "lucide-react";
import { fetchMyAccount } from "@/lib/billing.functions";

export function CreditBadge({ studentName, onClick }: { studentName: string; onClick: () => void }) {
  const { data } = useQuery({
    queryKey: ["my-account", studentName],
    queryFn: () => fetchMyAccount({ data: { studentName } }),
  });

  const label = data ? (data.credits > 0 ? `${data.credits} hafatra` : data.freeUsed ? "Lany" : "1 maimaim-poana") : "…";

  return (
    <button
      onClick={onClick}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-primary"
    >
      <Coins className="size-3.5" /> {label}
    </button>
  );
}
