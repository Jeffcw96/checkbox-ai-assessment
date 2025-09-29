import Dashboard from "@/components/dashboard";
import Report from "@/components/report";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";

export default function Home() {
  return (
    <Tabs defaultValue="dashboard" className="w-full">
      <TabsList className="mb-2 px-2 py-2">
        {/* Add underline class when it's active */}
        <TabsTrigger
          value="dashboard"
          className="mr-6 outline-none data-[state=active]:underline hover:cursor-pointer"
        >
          Dashboard
        </TabsTrigger>
        <TabsTrigger
          value="report"
          className="mr-6 outline-none data-[state=active]:underline hover:cursor-pointer"
        >
          Report
        </TabsTrigger>
      </TabsList>
      <TabsContent value="dashboard">
        <Dashboard />
      </TabsContent>
      <TabsContent value="report">
        <Report />
      </TabsContent>
    </Tabs>
  );
}
