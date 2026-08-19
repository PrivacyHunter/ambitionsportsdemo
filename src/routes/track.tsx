import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useState } from "react";
import { getOrderStatus } from "@/lib/quotes.functions";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Clock } from "lucide-react";

export const Route = createFileRoute("/track")({
  component: Track,
});

function Track() {
  const getStatus = useServerFn(getOrderStatus);
  const [orderId, setOrderId] = useState("");
  const [result, setResult] = useState<any>(null);

  const handleTrack = async () => {
    const res = await getStatus({ data: { orderId } });
    setResult(res);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <Navbar />
      <main className="py-24 px-4 max-w-2xl mx-auto text-center">
        <h1 className="text-5xl font-black uppercase italic mb-12">Order Tracker</h1>
        <div className="flex gap-4 mb-12">
          <input value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="Enter Order ID" className="flex-1 p-4 bg-white/5 rounded-xl border border-white/10" />
          <button onClick={handleTrack} className="bg-neon-cyan px-8 py-4 rounded-xl text-background font-black uppercase">Track</button>
        </div>
        {result && (
          <div className="bg-card p-10 rounded-3xl border border-white/10 text-left">
            <h3 className="text-neon-cyan font-bold mb-4">Status: <span className="uppercase text-white">{result.status}</span></h3>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-neon-lime w-1/2" />
            </div>
            <p className="mt-6 text-sm text-muted-foreground">Est. Delivery: {result.estimatedDelivery}</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
