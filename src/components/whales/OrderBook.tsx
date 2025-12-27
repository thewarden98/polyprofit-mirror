import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderBookEntry {
  price: string;
  size: string;
}

interface OrderBookData {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  market?: string;
  asset_id?: string;
  timestamp?: string;
}

interface OrderBookProps {
  tokenId: string | undefined;
  className?: string;
}

export const OrderBook = React.forwardRef<HTMLDivElement, OrderBookProps>(
  ({ tokenId, className }, ref) => {
    const { data: orderBook, isLoading, error } = useQuery({
      queryKey: ["orderbook", tokenId],
      queryFn: async (): Promise<OrderBookData | null> => {
        if (!tokenId) return null;

        const { data, error } = await supabase.functions.invoke("polymarket-proxy", {
          body: { endpoint: "orderbook", tokenId },
        });

        if (error) throw error;
        if ((data as any)?.error) throw new Error((data as any).error);

        return data as OrderBookData;
      },
      enabled: !!tokenId,
      staleTime: 10 * 1000,
      refetchInterval: 15 * 1000,
    });

    if (!tokenId) {
      return (
        <div ref={ref} className={cn("text-center text-sm text-muted-foreground py-4", className)}>
          No order book available for this market
        </div>
      );
    }

    if (isLoading) {
      return (
        <div ref={ref} className={cn("flex items-center justify-center py-8", className)}>
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Loading order book...</span>
        </div>
      );
    }

    if (error || !orderBook) {
      return (
        <div ref={ref} className={cn("text-center text-sm text-muted-foreground py-4", className)}>
          Unable to load order book data
        </div>
      );
    }

    const bids = orderBook.bids?.slice(0, 8) || [];
    const asks = orderBook.asks?.slice(0, 8) || [];

    const allSizes = [...bids, ...asks].map((o) => parseFloat(o.size) || 0);
    const maxSize = Math.max(...allSizes, 1);

    return (
      <div ref={ref} className={cn("space-y-3", className)}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-medium text-success mb-2 flex items-center justify-between">
              <span>Bids (Buy)</span>
              <span className="text-muted-foreground">Size</span>
            </div>
            <div className="space-y-1">
              {bids.length === 0 ? (
                <div className="text-xs text-muted-foreground text-center py-2">No bids</div>
              ) : (
                bids.map((bid, idx) => {
                  const price = (parseFloat(bid.price) || 0) * 100;
                  const size = parseFloat(bid.size) || 0;
                  const widthPercent = (size / maxSize) * 100;

                  return (
                    <div key={idx} className="relative h-6 flex items-center">
                      <div
                        className="absolute left-0 top-0 h-full bg-success/20 rounded-sm"
                        style={{ width: `${widthPercent}%` }}
                      />
                      <div className="relative z-10 flex items-center justify-between w-full px-2 text-xs">
                        <span className="font-mono text-success">{price.toFixed(1)}¢</span>
                        <span className="text-muted-foreground">{size.toFixed(0)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-destructive mb-2 flex items-center justify-between">
              <span>Asks (Sell)</span>
              <span className="text-muted-foreground">Size</span>
            </div>
            <div className="space-y-1">
              {asks.length === 0 ? (
                <div className="text-xs text-muted-foreground text-center py-2">No asks</div>
              ) : (
                asks.map((ask, idx) => {
                  const price = (parseFloat(ask.price) || 0) * 100;
                  const size = parseFloat(ask.size) || 0;
                  const widthPercent = (size / maxSize) * 100;

                  return (
                    <div key={idx} className="relative h-6 flex items-center">
                      <div
                        className="absolute right-0 top-0 h-full bg-destructive/20 rounded-sm"
                        style={{ width: `${widthPercent}%` }}
                      />
                      <div className="relative z-10 flex items-center justify-between w-full px-2 text-xs">
                        <span className="font-mono text-destructive">{price.toFixed(1)}¢</span>
                        <span className="text-muted-foreground">{size.toFixed(0)} </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {bids.length > 0 && asks.length > 0 && (
          <div className="text-center text-xs text-muted-foreground pt-2 border-t border-border/50">
            Spread: {(((parseFloat(asks[0].price) || 0) - (parseFloat(bids[0].price) || 0)) * 100).toFixed(2)}¢
          </div>
        )}
      </div>
    );
  }
);
OrderBook.displayName = "OrderBook";
