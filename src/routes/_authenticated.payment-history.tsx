import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, ArrowUpDown } from "lucide-react";

import { getTransactions } from "@/lib/mock-api";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/components/card-dialogs";

export const Route = createFileRoute("/_authenticated/payment-history")({
  head: () => ({
    meta: [
      { title: "Payment History · Tshwane Bus Services" },
      {
        name: "description",
        content:
          "Review every top-up and fare payment on your Tshwane Bus Services virtual cards.",
      },
      { property: "og:title", content: "Payment History · Tshwane Bus Services" },
      {
        property: "og:description",
        content: "Full transaction history for your Tshwane Bus Services account.",
      },
    ],
  }),
  component: PaymentHistoryPage,
});

function PaymentHistoryPage() {
  const q = useQuery({ queryKey: ["transactions"], queryFn: getTransactions });
  const [search, setSearch] = useState("");
  const [asc, setAsc] = useState(false);

  const rows = useMemo(() => {
    const list = q.data?.data ?? [];
    const filtered = search
      ? list.filter(
          (t) =>
            t.description.toLowerCase().includes(search.toLowerCase()) ||
            t.status.toLowerCase().includes(search.toLowerCase()),
        )
      : list;
    return [...filtered].sort((a, b) =>
      asc ? a.dateTime.localeCompare(b.dateTime) : b.dateTime.localeCompare(a.dateTime),
    );
  }, [q.data, search, asc]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">
          <span className="text-primary">Payment</span> History
        </h1>
        <p className="text-sm text-muted-foreground">
          A record of every top-up and fare on your Tshwane Bus Services account.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search description or status"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <button
            type="button"
            onClick={() => setAsc((v) => !v)}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-transparent px-3 py-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowUpDown className="h-4 w-4" /> {asc ? "Oldest first" : "Newest first"}
          </button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date &amp; Time</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount (ZAR)</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="text-muted-foreground">
                  {formatDateTime(t.dateTime)}
                </TableCell>
                <TableCell>{t.description}</TableCell>
                <TableCell
                  className={`text-right font-medium ${
                    t.amount < 0 ? "text-destructive" : "text-foreground"
                  }`}
                >
                  {t.amount < 0 ? "-" : "+"} R {Math.abs(t.amount).toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="border-primary/30 bg-primary-soft text-primary"
                  >
                    {t.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
