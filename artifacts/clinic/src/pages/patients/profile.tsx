import { useParams } from "wouter";
import { 
  useGetPatient, 
  useGetPatientPrescriptions, 
  useGetPatientAnalytics,
  getGetPatientQueryKey 
} from "@workspace/api-client-react";
import { 
  Calendar, FileText, Activity, AlertTriangle, 
  CalendarClock, TrendingUp
} from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PatientProfile() {
  const { id } = useParams();
  const patientId = Number(id);

  const { data: patient, isLoading } = useGetPatient(patientId, {
    query: { enabled: !!patientId, queryKey: getGetPatientQueryKey(patientId) }
  });
  
  const { data: history } = useGetPatientPrescriptions(patientId);
  const { data: analytics } = useGetPatientAnalytics(patientId);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--warning))', 'hsl(var(--destructive))', 'hsl(var(--chart-5))'];

  if (isLoading) return <div className="p-12 text-center">جاري تحميل الملف الطبي...</div>;
  if (!patient) return <div className="p-12 text-center text-destructive">المريض غير موجود</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Card */}
      <Card className="border-t-4 border-t-primary overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-primary/5 p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-primary-foreground font-heading font-black text-4xl shadow-lg shrink-0">
              {patient.name.charAt(0)}
            </div>
            
            <div className="flex-1 text-center md:text-right space-y-2">
              <h1 className="text-3xl font-bold font-heading">{patient.name}</h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-muted-foreground font-medium">
                <span className="flex items-center gap-1.5"><Activity className="h-4 w-4"/> {patient.age} سنة</span>
                <span className="flex items-center gap-1.5" dir="ltr">{patient.mobile}</span>
                <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4"/> انضم: {new Date(patient.createdAt).toLocaleDateString('ar-EG')}</span>
              </div>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
                {patient.chronicDiseases && (
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 px-3 py-1">
                    <Activity className="mr-1.5 h-3.5 w-3.5" /> أمراض مزمنة: {patient.chronicDiseases}
                  </Badge>
                )}
                {patient.allergies && (
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 px-3 py-1">
                    <AlertTriangle className="mr-1.5 h-3.5 w-3.5" /> حساسية: {patient.allergies}
                  </Badge>
                )}
              </div>
            </div>

            <div className="shrink-0 flex flex-col gap-2 w-full md:w-auto">
              <Button className="w-full gap-2">
                <CalendarClock className="h-4 w-4"/> تحديد موعد
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-x-reverse border-t bg-muted/10">
            <div className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{patient.totalVisits || 0}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">إجمالي الزيارات</div>
            </div>
            <div className="p-4 text-center">
              <div className="text-sm font-bold mt-1.5">{patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString('ar-EG') : 'لا يوجد'}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1.5">آخر زيارة</div>
            </div>
            <div className="p-4 text-center">
              <div className="text-sm font-bold mt-1.5 truncate px-2">{patient.topDiagnosis || 'لا يوجد'}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1.5">التشخيص المتكرر</div>
            </div>
            <div className="p-4 text-center">
              <div className="text-sm font-bold mt-1.5">
                <Badge variant={patient.status === 'done' ? 'default' : 'secondary'}>
                  {patient.status === 'waiting' ? 'منتظر' : patient.status === 'done' ? 'منتهي' : 'ملغي'}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1.5">الحالة الحالية</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="history" className="w-full">
        <TabsList className="w-full max-w-md mx-auto grid w-full grid-cols-2">
          <TabsTrigger value="history">التاريخ الطبي</TabsTrigger>
          <TabsTrigger value="analytics">إحصائيات المريض</TabsTrigger>
        </TabsList>
        
        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>الوصفات الطبية السابقة</CardTitle>
              <CardDescription>سجل زيارات المريض والتشخيصات لكل زيارة</CardDescription>
            </CardHeader>
            <CardContent>
              {!history || history.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">لا يوجد تاريخ طبي مسجل لهذا المريض</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>التاريخ</TableHead>
                        <TableHead>التشخيص</TableHead>
                        <TableHead>الأدوية</TableHead>
                        <TableHead>الطبيب</TableHead>
                        <TableHead>الحالة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {history.map((prescription) => (
                        <TableRow key={prescription.id}>
                          <TableCell className="font-medium">
                            {new Date(prescription.createdAt).toLocaleDateString('ar-EG')}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate" title={prescription.diagnosis}>
                            {prescription.diagnosis}
                          </TableCell>
                          <TableCell>{prescription.drugs.length} صنف</TableCell>
                          <TableCell>{prescription.doctor?.name || 'غير محدد'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={
                              prescription.status === 'dispensed' ? 'bg-accent/10 text-accent border-accent/20' : 
                              'bg-primary/10 text-primary border-primary/20'
                            }>
                              {prescription.status === 'dispensed' ? 'مصروف' : 'نشط'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary"/> معدل الزيارات
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                {analytics?.monthlyVisits ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.monthlyVisits}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                      <YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
                      <Tooltip 
                        contentStyle={{borderRadius: '8px', border: '1px solid hsl(var(--border))', textAlign: 'right'}}
                        formatter={(value) => [value, 'زيارة']}
                      />
                      <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={3} dot={{r: 4, fill: "hsl(var(--primary))"}} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">لا توجد بيانات كافية</div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4 text-accent"/> توزيع التشخيصات
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                {analytics?.diagnosisDistribution && analytics.diagnosisDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.diagnosisDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="count"
                        nameKey="diagnosis"
                        label={({diagnosis}) => diagnosis}
                      >
                        {analytics.diagnosisDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{borderRadius: '8px', border: '1px solid hsl(var(--border))', textAlign: 'right'}}
                        formatter={(value) => [value, 'مرة']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">لا توجد بيانات كافية</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
