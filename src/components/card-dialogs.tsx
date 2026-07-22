import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreditCard, Trash2, Eye, EyeOff, Receipt } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  createCard,
  closeCard,
  topUpCard,
  type Card as CardType,
  type Transaction,
} from "@/lib/mock-api";

function formatCurrency(n: number) {
  return `R ${n.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDateTime(iso: string) {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("en-ZA", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${date}, ${time}`;
}

/* ---------- Create Card ---------- */
export function CreateCardDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState("Visa");
  const [isDefault, setIsDefault] = useState(false);
  const qc = useQueryClient();
  const m = useMutation({
    mutationFn: () => createCard({ cardHolderName: name, cardType: type, isDefault }),
    onSuccess: (res) => {
      if (!res.success) return toast.error(res.message);
      toast.success(res.message);
      qc.invalidateQueries({ queryKey: ["cards"] });
      onOpenChange(false);
      setName("");
      setIsDefault(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <div className="mb-2 grid h-14 w-14 place-items-center rounded-full bg-primary-soft">
            <CreditCard className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle>Create a virtual card</DialogTitle>
          <DialogDescription>Enter the details below to issue a new card.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="holder">Card holder name</Label>
            <Input
              id="holder"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <Label>Card type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Visa">Visa</SelectItem>
                <SelectItem value="Mastercard">Mastercard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
            <Label htmlFor="isDefault" className="cursor-pointer">
              Set as default card
            </Label>
            <Switch id="isDefault" checked={isDefault} onCheckedChange={setIsDefault} />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => m.mutate()}
            disabled={!name.trim() || m.isPending}
          >
            {m.isPending ? "Creating..." : "Create card"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Top Up ---------- */
const QUICK = [25, 50, 100, 200];

export function TopUpDialog({
  open,
  onOpenChange,
  cards,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  cards: CardType[];
}) {
  const activeCards = cards.filter((c) => c.status === "Active");
  const defaultId = activeCards.find((c) => c.isDefault)?.id ?? activeCards[0]?.id;
  const [cardId, setCardId] = useState<number | undefined>(defaultId);
  const [amount, setAmount] = useState<string>("");
  const qc = useQueryClient();

  const m = useMutation({
    mutationFn: () => topUpCard(cardId!, Number(amount)),
    onSuccess: (res) => {
      if (!res.success) return toast.error(res.message);
      toast.success(res.message);
      qc.invalidateQueries({ queryKey: ["cards"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      onOpenChange(false);
      setAmount("");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <div className="mb-2 grid h-14 w-14 place-items-center rounded-full bg-primary-soft">
            <CreditCard className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle>Top Up Card</DialogTitle>
          <DialogDescription>Add funds to your card.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Card</Label>
            <Select
              value={cardId ? String(cardId) : undefined}
              onValueChange={(v) => setCardId(Number(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a card" />
              </SelectTrigger>
              <SelectContent>
                {activeCards.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.cardType} {c.maskedNumber}
                    {c.isDefault ? " · default" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (ZAR)</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                R
              </span>
              <Input
                id="amount"
                inputMode="decimal"
                className="pl-7"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK.map((q) => {
              const selected = Number(amount) === q;
              return (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount(String(q))}
                  className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-transparent text-foreground hover:border-primary/60"
                  }`}
                >
                  R{q}
                </button>
              );
            })}
          </div>
          <p className="text-center text-xs text-muted-foreground">
            This process cannot be undone
          </p>
        </div>
        <DialogFooter className="grid grid-cols-2 gap-2 sm:flex sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!cardId || !amount || Number(amount) <= 0 || m.isPending}
            onClick={() => m.mutate()}
          >
            {m.isPending ? "Processing..." : "Top Up"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Delete / Close card ---------- */
export function DeleteCardDialog({
  open,
  onOpenChange,
  cards,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  cards: CardType[];
}) {
  const activeCards = cards.filter((c) => c.status === "Active");
  const [cardId, setCardId] = useState<number | undefined>(activeCards[0]?.id);
  const qc = useQueryClient();
  const m = useMutation({
    mutationFn: () => closeCard(cardId!),
    onSuccess: (res) => {
      if (!res.success) return toast.error(res.message);
      toast.success(res.message);
      qc.invalidateQueries({ queryKey: ["cards"] });
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <div className="mb-2 grid h-14 w-14 place-items-center rounded-full bg-destructive/10">
            <Trash2 className="h-6 w-6 text-destructive" />
          </div>
          <DialogTitle>Close card</DialogTitle>
          <DialogDescription>
            The card will be deactivated. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label>Card</Label>
          <Select
            value={cardId ? String(cardId) : undefined}
            onValueChange={(v) => setCardId(Number(v))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a card" />
            </SelectTrigger>
            <SelectContent>
              {activeCards.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.cardType} {c.maskedNumber}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={!cardId || m.isPending}
            onClick={() => m.mutate()}
          >
            {m.isPending ? "Closing..." : "Close card"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- View Card ---------- */
export function ViewCardDialog({
  open,
  onOpenChange,
  card,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  card: CardType | null;
}) {
  const [reveal, setReveal] = useState(false);

  if (!card) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Your Card</DialogTitle>
          <DialogDescription>Keep these details private.</DialogDescription>
        </DialogHeader>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-emerald-800 p-6 text-primary-foreground shadow-lg">
          <div className="mb-8 flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest opacity-80">
              {card.cardType}
            </span>
            <CreditCard className="h-6 w-6 opacity-90" />
          </div>
          <div className="mb-6 font-mono text-lg tracking-widest">
            {reveal ? card.fullNumber : card.maskedNumber}
          </div>
          <div className="flex items-end justify-between text-sm">
            <div>
              <div className="text-[10px] uppercase opacity-70">Card holder</div>
              <div className="font-semibold uppercase">{card.cardHolderName}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase opacity-70">Expires</div>
              <div className="font-semibold">
                {String(card.expiryMonth).padStart(2, "0")}/
                {String(card.expiryYear).slice(-2)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase opacity-70">CVV</div>
              <div className="font-semibold">{reveal ? card.cvv : "•••"}</div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
          <span className="text-muted-foreground">Balance</span>
          <span className="font-semibold">{formatCurrency(card.balance)}</span>
        </div>
        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="outline" onClick={() => setReveal((r) => !r)}>
            {reveal ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
            {reveal ? "Hide details" : "Reveal details"}
          </Button>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Recent Payment ---------- */
export function RecentPaymentDialog({
  open,
  onOpenChange,
  transactions,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  transactions: Transaction[];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader className="items-center text-center">
          <DialogTitle>Recent Payment</DialogTitle>
          <div className="mt-2 grid h-14 w-14 place-items-center rounded-full bg-primary-soft">
            <Receipt className="h-6 w-6 text-primary" />
          </div>
          <DialogDescription>View your most recent payments.</DialogDescription>
        </DialogHeader>
        <div className="max-h-[420px] overflow-auto">
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
              {transactions.slice(0, 5).map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="text-muted-foreground">
                    {formatDateTime(t.dateTime)}
                  </TableCell>
                  <TableCell>{t.description}</TableCell>
                  <TableCell className="text-right font-medium">
                    {t.amount < 0 ? "-" : ""}R {Math.abs(t.amount).toFixed(2)}
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
              {transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
                    No transactions yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <DialogFooter>
          <Button variant="outline" className="mx-auto" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
