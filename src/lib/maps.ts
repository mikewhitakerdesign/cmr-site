/**
 * Outbound map links for hill pages ("Get directions", "View map"; Figma Hill
 * Details 1:6587). Plain links to Google Maps' documented URL scheme
 * (https://developers.google.com/maps/documentation/urls/get-started): no API
 * key, no script, no embed, nothing sent from CMR. The same mechanism the IA
 * set for run-detail directions (decision 5: a static map-service link, no
 * Maps API integration). The query names the park or landmark — never a
 * meeting point or parking spot, which CMR has not confirmed.
 */
const BASE = "https://www.google.com/maps";

export function directionsUrl(query: string): string {
  return `${BASE}/dir/?api=1&destination=${encodeURIComponent(query)}`;
}

export function mapUrl(query: string): string {
  return `${BASE}/search/?api=1&query=${encodeURIComponent(query)}`;
}
