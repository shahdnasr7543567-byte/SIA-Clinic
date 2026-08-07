import { apiClient } from "@/api/axiosClient";
import type { OnlineBookingPayload } from "@/types/booking";

export const bookingApi = {
  create: (payload: OnlineBookingPayload) =>
    apiClient.post<{ id: string }>("/bookings", payload).then((r) => r.data),
};
