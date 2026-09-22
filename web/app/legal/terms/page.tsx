import type { Metadata } from "next";
import { Clause, LegalPage } from "@/components/legal";

export const metadata: Metadata = {
  title: "Terms",
  description:
    "The terms covering Todu, including the limits of what the app can promise in an emergency.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms" updated="22 September 2026">
      <Clause heading="Todu is not an emergency service">
        <p>
          This is the clause that matters most. Todu helps you alert people and
          reach 112. It does not replace emergency services, and we do not
          operate a dispatch centre. In an emergency, call 112. If you cannot
          call, use every rung of the ladder the app offers.
        </p>
      </Clause>

      <Clause heading="Best effort delivery">
        <p>
          Alert delivery depends on your device, its operating system, your
          battery, your mobile network, and in the case of Bluetooth relay, on
          other Todu users being physically nearby. We cannot guarantee that
          any specific alert reaches any specific person at any specific time.
          Manufacturer battery restrictions can stop background services
          without notice.
        </p>
      </Clause>

      <Clause heading="Your responsibilities">
        <p>
          Keep your circle and medical profile current, complete the setup
          wizard for your phone, and run the drill so the app is familiar
          before you need it. Do not use Todu to harass anyone, to track a
          person without their knowledge, or to send false alerts to emergency
          services.
        </p>
      </Clause>

      <Clause heading="The free tier stays free">
        <p>
          The SOS path, meaning trigger, location broadcast to your circle,
          contact alerts, 112 dialling and the beacon, is free and will remain
          free. Paid plans cover convenience and depth only. We will not move
          an existing safety feature behind a paywall.
        </p>
      </Clause>

      <Clause heading="Liability">
        <p>
          Todu is provided as is, without warranty. To the extent permitted by
          law we are not liable for harm arising from a failure to deliver an
          alert, from a delayed or absent response, or from reliance on the app
          in place of contacting emergency services. Nothing here limits
          liability that cannot lawfully be limited.
        </p>
      </Clause>

      <Clause heading="Changes">
        <p>
          We will publish material changes before they take effect. Continued
          use after that date means you accept the revised terms.
        </p>
      </Clause>
    </LegalPage>
  );
}
