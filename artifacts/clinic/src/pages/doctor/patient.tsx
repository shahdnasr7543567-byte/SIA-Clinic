import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { 
  useGetPatient, 
  useListDrugs, 
  useCreatePrescription, 
  useUpdateQueueEntry,
  useGetPatientPrescriptions,
  getGetPatientQueryKey,
  useCreateAppointment
} from "@workspace/api-client-react";
import { 
  Mic, User, Activity, AlertTriangle, Pill, Plus, X, FileText, 
  CalendarClock, Save, Printer, Loader2
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";

// Types based on the schema
interface PrescriptionDrug {
  drugId: number;
  drugName: string;
  form: string;
  dosage: string;
  duration: string;
  unit: string;
}

export default function ActivePatient() {
  const { id } = useParams();
  const patientId = Number(id);
  const [locationValue, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const queueId = searchParams.get('queueId') ? Number(searchParams.get('queueId')) : null;
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: patient, isLoading: loadingPatient } = useGetPatient(patientId, {
    query: { enabled: !!patientId, queryKey: getGetPatientQueryKey(patientId) }
  });
  
  const { data: history } = useGetPatientPrescriptions(patientId);

  // Prescription State
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [drugs, setDrugs] = useState<PrescriptionDrug[]>([]);
  
  // Current Drug State
  const [drugSearch, setDrugSearch] = useState("");
  const [selectedDrug, setSelectedDrug] = useState<any>(null);
  const [dosage, setDosage] = useState("");
  const [duration, setDuration] = useState("");
  const [unit, setUnit] = useState("");
  const [drugForm, setDrugForm] = useState("");
  
  const { data: drugResults, isLoading: searchingDrugs } = useListDrugs(
    { search: drugSearch },
    { query: { enabled: drugSearch.length > 1 } }
  );

  const createPrescription = useCreatePrescription();
  const updateQueueEntry = useUpdateQueueEntry();
  const createAppointment = useCreateAppointment();
  
  // Speech recognition
  const [isRecording, setIsRecording] = useState(false);
  
  const startRecording = () => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ title: "متصفحك لا يدعم التعرف على الصوت", variant: "destructive" });
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-EG';
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setDiagnosis(prev => prev ? `${prev} ${transcript}` : transcript);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    
    recognition.start();
  };

  const handleAddDrug = () => {
    if (!selectedDrug || !dosage || !duration) {
      toast({ title: "يرجى استكمال بيانات الدواء", variant: "destructive" });
      return;
    }
    
    setDrugs([...drugs, {
      drugId: selectedDrug.id,
      drugName: selectedDrug.name,
      form: drugForm || selectedDrug.form,
      dosage,
      duration,
      unit: unit || 'قرص'
    }]);
    
    // Reset form
    setDrugSearch("");
    setSelectedDrug(null);
    setDosage("");
    setDuration("");
    setUnit("");
    setDrugForm("");
  };

  const removeDrug = (index: number) => {
    setDrugs(drugs.filter((_, i) => i !== index));
  };

  const handleSaveAndPrint = () => {
    if (!diagnosis) {
      toast({ title: "يرجى إدخال التشخيص أولاً", variant: "destructive" });
      return;
    }

    createPrescription.mutate({
      data: {
        patientId,
        doctorId: user?.id || 1,
        diagnosis,
        drugs,
        notes
      }
    }, {
      onSuccess: () => {
        toast({ title: "تم حفظ الوصفة بنجاح" });
        if (queueId) {
          updateQueueEntry.mutate({ id: queueId, data: { status: 'done' } });
        }
        window.print();
        setTimeout(() => setLocation("/doctor"), 1000);
      }
    });
  };

  const applyTemplate = (tmpl: string) => {
    setDiagnosis(prev => prev ? `${prev} - ${tmpl}` : tmpl);
  };

  if (loadingPatient) return <div className="p-8 text-center">جاري التحميل...</div>;
  if (!patient) return <div className="p-8 text-center text-destructive">المريض غير موجود</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20 lg:pb-0" dir="rtl">
      {/* Print only visible on print */}
      <div className="hidden print:block fixed inset-0 bg-white p-8 z-50 text-black">
        <div className="flex justify-between items-center border-b-2 border-primary pb-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary font-heading">سِيَا للرعاية الطبية</h1>
            <p className="text-lg">د. {user?.name}</p>
            <p className="text-sm text-gray-500">{user?.specialty}</p>
          </div>
          <div className="text-left">
            <p className="font-bold">المريض: {patient.name}</p>
            <p>العمر: {patient.age} سنة</p>
            <p>التاريخ: {new Date().toLocaleDateString('ar-EG')}</p>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-2">التشخيص (Diagnosis):</h2>
          <p className="text-lg">{diagnosis}</p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Pill className="h-6 w-6"/> Rx</h2>
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-2">الدواء</th>
                <th className="py-2">الشكل</th>
                <th className="py-2">الجرعة</th>
                <th className="py-2">المدة</th>
              </tr>
            </thead>
            <tbody>
              {drugs.map((d, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-3 font-bold text-lg">{d.drugName}</td>
                  <td className="py-3">{d.form}</td>
                  <td className="py-3">{d.dosage}</td>
                  <td className="py-3">{d.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {notes && (
          <div className="mt-8 border-t pt-4">
            <h2 className="font-bold mb-1">ملاحظات:</h2>
            <p>{notes}</p>
          </div>
        )}
      </div>

      {/* Main UI */}
      <div className="lg:col-span-4 space-y-6 print:hidden">
        <Card className="border-t-4 border-t-primary">
          <CardHeader className="pb-3">
            <CardTitle className="flex justify-between items-start">
              <span>{patient.name}</span>
              <Badge>{patient.visitType === 'new' ? 'جديد' : 'متابعة'}</Badge>
            </CardTitle>
            <CardDescription className="flex flex-col gap-1">
              <span className="flex items-center gap-1"><User className="h-3.5 w-3.5"/> {patient.age} سنة</span>
              <span className="flex items-center gap-1" dir="ltr"><span dir="rtl">رقم:</span> {patient.mobile}</span>
            </CardDescription>
          </CardHeader>
          {(patient.allergies || patient.chronicDiseases) && (
            <CardContent>
              <div className="space-y-2">
                {patient.allergies && (
                  <div className="bg-destructive/10 text-destructive p-2 rounded-md text-sm flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <div><span className="font-bold">حساسية:</span> {patient.allergies}</div>
                  </div>
                )}
                {patient.chronicDiseases && (
                  <div className="bg-warning/10 text-warning p-2 rounded-md text-sm flex items-start gap-2">
                    <Activity className="h-4 w-4 mt-0.5 shrink-0" />
                    <div><span className="font-bold">أمراض مزمنة:</span> {patient.chronicDiseases}</div>
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>

        {history && history.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4"/> الزيارات السابقة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {history.slice(0, 3).map(h => (
                  <div key={h.id} className="text-sm border-b pb-2 last:border-0">
                    <div className="flex justify-between text-muted-foreground mb-1">
                      <span>{new Date(h.createdAt).toLocaleDateString('ar-EG')}</span>
                      <span>{h.drugs.length} أدوية</span>
                    </div>
                    <div className="font-medium truncate">{h.diagnosis}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="lg:col-span-8 space-y-6 print:hidden">
        <Card className="shadow-sm">
          <CardHeader className="bg-muted/30 pb-4 border-b">
            <CardTitle className="text-xl flex items-center gap-2 text-primary">
              <Pill className="h-5 w-5"/> بناء الوصفة الطبية (Prescription)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            
            {/* Diagnosis */}
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <Label className="text-base font-bold">التشخيص (Diagnosis)</Label>
                <Button 
                  type="button" 
                  variant={isRecording ? "destructive" : "secondary"} 
                  size="sm" 
                  onClick={startRecording}
                  className="h-8 rounded-full"
                >
                  <Mic className={`mr-2 h-4 w-4 ${isRecording ? "animate-pulse" : ""}`} />
                  {isRecording ? "جاري الاستماع..." : "إملاء صوتي"}
                </Button>
              </div>
              <Textarea 
                placeholder="اكتب التشخيص هنا..." 
                value={diagnosis}
                onChange={e => setDiagnosis(e.target.value)}
                className="resize-none h-20 text-lg"
              />
              <div className="flex gap-2 flex-wrap">
                {["نزلة برد", "ارتفاع ضغط الدم", "صداع نصفي", "التهاب بالمعدة", "سكر من النوع الثاني"].map(tmpl => (
                  <Badge 
                    key={tmpl} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() => applyTemplate(tmpl)}
                  >
                    + {tmpl}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="border-t my-4"></div>

            {/* Drug Builder */}
            <div className="space-y-4 bg-muted/20 p-4 rounded-lg border">
              <Label className="text-base font-bold flex items-center gap-2">
                <Plus className="h-4 w-4"/> إضافة دواء
              </Label>
              
              <div className="relative">
                <Input 
                  placeholder="ابحث عن اسم الدواء (En)..." 
                  value={drugSearch}
                  onChange={e => setDrugSearch(e.target.value)}
                  dir="ltr"
                  className="text-left font-bold text-lg"
                />
                {searchingDrugs && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin" />}
                
                {drugResults && drugResults.length > 0 && !selectedDrug && drugSearch && (
                  <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-48 overflow-y-auto" dir="ltr">
                    {drugResults.map(drug => (
                      <div 
                        key={drug.id} 
                        className="px-4 py-2 hover:bg-muted cursor-pointer text-left flex justify-between"
                        onClick={() => {
                          setSelectedDrug(drug);
                          setDrugSearch(drug.name);
                        }}
                      >
                        <span className="font-bold">{drug.name}</span>
                        <span className="text-muted-foreground text-sm">{drug.form}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedDrug?.interactions && (
                <div className="bg-destructive/10 text-destructive p-2 rounded text-sm flex gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block mb-1">تحذير تفاعلات دوائية:</span>
                    {selectedDrug.interactions}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">الشكل الصيدلي</Label>
                  <Select value={drugForm} onValueChange={setDrugForm}>
                    <SelectTrigger><SelectValue placeholder="اختر..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tablet">أقراص (Tablet)</SelectItem>
                      <SelectItem value="syrup">شراب (Syrup)</SelectItem>
                      <SelectItem value="injection">حقن (Injection)</SelectItem>
                      <SelectItem value="ointment">مرهم (Ointment)</SelectItem>
                      <SelectItem value="capsule">كبسولات (Capsule)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">الجرعة</Label>
                  <Input placeholder="مثال: 1-0-1" value={dosage} onChange={e=>setDosage(e.target.value)} dir="ltr" className="text-center" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">المدة</Label>
                  <Input placeholder="مثال: 7 days" value={duration} onChange={e=>setDuration(e.target.value)} dir="ltr" className="text-center" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">الوحدة</Label>
                  <Input placeholder="قرص/ملعقة" value={unit} onChange={e=>setUnit(e.target.value)} />
                </div>
              </div>
              <Button type="button" onClick={handleAddDrug} className="w-full" variant="secondary">
                إضافة للقائمة
              </Button>
            </div>

            {/* Drugs List */}
            {drugs.length > 0 && (
              <div className="space-y-2">
                <Label className="text-base font-bold">الأدوية الموصوفة</Label>
                <div className="border rounded-md divide-y">
                  {drugs.map((drug, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-white dark:bg-card">
                      <div className="flex-1 grid grid-cols-4 gap-4 items-center">
                        <div className="font-bold text-lg col-span-2" dir="ltr">{drug.drugName}</div>
                        <div className="text-center bg-muted/50 rounded p-1 text-sm font-medium" dir="ltr">{drug.dosage}</div>
                        <div className="text-center text-sm text-muted-foreground" dir="ltr">{drug.duration}</div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeDrug(i)} className="text-destructive ml-4">
                        <X className="h-4 w-4"/>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-base font-bold">ملاحظات للمريض</Label>
              <Textarea 
                placeholder="تعليمات إضافية..." 
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="resize-none"
              />
            </div>

          </CardContent>
        </Card>
      </div>

      {/* Action Bar - Sticky at bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t shadow-[0_-4px_10px_rgba(0,0,0,0.05)] print:hidden z-40 lg:pl-8 flex justify-end gap-3 lg:w-[calc(100%-16rem)]">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <CalendarClock className="h-4 w-4"/> تحديد موعد متابعة
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>حجز موعد متابعة للمريض</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>تاريخ الموعد</Label>
                <Input type="date" id="followup-date" />
              </div>
              <div className="space-y-2">
                <Label>ملاحظات الاستقبال</Label>
                <Input placeholder="مثال: إحضار التحاليل المطلوبة" id="followup-notes" />
              </div>
              <Button className="w-full" onClick={() => {
                const date = (document.getElementById('followup-date') as HTMLInputElement).value;
                const notes = (document.getElementById('followup-notes') as HTMLInputElement).value;
                if (!date) return toast({title: "اختر التاريخ", variant: "destructive"});
                createAppointment.mutate({
                  data: {
                    patientId,
                    doctorId: user?.id,
                    scheduledDate: new Date(date).toISOString(),
                    notes,
                    reminderType: "tomorrow"
                  }
                }, {
                  onSuccess: () => {
                    toast({title: "تم تحديد الموعد"});
                    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
                  }
                });
              }}>
                حفظ الموعد
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        <Button 
          onClick={handleSaveAndPrint} 
          disabled={createPrescription.isPending}
          className="gap-2 font-bold px-8 text-base"
        >
          {createPrescription.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5"/>}
          حفظ وطباعة
        </Button>
      </div>
    </div>
  );
}
