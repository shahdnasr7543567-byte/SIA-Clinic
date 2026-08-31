interface KnowledgeEntry {
  keywords: string[];
  reply: string;
}

const knowledgeBase: KnowledgeEntry[] = [
  {
    keywords: ["سعر", "الأسعار", "اسعار", "تكلفة", "فلوس"],
    reply: "سعر الكشف يبدأ من 150 جنيه، وممكن يختلف حسب نوع الكشف (عيادة/منزلي/أونلاين). تحب أساعدك تحجز؟",
  },
  {
    keywords: ["دكتور", "الأطباء", "اطباء", "طبيب"],
    reply: "عندنا أطباء متخصصون في أكتر من تخصص. تقدر تشوف الأطباء المتاحين وتحجز معاهم من صفحة الحجز أونلاين.",
  },
  {
    keywords: ["مواعيد", "المواعيد", "ساعات العمل", "شغالين امتى", "امتى بتفتحوا"],
    reply: "العيادة شغالة يوميًا من الساعة 9 صباحًا لحد 9 مساءً، ما عدا الجمعة.",
  },
  {
    keywords: ["حجز", "احجز", "عايز اعمل حجز", "موعد جديد"],
    reply: "تقدر تحجز موعدك أونلاين من هنا مباشرة، هحولك على صفحة الحجز.",
  },
];

const fallbackReply = "عذرًا، لم أفهم سؤالك بالكامل. جرب تختار من الأزرار السريعة تحت أو أعد صياغة سؤالك.";

export function getMockAiReply(message: string): string {
  const normalized = message.trim().toLowerCase();
  const match = knowledgeBase.find((entry) =>
    entry.keywords.some((keyword) => normalized.includes(keyword.toLowerCase()))
  );
  return match?.reply ?? fallbackReply;
}
