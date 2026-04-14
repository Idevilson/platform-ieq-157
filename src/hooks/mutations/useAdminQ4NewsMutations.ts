import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '@/lib/services/adminService'

export function useCreateNewsPost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { slug?: string; titulo: string; descricao: string; conteudo: string; youtubeUrl: string; status?: string }) =>
      adminService.createNewsPost(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'q4news'] })
      queryClient.invalidateQueries({ queryKey: ['q4news'] })
    },
  })
}

export function useUpdateNewsPost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ newsId, ...input }: { newsId: string; titulo?: string; descricao?: string; conteudo?: string; youtubeUrl?: string; status?: string }) =>
      adminService.updateNewsPost(newsId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'q4news'] })
      queryClient.invalidateQueries({ queryKey: ['q4news'] })
    },
  })
}

export function useDeleteNewsPost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (newsId: string) => adminService.deleteNewsPost(newsId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'q4news'] })
      queryClient.invalidateQueries({ queryKey: ['q4news'] })
    },
  })
}
