"use client";

import { useState } from "react";
import { CheckInHistory } from "@/features/checkin/components/CheckInHistory";
import type { CheckInFilters } from "@/features/checkin/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

export function CheckInsPageClient() {
  const [filters, setFilters] = useState<CheckInFilters>({
    page: 1,
    per_page: 20,
  });
  const [searchQRCode, setSearchQRCode] = useState("");

  const handleSearch = () => {
    // TODO: Implement search by QR code
    console.log("Search QR code:", searchQRCode);
  };

  const handleStatusFilter = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status: status as CheckInFilters["status"],
      page: 1,
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Check-in History</h1>
        <p className="text-muted-foreground mt-2">
          Lihat riwayat check-in yang telah dilakukan
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Search
          </CardTitle>
          <CardDescription>
            Filter dan cari check-in berdasarkan kriteria tertentu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search QR Code</Label>
              <div className="flex gap-2">
                <Input
                  id="search"
                  placeholder="Masukkan QR code..."
                  value={searchQRCode}
                  onChange={(e) => setSearchQRCode(e.target.value)}
                />
                <Button onClick={handleSearch} size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={filters.status ?? "all"}
                onValueChange={(value) =>
                  handleStatusFilter(value === "all" ? "" : value)
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="SUCCESS">Success</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="DUPLICATE">Duplicate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <CheckInHistory filters={filters} />
    </div>
  );
}
