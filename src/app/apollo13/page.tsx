import type { Metadata } from "next";
import Apollo13Root from "@/components/Apollo13Root";

export const metadata: Metadata = {
  title: "Orpheus — Apollo 13 Accident Review",
  description:
    "The same 25 WebMCP tools and the same engine, pointed at the real public-domain Apollo 13 accident record: the Review Board report, the Mission Report, the voice loops and nine NASA photographs.",
};

export default function Page() {
  return <Apollo13Root />;
}
