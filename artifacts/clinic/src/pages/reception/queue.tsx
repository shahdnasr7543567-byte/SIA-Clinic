import { useState } from "react";
import { useListQueue, useUpdateQueueEntry } from "@workspace/api-client-react";
import { formatDistanceToNow } from "date-fns";
import { arEG } from "date-fns/locale";
import { Search, CheckCircle2, XCircle, AlertCircle, Clock, AlertTriangle } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getListQueueQueryKey } from "@workspace/api-client-react";

export default function QueueManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: queue, isLoading } = useListQueue();
  const updateQueueEntry = useUpdateQueueEntry();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleUpdateStatus = (id: number, status: 'done' | 'cancelled') => {
    updateQueueEntry.mutate(
      { id, data: { status } },
      {
        onSuccess: () => {
          toast({ 
            title: status === 'done' ? "تم إنهاء الكشف" : "تم إلغاء الحجز",
            variant: status === 'cancelled' ? "destructive" : "default"
          });
          queryClient.invalidateQueries({ queryKey: getListQueueQueryKey() });
        },
      }
    );
  };

  const filteredQueue = queue?.filter(entry => 
    entry.status === 'waiting' &&
    (entry.patient?.name?.includes(searchQuery) || entry.patient?.mobile?.includes(searchQuery))
  ) || [];

  const getPriorityColor = (priority: string) => {
    if (priority === 'critical') return 'text-destructive bg-destructive/10 border-destructive/20';
    if (priority === 'urgent') return 'text-warning bg-warning/10 border-warning/20';
    return 'text-primary bg-primary/10 border-primary/20';
  };

  const getPriorityLabel = (priority: string) => {
    if (priority === 'critical') return 'حالة حرجة';
    if (priority === 'urgent') return 'حالة عاجلة';
    return 'حالة عادية';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading">إدارة الطابور</h1>
          <p className="text-muted-foreground">المرضى في صالة الانتظار ({filteredQueue.length})</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="بحث في الطابور..." 
            className="pr-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12 text-muted-foreground">جاري تحميل الطابور...</div>
      ) : filteredQueue.length === 0 ? (
        <div className="text-center p-12 bg-muted/20 rounded-xl border border-dashed">
          <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium">الطابور فارغ</h3>
          <p className="text-muted-foreground">لا يوجد مرضى في صالة الانتظار حالياً.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredQueue.map((entry) => (
            <Card key={entry.id} className={`overflow-hidden border-t-4 ${entry.priority === 'critical' ? 'border-t-destructive' : entry.priority === 'urgent' ? 'border-t-warning' : 'border-t-primary'}`}>
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <Badge variant="outline" className={getPriorityColor(entry.priority)}>
                    {getPriorityLabel(entry.priority)}
                  </Badge>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(entry.addedAt), { addSuffix: true, locale: arEG })}
                  </div>
                </div>

                <div className="space-y-1 mb-4">
                  <h3 className="font-bold text-lg">{entry.patient?.name}</h3>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span dir="ltr">{entry.patient?.mobile}</span>
                    <span>{entry.patient?.age} سنة</span>
                  </div>
                </div>

                {(entry.patient?.allergies || entry.patient?.chronicDiseases) && (
                  <Alert variant="destructive" className="mb-4 py-2 px-3">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle className="text-xs font-bold mb-1">تنبيه طبي</AlertTitle>
                    <AlertDescription className="text-xs">
                      {entry.patient?.allergies && <div>حساسية: {entry.patient.allergies}</div>}
                      {entry.patient?.chronicDiseases && <div>أمراض: {entry.patient.chronicDiseases}</div>}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    className="flex-1 text-destructive hover:bg-destructive hover:text-white"
                    onClick={() => handleUpdateStatus(entry.id, 'cancelled')}
                    disabled={updateQueueEntry.isPending}
                  >
                    <XCircle className="ml-2 h-4 w-4" />
                    إلغاء
                  </Button>
                  <Button 
                    className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                    onClick={() => handleUpdateStatus(entry.id, 'done')}
                    disabled={updateQueueEntry.isPending}
                  >
                    <CheckCircle2 className="ml-2 h-4 w-4" />
                    تم الكشف
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
