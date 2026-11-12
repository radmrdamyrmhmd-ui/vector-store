// Payment gateway integration.
//
// The site never reports a donation as paid by itself: a donation is only marked
// "paid" after the gateway verifies the authority we created. When no gateway
// credentials are configured the checkout is disabled and the donation stays
// "pending" — the UI then says the online gateway is not connected yet.

const ZARINPAL_REQUEST_URL = 'https://api.zarinpal.com/pg/v4/payment/request.json'
const ZARINPAL_VERIFY_URL = 'https://api.zarinpal.com/pg/v4/payment/verify.json'
const ZARINPAL_STARTPAY = 'https://www.zarinpal.com/pg/StartPay'

export function gatewayConfig() {
  const gateway = (process.env.PAYMENT_GATEWAY || '').trim().toLowerCase()
  const merchantId = (process.env.PAYMENT_MERCHANT_ID || '').trim()
  if (gateway === 'zarinpal' && merchantId) {
    return { enabled: true, gateway: 'zarinpal', merchantId }
  }
  return { enabled: false, gateway: gateway || null, merchantId: null }
}

export function publicBaseUrl() {
  return (
    process.env.PUBLIC_BASE_URL ||
    'http://localhost:3000'
  ).replace(/\/$/, '')
}

// Toman -> Rial (gateways in Iran settle in Rial).
const toRial = (amount) => Math.round(Number(amount) * 10)

async function postJson(url, body) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 12000)
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    const data = await response.json().catch(() => ({}))
    return { ok: response.ok, data }
  } catch (error) {
    return { ok: false, data: {}, error: error?.message || 'network_error' }
  } finally {
    clearTimeout(timer)
  }
}

export async function createPayment({ amount, description, trackingCode, mobile, email }) {
  const config = gatewayConfig()
  if (!config.enabled) {
    return { ok: false, reason: 'gateway_not_configured' }
  }

  if (config.gateway === 'zarinpal') {
    const callbackUrl = `${publicBaseUrl()}/api/payments/callback?tracking=${encodeURIComponent(
      trackingCode
    )}`
    const result = await postJson(ZARINPAL_REQUEST_URL, {
      merchant_id: config.merchantId,
      amount: toRial(amount),
      description,
      callback_url: callbackUrl,
      metadata: { mobile: mobile || undefined, email: email || undefined },
    })
    const authority = result.data?.data?.authority
    if (result.ok && authority) {
      return {
        ok: true,
        gateway: 'zarinpal',
        reference: authority,
        redirectUrl: `${ZARINPAL_STARTPAY}/${authority}`,
      }
    }
    console.error('[payments] zarinpal request failed', result.data?.errors || result.error)
  }

  return { ok: false, reason: 'gateway_error' }
}

export async function verifyPayment({ authority, amount }) {
  const config = gatewayConfig()
  if (!config.enabled || config.gateway !== 'zarinpal') {
    return { ok: false, reason: 'gateway_not_configured' }
  }
  const result = await postJson(ZARINPAL_VERIFY_URL, {
    merchant_id: config.merchantId,
    amount: toRial(amount),
    authority,
  })
  const code = result.data?.data?.code
  if (result.ok && (code === 100 || code === 101)) {
    return { ok: true, reference: String(result.data.data.ref_id) }
  }
  console.error('[payments] zarinpal verify failed', result.data?.errors || result.error)
  return { ok: false, reason: 'verify_failed' }
}
