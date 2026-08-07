import { useState } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Search, Loader2 } from "lucide-react";
import { useCreatePatient, useAddToQueue, useListPatients } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  mobile: z.string().regex(/^01[0125][0-9]{8}$/, "رقم هاتف مصري غير صحيح"),
  age: z.coerce.number().min(1, "العمر مطلوب"),
  priority: z.enum(["normal", "urgent", "critical"]),
  visitType: z.enum(["new", "followup"]),
  examType: z.enum(["clinic", "home", "online"]),
  bookingType: z.enum(["online", "cash", "instapay"]),
  notes: z.string().optional(),
  chronicDiseases: z.string().optional(),
  allergies: z.string().optional(),
});

export default function AddPatient() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  
  const createPatient = useCreatePatient();
  const addToQueue = useAddToQueue();

  const { data: searchResults, isLoading: isSearching } = useListPatients(
    { search: searchQuery },
    { query: { enabled: searchQuery.length > 2 } }
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      mobile: "",
      priority: "normal",
      visitType: "new",
      examType: "clinic",
      bookingType: "cash",
      notes: "",
      chronicDiseases: "",
      allergies: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      createPatient.mutate({ data: values }, {
        onSuccess: (patient) => {
          // Immediately add to queue
          addToQueue.mutate({ 
            data: { 
              patientId: patient.id,
              priority: values.priority as 'normal'|'urgent'|'critical',
              notes: values.notes
            } 
          }, {
            onSuccess: () => {
              toast({ title: "تم تسجيل المريض وإضافته للطابور بنجاح" });
              setLocation("/reception/queue");
            }
          });
        },
        onError: () => {
          toast({ title: "حدث خطأ أثناء تسجيل المريض", variant: "destructive" });
        }
      });
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold font-heading">إضافة مريض</h1>
        <p className="text-muted-foreground">تسجيل مريض جديد أو البحث عن مريض حالي</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-5 w-5" />
            البحث في السجلات السابقة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Input 
              placeholder="ابحث بالاسم أو رقم الهاتف..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
            {isSearching && (
              <Loader2 className="absolute left-3 top-2.5 h-5 w-5 animate-spin text-muted-foreground" />
            )}
          </div>
          
          {searchResults && searchResults.length > 0 && (
            <div className="mt-4 border rounded-md divide-y">
              {searchResults.slice(0, 3).map(patient => (
                <div key={patient.id} className="p-3 flex justify-between items-center hover:bg-muted/50">
                  <div>
                    <div className="font-medium">{patient.name}</div>
                    <div className="text-sm text-muted-foreground">{patient.mobile} • {patient.age} سنة</div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => {
                      form.setValue("name", patient.name);
                      form.setValue("mobile", patient.mobile);
                      form.setValue("age", patient.age);
                      form.setValue("chronicDiseases", patient.chronicDiseases || "");
                      form.setValue("allergies", patient.allergies || "");
                      form.setValue("visitType", "followup");
                      setSearchQuery("");
                      toast({ title: "تم تعبئة بيانات المريض" });
                    }}
                  >
                    اختيار
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">البيانات الأساسية</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>الاسم</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  
                  <FormField control={form.control} name="mobile" render={({ field }) => (
                    <FormItem>
                      <FormLabel>رقم الهاتف</FormLabel>
                      <FormControl><Input dir="ltr" className="text-right" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="age" render={({ field }) => (
                    <FormItem>
                      <FormLabel>العمر</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">تفاصيل الزيارة</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField control={form.control} name="priority" render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>الأولوية</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                          <FormItem className="flex items-center space-x-3 space-x-reverse space-y-0">
                            <FormControl><RadioGroupItem value="normal" /></FormControl>
                            <FormLabel className="font-normal text-primary">عادي</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-x-reverse space-y-0">
                            <FormControl><RadioGroupItem value="urgent" /></FormControl>
                            <FormLabel className="font-normal text-warning">عاجل</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-x-reverse space-y-0">
                            <FormControl><RadioGroupItem value="critical" /></FormControl>
                            <FormLabel className="font-normal text-destructive font-bold">حرج</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="visitType" render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>نوع الزيارة</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                          <FormItem className="flex items-center space-x-3 space-x-reverse space-y-0">
                            <FormControl><RadioGroupItem value="new" /></FormControl>
                            <FormLabel className="font-normal">كشف جديد</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-x-reverse space-y-0">
                            <FormControl><RadioGroupItem value="followup" /></FormControl>
                            <FormLabel className="font-normal">متابعة</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="bookingType" render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>طريقة الدفع</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                          <FormItem className="flex items-center space-x-3 space-x-reverse space-y-0">
                            <FormControl><RadioGroupItem value="cash" /></FormControl>
                            <FormLabel className="font-normal">كاش بالعيادة</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-x-reverse space-y-0">
                            <FormControl><RadioGroupItem value="instapay" /></FormControl>
                            <FormLabel className="font-normal">إنستاباي (InstaPay)</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-x-reverse space-y-0">
                            <FormControl><RadioGroupItem value="online" /></FormControl>
                            <FormLabel className="font-normal">أونلاين (Online)</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )} />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">ملاحظات طبية (اختياري)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="chronicDiseases" render={({ field }) => (
                    <FormItem>
                      <FormLabel>أمراض مزمنة</FormLabel>
                      <FormControl><Input placeholder="مثل: ضغط، سكر..." {...field} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="allergies" render={({ field }) => (
                    <FormItem>
                      <FormLabel>حساسية</FormLabel>
                      <FormControl><Input placeholder="مثل: بنسيلين..." {...field} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="notes" render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>ملاحظات أخرى للاستقبال</FormLabel>
                      <FormControl><Textarea className="resize-none" {...field} /></FormControl>
                    </FormItem>
                  )} />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setLocation("/reception")}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={createPatient.isPending || addToQueue.isPending}>
                  {(createPatient.isPending || addToQueue.isPending) ? "جاري الحفظ..." : "حفظ المريض"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
