import { useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { usePatientSearch } from "@/hooks/usePatientData";

export default function PatientSearchPage() {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState("");
  const { data: results, isFetching } = usePatientSearch(submitted);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(input);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">بحث عن مريض</h1>
        <p className="text-sm text-muted-foreground">ابحث بالاسم أو رقم الموبايل لعرض ملف المريض</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="ps-9"
                placeholder="اسم المريض أو رقم الموبايل"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={isFetching}>
              {isFetching ? "جارٍ البحث..." : "بحث"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {submitted && (
        <>
          {results && results.length > 0 ? (
            <div className="flex flex-col gap-2">
              {results.map((p) => (
                <Link key={p.id} to={`/patients/${p.id}`}>
                  <Card className="transition-colors hover:border-primary">
                    <CardContent className="flex items-center gap-3 p-4">
                      <Avatar>
                        <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.mobile}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title="لا يوجد مرضى مطابقين" description={`لم يتم العثور على نتائج لـ "${submitted}"`} />
          )}
        </>
      )}
    </div>
  );
}
