import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/casual-wear")({
  component: CasualWear,
});

function CasualWear() {
  return <div className="p-20 text-center">Casual Wear Page Placeholder</div>;
}
