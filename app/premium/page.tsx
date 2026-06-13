import PaymentPlaceholder from "@/components/ui/PaymentPlaceholder";

export const dynamic = 'force-dynamic';

export default function PremiumPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 px-4">
      <PaymentPlaceholder />
    </div>
  );
}
