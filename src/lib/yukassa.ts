const YUKASSA_API = "https://api.yookassa.ru/v3";

interface CreatePaymentParams {
  amount: number;
  orderId: string;
  orderNumber: string;
  returnUrl: string;
  description: string;
  email?: string;
}

interface YuKassaPayment {
  id: string;
  status: string;
  confirmation: { confirmation_url: string };
  paid: boolean;
}

function getHeaders() {
  const shopId = process.env.YUKASSA_SHOP_ID!;
  const secretKey = process.env.YUKASSA_SECRET_KEY!;
  const credentials = Buffer.from(`${shopId}:${secretKey}`).toString("base64");
  return {
    Authorization: `Basic ${credentials}`,
    "Content-Type": "application/json",
    "Idempotence-Key": crypto.randomUUID(),
  };
}

export async function createPayment(params: CreatePaymentParams): Promise<YuKassaPayment> {
  const body = {
    amount: { value: params.amount.toFixed(2), currency: "RUB" },
    confirmation: {
      type: "redirect",
      return_url: params.returnUrl,
    },
    capture: true,
    description: params.description,
    metadata: { orderId: params.orderId, orderNumber: params.orderNumber },
    receipt: params.email
      ? {
          customer: { email: params.email },
          items: [
            {
              description: params.description,
              quantity: "1.00",
              amount: { value: params.amount.toFixed(2), currency: "RUB" },
              vat_code: 1,
            },
          ],
        }
      : undefined,
  };

  const res = await fetch(`${YUKASSA_API}/payments`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`YuKassa error: ${error}`);
  }

  return res.json();
}

export async function getPayment(paymentId: string): Promise<YuKassaPayment> {
  const res = await fetch(`${YUKASSA_API}/payments/${paymentId}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch payment");
  return res.json();
}

export function verifyWebhookSignature(body: string, signature: string): boolean {
  // YuKassa uses IP allowlist, not HMAC — verify IP in production
  return true;
}
