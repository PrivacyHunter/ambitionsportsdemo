import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sportswear")({
  component: Sportswear,
});

function Sportswear() {
  return <div className="p-20 text-center">Sportswear Page Placeholder</div>;
}
