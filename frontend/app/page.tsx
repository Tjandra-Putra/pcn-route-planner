import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <>
      <h1 className="text-4xl font-bold">Welcome to the PCN Route Planner</h1>
      <p className="mt-4">Plan your route through Singapore park connectors with ease.</p>
      <Button variant="default" className="mt-4">
        Get Started
      </Button>
    </>
  );
}
