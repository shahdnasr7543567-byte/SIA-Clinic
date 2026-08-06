import { useState } from "react";
import { 
  useListInventory, 
  useListPrescriptions, 
  useDispensePrescription,
  getListInventoryQueryKey,
  getListPrescriptionsQueryKey
} from "@workspace/api-client-react";
import { Pill, Search, AlertTriangle, CheckCircle2, PackageSearch, PackageMinus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function Pharmacy() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [inventorySearch, setInventorySearch] = useState("");
  const [showLowStock, setShowLowStock] = useState(false);
  
  const { data: inventory, isLoading: loadingInventory } = useListInventory({ 
    search: inventorySearch,
    lowStock: showLowStock || undefined
  });
  
  const { data: prescriptions, isLoading: loadingPrescriptions } = useListPrescriptions({ status: 'active' });
  const dispenseMutation = useDispensePrescription();

  const handleDispense = (prescriptionId: number) => {
    dispenseMutation.mutate(
      { data: { prescriptionId } },
      {
        onSuccess: () => {
          toast({ title: "تم صرف الوصفة بنجاح وتحديث الجرد" });
          queryClient.invalidateQueries({ queryKey: getListPrescriptionsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListInventoryQueryKey() });
        },
        onError: () => {
          toast({ title: "فشل الصرف. تأكد من توفر الأدوية في الجرد", variant: "destructive" });
        }
      }
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold font-heading flex items-center gap-2">
          <Pill className="h-8 w-8 text-primary" /> صيدلية العيادة
        </h1>
        <p className="text-muted-foreground mt-1">إدارة المخزون وصرف الوصفات الطبية</p>
      </div>

      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="w-full max-w-md grid grid-cols-2 bg-muted/50 p-1 rounded-lg">
          <TabsTrigger value="inventory" className="rounded-md data-[state=active]:shadow-sm">الجرد (المخزون)</TabsTrigger>
          <TabsTrigger value="prescriptions" className="rounded-md data-[state=active]:shadow-sm">الوصفات الواردة 
            {prescriptions && prescriptions.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 min-w-5 px-1 flex justify-center rounded-full text-[10px]">
                {prescriptions.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="inventory" className="mt-6 space-y-4">
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <PackageSearch className="h-5 w-5" /> جرد الأدوية
                </CardTitle>
                <div className="flex items-center gap-6 w-full sm:w-auto">
                  <div className="flex items-center gap-2">
                    <Switch 
                      id="low-stock" 
                      checked={showLowStock} 
                      onCheckedChange={setShowLowStock} 
                    />
                    <Label htmlFor="low-stock" className="cursor-pointer font-medium text-sm text-destructive">
                      النواقص فقط
                    </Label>
                  </div>
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="بحث في الأدوية..." 
                      className="pr-9"
                      value={inventorySearch}
                      onChange={(e) => setInventorySearch(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingInventory ? (
                <div className="py-12 text-center text-muted-foreground">جاري تحميل الجرد...</div>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead>اسم الدواء</TableHead>
                        <TableHead className="text-center">الكمية</TableHead>
                        <TableHead>السعر</TableHead>
                        <TableHead>تاريخ الصلاحية</TableHead>
                        <TableHead>الحالة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inventory?.map((item) => {
                        const isLowStock = item.quantity <= (item.minimumStock || 10);
                        return (
                          <TableRow key={item.id} className={isLowStock ? 'bg-destructive/5' : ''}>
                            <TableCell className="font-bold font-mono" dir="ltr">{item.drugName}</TableCell>
                            <TableCell className="text-center font-bold text-lg">
                              <span className={isLowStock ? "text-destructive" : ""}>{item.quantity}</span>
                              <span className="text-xs text-muted-foreground mr-1">{item.unit}</span>
                            </TableCell>
                            <TableCell>{item.price} ج.م</TableCell>
                            <TableCell dir="ltr" className="text-right text-muted-foreground text-sm">
                              {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('en-GB') : '---'}
                            </TableCell>
                            <TableCell>
                              {isLowStock ? (
                                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 gap-1">
                                  <AlertTriangle className="h-3 w-3" /> ناقص
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">متوفر</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {inventory?.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                            لا توجد أدوية مطابقة
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="prescriptions" className="mt-6">
          {loadingPrescriptions ? (
            <div className="py-12 text-center text-muted-foreground">جاري تحميل الوصفات...</div>
          ) : prescriptions?.length === 0 ? (
            <Card className="border-dashed shadow-none bg-muted/10">
              <CardContent className="flex flex-col items-center justify-center py-20">
                <CheckCircle2 className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-bold text-muted-foreground">لا توجد وصفات قيد الانتظار</h3>
                <p className="text-muted-foreground text-sm mt-2">تم صرف جميع الوصفات بنجاح</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {prescriptions?.map((prescription) => (
                <Card key={prescription.id} className="border-t-4 border-t-primary shadow-sm hover:shadow transition-shadow">
                  <CardHeader className="p-4 pb-2 border-b">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{prescription.patient?.name}</CardTitle>
                        <CardDescription className="mt-1">د. {prescription.doctor?.name}</CardDescription>
                      </div>
                      <Badge className="font-mono text-xs" variant="secondary" dir="ltr">
                        #{prescription.prescriptionCode?.split('-')[0]}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="p-4 bg-muted/10">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">الأدوية المطلوبة</h4>
                      <ul className="space-y-3">
                        {prescription.drugs.map((drug, idx) => (
                          <li key={idx} className="flex justify-between items-center text-sm border-b pb-2 last:border-0 last:pb-0">
                            <span className="font-bold font-mono" dir="ltr">{drug.drugName}</span>
                            <span className="text-muted-foreground bg-muted px-2 py-0.5 rounded">{drug.form}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-4 bg-white dark:bg-card border-t">
                      <Button 
                        className="w-full font-bold" 
                        onClick={() => handleDispense(prescription.id)}
                        disabled={dispenseMutation.isPending}
                      >
                        {dispenseMutation.isPending ? "جاري الصرف..." : "صرف الأدوية"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
