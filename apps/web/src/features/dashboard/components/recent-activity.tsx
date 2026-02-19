import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BuyerSummary } from "../types/dashboard";
import { Skeleton } from "@/components/ui/skeleton";

interface RecentActivityProps {
  buyers?: BuyerSummary[];
  isLoading: boolean;
}

export function RecentActivity({ buyers, isLoading }: RecentActivityProps) {
  if (isLoading) {
    return <Skeleton className="h-[400px] w-full rounded-xl" />;
  }

  return (
    <Card className="col-span-1 md:col-span-3 h-full flex flex-col">
      <CardHeader>
        <CardTitle>Recent Sales</CardTitle>
        <CardDescription>
          Latest transactions from buyers.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="h-full">
          {(buyers ?? []).length === 0 ? (
             <div className="flex h-full flex-col items-center justify-center text-center min-h-[200px]">
               <p className="text-sm text-muted-foreground">No recent activity.</p>
             </div>
          ) : (
            <div className="space-y-8">
            {(buyers ?? []).map((buyer) => (
            <div key={buyer.user_id} className="flex items-center">
              <Avatar className="h-9 w-9">
                <AvatarFallback>{buyer.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">{buyer.name}</p>
                <p className="text-sm text-muted-foreground">{buyer.email}</p>
              </div>
              <div className="ml-auto font-medium">
                {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                }).format(buyer.total_spent)}
              </div>
            </div>
          ))}
          </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
