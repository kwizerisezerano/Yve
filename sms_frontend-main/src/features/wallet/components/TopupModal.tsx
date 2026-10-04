import { useState, type FormEvent } from "react";
import { Modal } from "../../../shared/ui/Modal";
import { Input } from "../../../shared/ui/Input";
import { Button } from "../../../shared/ui/Button";
import { useToast } from "../../../shared/ui/useToast";
import { useInitiateTopup, useConfirmTopup } from "../hooks/useTopup";
import { calculateSmsCredits } from "../../../shared/lib/sms-credits";
import { useSmsPrice } from "../../../shared/hooks/useSystemSettings";
import type { PaymentMethod } from "../types/wallet.types";

interface TopupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string; description: string }[] = [
  { value: "MOMO", label: "Mobile Money (MTN/Airtel)", description: "Pay with your mobile money account" },
  { value: "BANK_CARD", label: "Bank Card", description: "Pay with Visa or Mastercard" },
  { value: "BANK_TRANSFER", label: "Bank Transfer", description: "Direct bank transfer" },
];

const QUICK_AMOUNTS = [5000, 10000, 25000, 50000, 100000];

export function TopupModal({ isOpen, onClose }: TopupModalProps) {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("MOMO");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Track transaction ID for payment confirmation flow
  void transactionId;
  
  const smsPrice = useSmsPrice();
  const { showToast } = useToast();
  const initiateMutation = useInitiateTopup();
  const confirmMutation = useConfirmTopup();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    
    const amountNum = Number(amount);
    if (isNaN(amountNum) || amountNum < 1000) {
      showToast({ title: "Minimum top-up amount is RWF 1,000", variant: "danger" });
      return;
    }

    if (paymentMethod === "MOMO" && !phoneNumber.trim()) {
      showToast({ title: "Phone number is required for Mobile Money", variant: "danger" });
      return;
    }

    initiateMutation.mutate(
      { amount: amountNum, paymentMethod, phoneNumber: phoneNumber || undefined },
      {
        onSuccess: (data) => {
          setTransactionId(data.transactionId);
          showToast({ 
            title: "Payment initiated", 
            description: "Simulating payment...",
            variant: "success" 
          });
          
          // Auto-confirm after 2 seconds (simulating payment processing)
          setIsProcessing(true);
          setTimeout(() => {
            confirmMutation.mutate(data.transactionId, {
              onSuccess: (transaction) => {
                setIsProcessing(false);
                if (transaction.status === "SUCCESS") {
                  const smsCredits = calculateSmsCredits(amountNum || 0, smsPrice || 0);
                  showToast({ 
                    title: "Purchase successful!", 
                    description: `You've received ${smsCredits.toLocaleString()} SMS credits (RWF ${(amountNum || 0).toLocaleString()})`,
                    variant: "success" 
                  });
                  handleClose();
                } else {
                  showToast({ 
                    title: "Payment failed", 
                    description: "The payment was declined. Please try again.",
                    variant: "danger" 
                  });
                  setTransactionId(null);
                }
              },
              onError: () => {
                setIsProcessing(false);
                showToast({ 
                  title: "Error confirming payment", 
                  variant: "danger" 
                });
                setTransactionId(null);
              },
            });
          }, 2000);
        },
      }
    );
  }

  function handleClose() {
    setAmount("");
    setPhoneNumber("");
    setTransactionId(null);
    setIsProcessing(false);
    onClose();
  }

  return (
    <Modal open={isOpen} onClose={handleClose} title="Buy Credits">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Amount Input */}
        <div>
          <Input
            label="Amount (RWF)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            disabled={isProcessing}
            min={1000}
            step={100}
          />
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-slate-500">Minimum: RWF 1,000</span>
            {amount && Number(amount) >= 1000 && (
              <span className="font-semibold text-green-600">
                ≈ {calculateSmsCredits(Number(amount) || 0, smsPrice || 0).toLocaleString()} SMS credits
              </span>
            )}
          </div>
        </div>

        {/* Quick Amount Buttons */}
        <div>
          <p className="mb-3 text-sm font-medium text-slate-700">Quick amounts:</p>
          <div className="grid grid-cols-3 gap-2">
            {QUICK_AMOUNTS.map((quickAmount) => (
              <button
                key={quickAmount}
                type="button"
                onClick={() => setAmount(quickAmount.toString())}
                disabled={isProcessing}
                className={`flex flex-col items-center justify-center rounded-lg border p-3 text-xs transition-all hover:shadow-md ${
                  amount === quickAmount.toString()
                    ? "border-red-500 bg-red-50 ring-2 ring-red-200"
                    : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span className="font-semibold text-slate-900">
                  RWF {(quickAmount / 1000).toFixed(0)}K
                </span>
                <span className="mt-1 text-[10px] text-slate-500">
                  {calculateSmsCredits(quickAmount || 0, smsPrice || 0).toLocaleString()} SMS
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <label className="mb-3 block text-sm font-medium text-slate-700">
            Payment Method
          </label>
          <div className="space-y-2.5">
            {PAYMENT_METHODS.map((method) => (
              <label
                key={method.value}
                className={`flex items-start gap-3 rounded-lg border p-3.5 cursor-pointer transition-all ${
                  paymentMethod === method.value
                    ? "border-red-500 bg-red-50 ring-2 ring-red-200"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.value}
                  checked={paymentMethod === method.value}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  disabled={isProcessing}
                  className="mt-0.5 h-4 w-4 text-red-600 focus:ring-red-500"
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{method.label}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{method.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Phone Number (for MOMO) */}
        {paymentMethod === "MOMO" && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200">
            <Input
              label="Phone Number"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="250788123456"
              disabled={isProcessing}
            />
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200 rounded-lg bg-blue-50 border border-blue-200 p-4">
            <p className="text-sm text-blue-800 flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="font-medium">Processing payment...</span>
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isProcessing}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={initiateMutation.isPending || isProcessing}
            className="flex-1"
          >
            {isProcessing ? "Processing..." : "Continue"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
