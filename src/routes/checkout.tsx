import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/checkout")({
  component: Checkout,
});

function Checkout() {
  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <Navbar />
      <main className="py-24 px-4 max-w-4xl mx-auto">
        <h1 className="text-5xl font-black uppercase italic mb-12 text-center">Checkout</h1>
        <div className="grid md:grid-cols-2 gap-12">
          <div className="bg-card p-8 rounded-3xl border border-white/10">
            <h2 className="text-2xl font-black mb-6">Payment Options</h2>
            <div className="space-y-4">
              {['Wire Transfer', 'Credit Card (Simulated)', 'PayPal (Simulated)'].map((p) => (
                <label key={p} className="block p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 border border-white/10">
                  <input type="radio" name="payment" className="mr-3" /> {p}
                </label>
              ))}
            </div>
          </div>
          <div className="bg-card p-8 rounded-3xl border border-white/10">
            <h2 className="text-2xl font-black mb-6">Order Summary</h2>
            <div className="space-y-4 text-muted-foreground">
               <p>Subtotal: $0.00</p>
               <p>Shipping: $0.00</p>
               <p className="text-white text-xl font-black pt-4 border-t border-white/10">Total: $0.00</p>
            </div>
            <button className="w-full mt-8 bg-neon-lime text-background py-5 font-black uppercase rounded-xl">Place Order</button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
