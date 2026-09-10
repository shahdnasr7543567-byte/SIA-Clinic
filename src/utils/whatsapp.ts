// بيحول رقم موبايل مصري محلي (زي 01012345678) لصيغة دولية من غير + أو مسافات
// عشان رابط wa.me يشتغل صح (wa.me مش بيقبل غير أرقام بس، وبكود الدولة في الأول).
function normalizeEgyptianMobile(mobile: string): string {
  const digitsOnly = mobile.replace(/\D/g, "");
  if (digitsOnly.startsWith("20")) return digitsOnly;
  if (digitsOnly.startsWith("0")) return `20${digitsOnly.slice(1)}`;
  return `20${digitsOnly}`;
}

// بيبني رابط wa.me جاهز يفتح واتساب المريض ومعبّى فيه رسالة فيها لينك الروشتة.
// ملحوظة: ده مش محتاج WhatsApp Business API خالص — بس رابط عادي بيفتح تطبيق واتساب.
export function buildPrescriptionWhatsappLink(
  mobile: string,
  patientName: string,
  verifyUrl: string
): string {
  const phone = normalizeEgyptianMobile(mobile);
  const message = `مرحباً ${patientName}، روشتتك من عيادة سيا جاهزة ✅\nتقدر/ي تشوفيها أو تحمليها PDF من هنا:\n${verifyUrl}`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
} 
