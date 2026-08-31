import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Plus } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { PatientQueueCard } from "@/components/shared/PatientQueueCard";
import { useQueue, useUpdateQueueStatus } from "@/hooks/useReceptionData";

export default function QueuePage() {
  const { data: queue, isLoading } = useQueue();
  const updateStatus = useUpdateQueueStatus();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!queue) return [];
    const waitingOnly = queue.filter((entry) => entry.status === "waiting");
    if (!search.trim()) return waitingOnly;
    const q = search.trim().toLowerCase();
    return waitingOnly.filter(
      (entry) => entry.patient.name.toLowerCase().includes(q) || entry.patient.mobile.includes(q)
    );
  }, [queue, search]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">قائمة الانتظار</h1>
        <Button asChild>
          <Link to="/reception/add-patient">
            <Plus className="h-4 w-4" />
            إضافة مريض
          </Link>
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="ps-9"
          placeholder="ابحث بالاسم أو رقم الموبايل"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          <div className="skeleton h-20" />
          <div className="skeleton h-20" />
          <div className="skeleton h-20" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filtered.map((entry) => (
            <PatientQueueCard
              key={entry.id}
              entry={entry}
              onDone={(id) => updateStatus.mutate({ entryId: id, status: "done" })}
              onCancel={(id) => updateStatus.mutate({ entryId: id, status: "cancelled" })}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="قائمة الانتظار فارغة"
          description="لسه مفيش مرضى في الانتظار. ضيف مريض جديد عشان يظهر هنا."
        />
      )}
    </div>
  );
} 