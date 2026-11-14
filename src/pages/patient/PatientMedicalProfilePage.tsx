
import { useMedicalProfile } from "@/hooks/usePatientData";

export default function PatientMedicalProfilePage() {
  const { data, isLoading, isError } = useMedicalProfile();

  if (isLoading) return <div>جاري التحميل...</div>;
  if (isError) return <div>حصل خطأ في تحميل البيانات</div>;
  if (!data) return <div>لا توجد بيانات مسجلة</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">ملفي الطبي</h1>

      <div className="mb-6">
        <p>السن: {data.age}</p>
        {data.bloodType && <p>الجروب الدموي: {data.bloodType}</p>}
      </div>

      <div className="mb-6 border-l-4 border-red-500 bg-red-50 p-3 rounded">
        <h2 className="font-bold text-red-700 mb-2">⚠️ الحساسية من الأدوية</h2>
        {data.allergies.length > 0 ? (
          <p className="text-sm">{data.allergies.join("، ")}</p>
        ) : (
          <p className="text-sm text-muted-foreground">لا يوجد</p>
        )}
      </div>

      <div>
        <h2 className="font-bold mb-2">الأمراض المزمنة</h2>
        {data.chronicDiseases.length > 0 ? (
          <p className="text-sm">{data.chronicDiseases.join("، ")}</p>
        ) : (
          <p className="text-sm text-muted-foreground">لا يوجد</p>
        )}
      </div>
    </div>
  );
} 

