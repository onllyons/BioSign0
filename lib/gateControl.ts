let suppressUntil = 0;

export function suppressNextGatePrompt(ms = 2000) {
  suppressUntil = Date.now() + ms;
}

export function shouldSuppressGate() {
  return Date.now() < suppressUntil;
}
