import { NextRequest, NextResponse } from 'next/server'
import { ProcessAsaasWebhook, AsaasWebhookPayload } from '@/server/application/payment/ProcessAsaasWebhook'
import { FirebasePaymentRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebasePaymentRepositoryAdmin'
import { FirebaseInscriptionRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseInscriptionRepositoryAdmin'

const ASAAS_WEBHOOK_TOKEN = process.env.ASAAS_WEBHOOK_TOKEN || ''

const paymentRepository = new FirebasePaymentRepositoryAdmin()
const inscriptionRepository = new FirebaseInscriptionRepositoryAdmin()

const processWebhook = new ProcessAsaasWebhook(
  paymentRepository,
  inscriptionRepository
)

export async function POST(request: NextRequest) {
  console.log('[Webhook] ====== WEBHOOK RECEIVED ======')

  try {
    // Verify webhook token if configured
    if (ASAAS_WEBHOOK_TOKEN) {
      const authHeader = request.headers.get('asaas-access-token')
      if (authHeader !== ASAAS_WEBHOOK_TOKEN) {
        console.log('[Webhook] Invalid or missing access token')
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }

    // Parse the webhook payload
    const rawBody = await request.text()
    console.log('[Webhook] Raw body:', rawBody)

    const payload: AsaasWebhookPayload = JSON.parse(rawBody)

    console.log('[Webhook] Received:', JSON.stringify({
      eventId: payload.id,
      event: payload.event,
      paymentId: payload.payment?.id,
      status: payload.payment?.status,
      externalReference: payload.payment?.externalReference,
    }, null, 2))

    // Validate payload
    if (!payload.event || !payload.payment) {
      console.log('[Webhook] Invalid payload - missing event or payment')
      return NextResponse.json(
        { error: 'Invalid payload' },
        { status: 400 }
      )
    }

    // Process the webhook
    const result = await processWebhook.execute({
      eventId: payload.id,
      event: payload.event,
      payment: payload.payment,
    })

    console.log('[Webhook] Result:', result)

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error)

    // Always return 200 to Asaas to prevent retries for application errors
    // Asaas will retry on 4xx/5xx responses
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal error'
      },
      { status: 200 }
    )
  }
}

// Asaas may send GET requests to verify the endpoint
export async function GET() {
  return NextResponse.json({ status: 'Webhook endpoint active' }, { status: 200 })
}
