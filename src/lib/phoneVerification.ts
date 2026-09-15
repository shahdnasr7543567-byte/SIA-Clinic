
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from "firebase/auth";
import { firebaseAuth } from "./firebase";

/**
 * لازم تتنادى مرة واحدة بس، وبتحتاج id بتاع عنصر HTML فاضي في الصفحة
 * (هنضيفه في الفورم بعدين) عشان تربط الـ reCAPTCHA بيه.
 */
export function createRecaptchaVerifier(containerId: string) {
  return new RecaptchaVerifier(firebaseAuth, containerId, {
    size: "invisible",
  });
}

/**
 * بتبعت كود التحقق لرقم الموبايل.
 * لازم الرقم يكون بصيغة دولية كاملة، مثلاً: +201012345678
 */
export async function sendOtp(
  phoneNumber: string,
  recaptchaVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  return signInWithPhoneNumber(firebaseAuth, phoneNumber, recaptchaVerifier);
}

/**
 * بتتأكد من الكود اللي المريض كتبه، وبترجع الـ ID token
 * اللي هنبعته للباك إند مع بيانات التسجيل.
 */
export async function verifyOtp(
  confirmationResult: ConfirmationResult,
  code: string
): Promise<string> {
  const credential = await confirmationResult.confirm(code);
  return credential.user.getIdToken();
} 


