import type { Metadata } from "next";
import { ResponderConsole } from "@/components/console";

export const metadata: Metadata = {
  title: "Responder console",
  description:
    "Live view of active SOS events, responder acknowledgements and incident timelines.",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return <ResponderConsole />;
}
