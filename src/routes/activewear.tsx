import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/activewear")({
  component: Activewear,
});

function Activewear() {
  return <div className="p-20 text-center">Activewear Page Placeholder</div>;
}
