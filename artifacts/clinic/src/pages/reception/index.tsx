import { useGetDashboardSummary, useGetPeakHours, useGetTopDiagnoses, useGetRecentPatients } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Users, Clock, CheckCircle2, DollarSign, UserPlus, Plus } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function ReceptionDashboard() {
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary();
  const { data: peakHours, isLoading: loadingPeak } = useGetPeakHours();
  const { data: topDiagnoses, isLoading: loadingDiag } = useGetTopDiagnoses();
  const { data: recentPatients, isLoading: loadingRecent } = useGetRecentPatients();

  // Custom styling for charts
  const chartColor = "hsl(var(--primary))";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading">لوحة الاستقبال</h1>
          <p className="text-muted-foreground">نظرة عامة على نشاط العيادة اليوم</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/reception/add-patient">
              <UserPlus className="ml-2 h-4 w-4" />
              إضافة مريض
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/reception/queue">
              <Clock className="ml-2 h-4 w-4" />
              الطابور
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المرضى</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loadingSummary ? "..." : summary?.totalPatients || 0}</div>
            <p className="text-xs text-muted-foreground">حجوزات اليوم</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قيد الانتظار</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loadingSummary ? "..." : summary?.waiting || 0}</div>
            <p className="text-xs text-muted-foreground">في صالة الانتظار</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تم الكشف</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loadingSummary ? "..." : summary?.done || 0}</div>
            <p className="text-xs text-muted-foreground">مرضى أنهوا الكشف</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الإيرادات</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingSummary ? "..." : `${summary?.revenue || 0} ج.م`}
            </div>
            <p className="text-xs text-muted-foreground">إجمالي المتحصلات</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>أوقات الذروة</CardTitle>
            <CardDescription>توزيع زيارات المرضى على مدار اليوم</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {loadingPeak ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">جاري التحميل...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peakHours || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="hour" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: 'hsl(var(--muted))'}}
                    contentStyle={{borderRadius: '8px', border: '1px solid hsl(var(--border))'}}
                  />
                  <Bar dataKey="count" fill={chartColor} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>التشخيصات الشائعة</CardTitle>
            <CardDescription>أكثر الحالات المرضية تسجيلاً</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {loadingDiag ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">جاري التحميل...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topDiagnoses || []} layout="vertical" margin={{ left: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis dataKey="diagnosis" type="category" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: 'hsl(var(--muted))'}}
                    contentStyle={{borderRadius: '8px', border: '1px solid hsl(var(--border))'}}
                  />
                  <Bar dataKey="count" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>أحدث المرضى المضافين</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingRecent ? (
            <div className="py-8 text-center text-muted-foreground">جاري التحميل...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>الأولوية</TableHead>
                    <TableHead>رقم الهاتف</TableHead>
                    <TableHead className="text-left">إجراء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPatients?.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">{patient.name}</TableCell>
                      <TableCell>
                        {patient.visitType === 'new' ? 'كشف جديد' : 'متابعة'}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={
                            patient.priority === 'critical' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                            patient.priority === 'urgent' ? 'bg-warning/10 text-warning border-warning/20' :
                            'bg-primary/10 text-primary border-primary/20'
                          }
                        >
                          {patient.priority === 'critical' ? 'حرج' : patient.priority === 'urgent' ? 'عاجل' : 'عادي'}
                        </Badge>
                      </TableCell>
                      <TableCell dir="ltr" className="text-right text-muted-foreground">{patient.mobile}</TableCell>
                      <TableCell className="text-left">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/patients/${patient.id}`}>التفاصيل</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {recentPatients?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        لا يوجد مرضى مضافين مؤخراً
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
