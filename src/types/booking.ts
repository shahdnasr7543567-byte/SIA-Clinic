export type BookingExamType = "clinic" | "home" | "online";
export type PaymentMethod = "cash" | "instapay";

export interface OnlineBookingPayload {
  name: string;
  mobile: string;
  age: number;
  examType: BookingExamType;
  date: string;
  time: string;
  paymentMethod: PaymentMethod;
}
