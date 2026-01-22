"use client";

import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { 
  History, 
  TrendingUp, 
  Edit, 
  Trash2,
  AlertCircle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MerchandiseProduct } from "../types";
import { cn } from "@/lib/utils";
import { SafeImage } from "@/components/ui/image";
import { DynamicIcon } from "@/lib/icon-utils";

interface MerchandiseViewDialogContentProps {
  readonly isLoading: boolean;
  readonly hasError: boolean;
  readonly product: MerchandiseProduct | undefined;
  readonly onClose: () => void;
  readonly onEdit: (productId: string) => void;
  readonly onDelete: (productId: string) => void;
}

export function MerchandiseViewDialogContent({
  isLoading,
  hasError,
  product,
  onClose,
  onEdit,
  onDelete,
}: MerchandiseViewDialogContentProps) {
  const t = useTranslations("merchandise");

  if (hasError || !product) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4 h-full">
        <div className="p-4 bg-destructive/10 rounded-full">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <div className="text-center">
          <h3 className="font-medium text-lg">{t("errors.notFound")}</h3>
          <p className="text-muted-foreground text-sm">
            {t("errors.notFoundDesc")}
          </p>
        </div>
        <Button variant="outline" onClick={onClose}>
          {t("actions.close")}
        </Button>
      </div>
    );
  }

  // Use real data or empty array
  const salesHistory = product.purchaseHistory?.map(h => ({
    date: format(new Date(h.date), "MMM dd"),
    sales: h.quantity,
    stock: 0 
  })) ?? [];

  // Use real item history or empty array
  const itemHistory = product.itemHistory ?? [];

  return (
    <div className="space-y-6 pb-6 container mx-auto p-4">
      {/* Header with Title and Actions */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground tracking-tight">{product.name}</h2>
          <p className="text-sm text-muted-foreground mt-1">{product.description || t("description")}</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" onClick={() => { onClose(); onEdit(product.id); }}>
             <Edit className="h-4 w-4 mr-2" />
             {t("actions.edit")}
           </Button>
           <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => { onClose(); onDelete(product.id); }}>
             <Trash2 className="h-4 w-4 mr-2" />
             {t("actions.delete")}
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Image & Key Info */}
        <div className="col-span-1 space-y-6">
           {/* Product Image - Square/Aspect */}
           <div className="aspect-square w-full relative rounded-2xl overflow-hidden border bg-muted/20">
              {product.imageUrl ? (
                <SafeImage
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground/30">
                  <DynamicIcon name={product.iconName ?? "Package"} className="h-24 w-24" />
                </div>
              )}
           </div>

           {/* Quick Detailed Stats */}
             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border bg-card">
                   <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t("stats.currentStock")}</p>
                   <div className="mt-2 text-2xl font-bold">{product.stock}</div>
                   <Badge variant={product.stockStatus === "low" ? "destructive" : "secondary"} className="mt-1 text-[10px] h-5">
                      {product.stockStatus === "low" ? t("stats.lowStock") : t("stats.inStock")}
                   </Badge>
                </div>
                <div className="p-4 rounded-2xl border bg-card">
                   <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t("stats.price")}</p>
                   <div className="mt-2 text-2xl font-bold">{product.priceFormatted}</div>
                   <p className="text-[10px] text-muted-foreground mt-1">{t("stats.perUnit")}</p>
                </div>
             </div>
        </div>

        {/* Right Column: Analytics & History */}
        <div className="col-span-1 md:col-span-2 space-y-6">
           {/* Chart Section */}
           <Card className="shadow-sm border rounded-3xl overflow-hidden">
             <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                   <TrendingUp className="h-4 w-4" />
                   {t("sales.title")}
                </CardTitle>
             </CardHeader>
             <CardContent className="p-0">
               {salesHistory.length > 0 ? (
                 <div className="h-[250px] w-full pt-4 pr-1">
                   <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={salesHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                       <defs>
                         <linearGradient id="minimalSales" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                           <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                         </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.5} />
                       <XAxis 
                         dataKey="date" 
                         axisLine={false} 
                         tickLine={false} 
                         tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} 
                         dy={10}
                       />
                       <Tooltip 
                         contentStyle={{ 
                           backgroundColor: "hsl(var(--popover))", 
                           border: "1px solid hsl(var(--border))", 
                           borderRadius: "8px",
                           boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                         }}
                         cursor={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1, strokeDasharray: "3 3" }}
                       />
                       <Area 
                         type="monotone" 
                         dataKey="sales" 
                         stroke="hsl(var(--primary))" 
                         strokeWidth={2} 
                         fill="url(#minimalSales)" 
                       />
                     </AreaChart>
                   </ResponsiveContainer>
                 </div>
               ) : (
                 <div className="h-[250px] flex flex-col items-center justify-center text-muted-foreground">
                   <TrendingUp className="h-8 w-8 mb-2 opacity-20" />
                   <p className="text-sm">{t("sales.noData")}</p>
                 </div>
               )}
             </CardContent>
           </Card>

           {/* History Table */}
           <Card className="shadow-sm border rounded-3xl overflow-hidden flex flex-col h-[300px]">
             <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                   <History className="h-4 w-4" />
                   {t("history.title")}
                </CardTitle>
             </CardHeader>
             <CardContent className="p-0 flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  {itemHistory.length > 0 ? (
                    <Table>
                      <TableBody>
                        {itemHistory.map((item) => (
                          <TableRow key={item.id} className="hover:bg-muted/10 border-border/50">
                            <TableCell className="py-3 pl-6 font-medium text-xs">
                               {format(new Date(item.date), "MMM dd, yyyy")}
                               <div className="text-[10px] text-muted-foreground font-normal mt-0.5">
                                 {t("history.performedBy")} {item.performed_by}
                               </div>
                            </TableCell>
                            <TableCell className="py-3 text-center">
                               <Badge variant="outline" className="text-[10px] h-5 bg-transparent font-normal opacity-80">
                                 {item.type}
                               </Badge>
                            </TableCell>
                            <TableCell className="py-3 pr-6 text-right font-medium text-sm">
                              <span className={item.type === "restock" ? "text-green-600" : ""}>
                                 {item.type === "restock" ? "+" : ""}{item.change_amount}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-6">
                      <History className="h-8 w-8 mb-2 opacity-20" />
                      <p className="text-sm">{t("history.noActivity")}</p>
                    </div>
                  )}
                </ScrollArea>
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
