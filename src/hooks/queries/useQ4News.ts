import { useQuery } from '@tanstack/react-query'
import { q4newsService } from '@/lib/services/q4newsService'

export const q4newsKeys = {
  all: ['q4news'] as const,
  lists: () => [...q4newsKeys.all, 'list'] as const,
  detail: (id: string) => [...q4newsKeys.all, id] as const,
}

export function useQ4NewsList() {
  return useQuery({
    queryKey: q4newsKeys.lists(),
    queryFn: () => q4newsService.listPublished(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useQ4NewsById(id?: string) {
  return useQuery({
    queryKey: q4newsKeys.detail(id!),
    queryFn: () => q4newsService.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}
