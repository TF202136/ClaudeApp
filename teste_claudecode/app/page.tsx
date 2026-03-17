import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Page() {
  return (
    <main className="p-10 flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Welcome to your app.</p>
          <Button className="mt-4">Get Started</Button>
        </CardContent>
      </Card>
    </main>
  );
}
