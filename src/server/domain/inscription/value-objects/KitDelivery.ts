export interface KitDeliveryRecord {
  itemId: string
  entregue: boolean
  entreguePor?: string
  entreguePorNome?: string
  entregueEm?: Date
}

export function upsertKitDelivery(
  deliveries: KitDeliveryRecord[],
  itemId: string,
  entregue: boolean,
  entreguePor?: string,
  entreguePorNome?: string,
): KitDeliveryRecord[] {
  const others = deliveries.filter((d) => d.itemId !== itemId)
  if (!entregue) return [...others, { itemId, entregue: false }]
  return [...others, { itemId, entregue: true, entreguePor, entreguePorNome, entregueEm: new Date() }]
}

export function kitDeliveryToJSON(record: KitDeliveryRecord) {
  return {
    itemId: record.itemId,
    entregue: record.entregue,
    entreguePor: record.entreguePor,
    entreguePorNome: record.entreguePorNome,
    entregueEm: record.entregueEm?.toISOString(),
  }
}
