import type { Metadata } from "next";
import { Clause, LegalPage } from "@/components/legal";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What Todu collects, why, how long it is kept, and the rights you hold under the DPDP Act and GDPR.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy" updated="22 September 2026">
      <Clause heading="The short version">
        <p>
          Todu holds location, emergency contact and optional medical data.
          Continuous location is collected only while an SOS event is active or
          while you have deliberately started a timed share. Outside those
          windows we are not tracking you.
        </p>
      </Clause>

      <Clause heading="What we collect">
        <p>
          Account: phone number and display name. Circle: the contacts you add
          and their relationship label. Event data: location pings, device
          battery, which delivery route was used, and responder
          acknowledgements. Optional medical profile: blood group, allergies
          and medications, supplied by you.
        </p>
      </Clause>

      <Clause heading="Why we collect it">
        <p>
          Each field exists to get help to you faster. Battery level tells a
          responder how long your phone will keep reporting. Blood group and
          allergies exist so a first responder is not guessing. We do not
          collect data for advertising, and we do not sell or share it with
          data brokers.
        </p>
      </Clause>

      <Clause heading="Retention">
        <p>
          Event records and location trails are retained for the period shown
          in your plan, then deleted. Medical profile data persists until you
          change or remove it. Deleting your account removes your profile,
          circle and event history.
        </p>
      </Clause>

      <Clause heading="Your rights">
        <p>
          Under the Digital Personal Data Protection Act 2023 and, where it
          applies, the GDPR, you can access your data, correct it, export it
          and have it erased. Consent for each sensitive permission is asked
          separately and can be withdrawn. Users under 18 require verifiable
          parental consent.
        </p>
      </Clause>

      <Clause id="security" heading="Security and breach reporting">
        <p>
          Data is encrypted in transit and at rest, and row level security
          restricts every record to its owner and that owner approved
          connections. If a breach affects you we will notify you and the Data
          Protection Board, and report qualifying cyber incidents to CERT-In
          within the required window. Report a vulnerability through the
          security policy in our public repository.
        </p>
      </Clause>
    </LegalPage>
  );
}
