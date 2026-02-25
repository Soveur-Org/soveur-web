"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

type StripePaymentModalProps = {
  clientSecret: string;
  onClose: () => void;
};

function getStripePromise() {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key) return null;
  return loadStripe(key);
}

function PaymentForm({ onClose }: { onClose: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setIsSubmitting(true);
    setMessage(null);

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment/success`,
      },
      redirect: "if_required",
    });

    if (result.error) {
      setMessage(result.error.message ?? "Le paiement a echoue. Reessayez.");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    onClose();
    router.push("/payment/success");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {message ? <p className="text-sm text-red-600">{message}</p> : null}
      <button
        type="submit"
        disabled={!stripe || isSubmitting}
        className={`w-full rounded-full px-5 py-3 text-sm font-semibold text-white ${
          !stripe || isSubmitting ? "bg-[#b8bcc9]" : "bg-[#1f2436]"
        }`}
      >
        {isSubmitting ? "Paiement en cours..." : "Payer maintenant"}
      </button>
    </form>
  );
}

export function StripePaymentModal({ clientSecret, onClose }: StripePaymentModalProps) {
  const stripePromise = useMemo(() => getStripePromise(), []);

  if (!stripePromise) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <section className="w-full max-w-md rounded-2xl bg-white p-5">
          <p className="text-sm text-red-600">
            NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY est manquante.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-4 rounded-full bg-[#1f2436] px-4 py-2 text-sm text-white"
          >
            Fermer
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <section className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#1f2436]">Paiement securise</h3>
          <button type="button" onClick={onClose} className="text-[#6d7286]">
            ×
          </button>
        </div>
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentForm onClose={onClose} />
        </Elements>
      </section>
    </div>
  );
}
