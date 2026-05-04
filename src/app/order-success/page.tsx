import Link from "next/link";
import { CheckCircle } from "lucide-react";

interface Props {
  searchParams: Promise<{ order?: string }>;
}

export default async function OrderSuccessPage({ searchParams }: Props) {
  const { order } = await searchParams;

  return (
    <div className="bg-gray-50 text-gray-900 min-h-screen flex items-center justify-center">
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
      <h1 className="text-2xl font-bold text-gray-900 mb-3">Заказ оформлен!</h1>
      {order && (
        <p className="text-gray-600 mb-2">
          Номер вашего заказа: <span className="font-mono font-bold text-gray-900">#{order}</span>
        </p>
      )}
      <p className="text-gray-500 mb-8">
        Мы уже приступили к обработке вашего заказа. Уведомление придёт в Telegram и на email.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/account/orders" className="bg-sky-500 hover:bg-sky-600 text-white font-semibold px-6 py-3 rounded-full transition-colors">
          Мои заказы
        </Link>
        <Link href="/catalog" className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold px-6 py-3 rounded-full transition-colors">
          Продолжить покупки
        </Link>
      </div>
    </div>
    </div>
  );
}
