// PIN rules for the countdown. Pure so they can be tested without a device.
//
// A duress PIN only works when a cancel PIN exists: without a cancel PIN the
// Cancel button stands down on its own and there is no PIN pad to type into.
// Equal PINs would make the machine treat every cancel as duress.

export type PinError = "format" | "duressNeedsCancel" | "same";

const PIN = /^\d{4,6}$/;

export function validatePins(cancelPin: string, duressPin: string): PinError | null {
  if (cancelPin !== "" && !PIN.test(cancelPin)) return "format";
  if (duressPin !== "" && !PIN.test(duressPin)) return "format";
  if (duressPin !== "" && cancelPin === "") return "duressNeedsCancel";
  if (duressPin !== "" && duressPin === cancelPin) return "same";
  return null;
}
