import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CreditCard,
  Plus,
  PencilLine,
  Trash2,
  ChevronRight,
  Receipt,
  Wallet,
} from "lucide-react";

import { getCards, getTransactions } from "@/lib/mock-api";
import { useAuth } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import {
  CreateCardDialog,
  DeleteCardDialog,
  RecentPaymentDialog,
  TopUpDialog,
  ViewCardDialog,
} from "@/components/card-dialogs";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · Tshwane Bus Services" },
      {
        name: "description",
        content:
          "Manage your Tshwane Bus Services virtual card — check balance, top up and review recent payments.",
      },
      { property: "og:title", content: "Dashboard · Tshwane Bus Services" },
      {
        property: "og:description",
        content: "Balance, card management and recent payments in one place.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuth();
  const cardsQ = useQuery({ queryKey: ["cards"], queryFn: getCards });
  const txQ = useQuery({ queryKey: ["transactions"], queryFn: getTransactions });

  const cards = cardsQ.data?.data ?? [];
  const transactions = txQ.data?.data ?? [];
  const activeCards = cards.filter((c) => c.status === "Active");
  const primaryCard = activeCards.find((c) => c.isDefault) ?? activeCards[0] ?? null;
  const balance = activeCards.reduce((sum, c) => sum + c.balance, 0);
  const lastTx = transactions[0];

  const [openCreate, setOpenCreate] = useState(false);
  const [openTopUp, setOpenTopUp] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openRecent, setOpenRecent] = useState(false);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">
          <span className="text-primary">Welcome,</span>{" "}
          <span className="text-foreground">{user?.username ?? "there"}</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Here&apos;s an overview of your card and transactions.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Balance */}
        <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary-soft to-primary-soft/30 p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-primary">Balance</h2>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground">
              <CreditCard className="h-4 w-4" />
            </span>
          </div>
          <div className="text-4xl font-bold tracking-tight text-foreground">
            R {balance.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-6">
            <Button
              className="gap-2"
              onClick={() => setOpenView(true)}
              disabled={!primaryCard}
            >
              View Card <CreditCard className="h-4 w-4" />
            </Button>
          </div>
          <svg
            className="pointer-events-none absolute -bottom-6 right-0 opacity-40"
            width="260"
            height="80"
            viewBox="0 0 260 80"
            fill="none"
          >
            <path
              d="M0 60 Q 70 20 140 40 T 260 30 L 260 80 L 0 80 Z"
              fill="var(--color-primary)"
              opacity="0.15"
            />
          </svg>
        </div>

        {/* Card management */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-foreground">
              Card Management
            </h2>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground">
              <CreditCard className="h-4 w-4" />
            </span>
          </div>
          <ul className="divide-y divide-border">
            <ManageRow
              icon={<Plus className="h-4 w-4" />}
              label="Create"
              onClick={() => setOpenCreate(true)}
              tone="primary"
            />
            <ManageRow
              icon={<PencilLine className="h-4 w-4" />}
              label="Top Up"
              onClick={() => setOpenTopUp(true)}
              tone="primary"
              disabled={activeCards.length === 0}
            />
            <ManageRow
              icon={<Trash2 className="h-4 w-4" />}
              label="Delete"
              onClick={() => setOpenDelete(true)}
              tone="destructive"
              disabled={activeCards.length === 0}
            />
          </ul>
        </div>
      </div>

      <div>
        <h3 className="mb-4 font-display text-lg font-semibold text-foreground">
          Information Cards
        </h3>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Payment */}
          <button
            type="button"
            onClick={() => setOpenRecent(true)}
            className="group relative overflow-hidden rounded-xl border border-border bg-primary-soft/40 p-6 text-left transition hover:border-primary/50"
          >
            <div className="mb-6 grid h-10 w-10 place-items-center rounded-md bg-primary-soft">
              <Receipt className="h-5 w-5 text-primary" />
            </div>
            <div className="font-display text-lg font-semibold text-primary">
              Recent Payment
            </div>
            <div className="text-xs text-muted-foreground">Last Payment</div>
            <div className="mt-2 text-2xl font-bold text-foreground">
              {lastTx ? `R ${Math.abs(lastTx.amount).toFixed(2)}` : "—"}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {lastTx
                  ? new Date(lastTx.dateTime).toLocaleString("en-ZA", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "No transactions"}
              </span>
              <ChevronRight className="h-4 w-4 text-primary transition group-hover:translate-x-1" />
            </div>
          </button>

          {/* Active cards */}
          <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6">
            <div className="mb-6 grid h-10 w-10 place-items-center rounded-md bg-blue-50">
              <Wallet className="h-5 w-5 text-blue-600" />
            </div>
            <div className="font-display text-lg font-semibold text-blue-700">
              Active Cards
            </div>
            <div className="text-xs text-muted-foreground">Total Active Cards</div>
            <div className="mt-2 text-3xl font-bold text-foreground">
              {activeCards.length}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>View and manage your active cards.</span>
              <ChevronRight className="h-4 w-4 text-blue-600" />
            </div>
            <CreditCard
              className="pointer-events-none absolute -right-4 bottom-2 h-24 w-24 rotate-[-15deg] text-blue-100"
              strokeWidth={1}
            />
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <CreateCardDialog open={openCreate} onOpenChange={setOpenCreate} />
      <TopUpDialog open={openTopUp} onOpenChange={setOpenTopUp} cards={cards} />
      <DeleteCardDialog open={openDelete} onOpenChange={setOpenDelete} cards={cards} />
      <ViewCardDialog open={openView} onOpenChange={setOpenView} card={primaryCard} />
      <RecentPaymentDialog
        open={openRecent}
        onOpenChange={setOpenRecent}
        transactions={transactions}
      />
    </div>
  );
}

function ManageRow({
  icon,
  label,
  onClick,
  tone,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  tone: "primary" | "destructive";
  disabled?: boolean;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="flex w-full items-center justify-between py-3 text-left transition disabled:opacity-50"
      >
        <span className="flex items-center gap-3">
          <span
            className={`grid h-7 w-7 place-items-center rounded-full ${
              tone === "primary"
                ? "bg-primary text-primary-foreground"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            {icon}
          </span>
          <span className="font-medium text-foreground">{label}</span>
        </span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </button>
    </li>
  );
}
