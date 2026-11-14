
import { apiClient } from "@/api/axiosClient";
import type { PublicPrescriptionView } from "@/types/prescription";

// نقطة نهاية عامة من غير تسجيل دخول — بيقدر يفتحها المريض أو الصيدلي
// من رابط واتساب أو من مسح QR Code.
export const publicApi = {
  getPrescription: (code: string) =>
    apiClient.get<PublicPrescriptionView>(`/public/prescriptions/${code}`).then((r) => r.data),
}; 

