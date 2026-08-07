import { useState } from "react";
import { Link } from "wouter";
import { Search, UserPlus, FileText, ChevronLeft } from "lucide-react";
import { useListPatients } from "@workspace/api-client-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PatientsList() {
  const [searchQuery, setSearchQuery] = useState("");
  // Enable search immediately to show full list when empty, filter when typing
  const { data: patients, isLoading } = useListPatients({ search: searchQuery });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading">سجل المرضى</h1>
          <p className="text-muted-foreground">البحث في السجلات الطبية</p>
        </div>
        <Button asChild>
          <Link href="/reception/add-patient">
            <UserPlus className="ml-2 h-4 w-4" />
            إضافة مريض جديد
          </Link>
        </Button>
      </div>

      <Card className="border-0 shadow-md">
        <CardContent className="p-2">
          <div className="relative">
            <Search className="absolute right-4 top-3.5 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="ابحث بالاسم أو رقم الهاتف..." 
              className="pl-4 pr-12 h-12 text-lg border-0 focus-visible:ring-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="py-12 text-center text-muted-foreground">جاري البحث...</div>
      ) : patients?.length === 0 ? (
        <div className="text-center py-24">
          <FileText className="mx-auto h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-bold text-muted-foreground">لا توجد نتائج</h3>
          <p className="text-muted-foreground text-sm mt-2">لم يتم العثور على مريض بهذا الاسم أو الرقم</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {patients?.map((patient) => (
            <Link key={patient.id} href={`/patients/${patient.id}`}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer border-transparent shadow-sm hover:shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg shrink-0">
                      {patient.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{patient.name}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span dir="ltr">{patient.mobile}</span>
                        <span>•</span>
                        <span>{patient.age} سنة</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden md:flex flex-col items-end">
                      <span className="text-xs text-muted-foreground">آخر زيارة</span>
                      <span className="font-medium">{patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString('ar-EG') : 'لا يوجد'}</span>
                    </div>
                    <ChevronLeft className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
