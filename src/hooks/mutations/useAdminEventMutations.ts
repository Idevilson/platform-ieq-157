import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService, CreateEventInput, CreateEventResponse, UpdateEventStatusResponse } from '@/lib/services/adminService'
import { EventStatus } from '@/shared/constants'

export function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation<CreateEventResponse, Error, CreateEventInput>({
    mutationFn: (input) => adminService.createEvent(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] })
    },
  })
}

export function useUpdateEventStatus() {
  const queryClient = useQueryClient()

  return useMutation<UpdateEventStatusResponse, Error, { eventId: string; status: EventStatus }>({
    mutationFn: ({ eventId, status }) => adminService.updateEventStatus(eventId, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] })
      queryClient.invalidateQueries({ queryKey: ['events', data.id] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}
