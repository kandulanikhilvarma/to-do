import { Landing } from "@/components/landing";
import { SiteFooter, SiteHeader } from "@/components/site";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <div id="main">
        <Landing />
      </div>
      <SiteFooter />
    </>
  );
}
