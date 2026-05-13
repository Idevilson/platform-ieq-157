'use client'

import { useMutation } from '@tanstack/react-query'
import { batchInscriptionService } from '@/lib/services/batchInscriptionService'
import { CreateBatchInscriptionRequest } from '@/shared/types/inscription'

export function useCreateBatchInscription() {
  return useMutation({
    mutationFn: (data: CreateBatchInscriptionRequest) =>
      batchInscriptionService.createBatch(data),
  })
}

export function useCreateBatchPayment() {
  return useMutation({
    mutationFn: (batchId: string) => batchInscriptionService.createPayment(batchId),
  })
}
