import type { FieldErrors, FieldValues, Path } from 'react-hook-form'

type DirtyMap<T extends FieldValues> = Partial<Record<Path<T>, boolean>>

export function fieldClass<T extends FieldValues>(
  name: Path<T>,
  errors: FieldErrors<T>,
  dirtyFields: DirtyMap<T>,
): 'input-error' | 'input-success' | '' {
  if (errors[name]) return 'input-error'
  if (dirtyFields[name]) return 'input-success'
  return ''
}
