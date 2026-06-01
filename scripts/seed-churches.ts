import { seedSedeRedencao } from '../src/server/infrastructure/firebase/seeds/seedSedeRedencao'

async function main(): Promise<void> {
  const result = await seedSedeRedencao()
  if (result.created) {
    console.log('[seed-churches] SEDE DE REDENÇÃO criada com sucesso')
    return
  }
  console.log('[seed-churches] SEDE DE REDENÇÃO já existia — nenhuma alteração')
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[seed-churches] erro:', err)
    process.exit(1)
  })
