// src/lib/tracking.ts
// ── FleetXchange Tracking API Integration ─────────────────────────────────────
//
// This file is the single integration point for your tracking company's API.
// When you're ready to connect, implement fetchLiveTracking() below.
//
// The TrackingLink model in schema.prisma already has commented fields for:
//   - externalTrackingId  (the shipment ID in your tracking system)
//   - lastGpsLat / lastGpsLng  (GPS coordinates)
//   - lastGpsUpdated  (when GPS was last polled)
//
// Steps to activate:
//   1. Add your API credentials to .env  (TRACKING_API_KEY, TRACKING_API_URL)
//   2. Uncomment the GPS fields in prisma/schema.prisma
//   3. Run: npx prisma db push
//   4. Implement fetchLiveTracking() below
//   5. Call it from src/app/track/[token]/page.tsx
//
// ──────────────────────────────────────────────────────────────────────────────

export interface LiveTrackingData {
  lat:          number
  lng:          number
  speed?:       number
  heading?:     number
  lastUpdated:  string
  statusText?:  string
  location?:    string
}

/**
 * Fetch live GPS data from your tracking company's API.
 * Replace the stub below with your actual API call.
 */
export async function fetchLiveTracking(
  externalTrackingId: string
): Promise<LiveTrackingData | null> {
  // ── STUB: Replace with your real API call ──
  //
  // const res = await fetch(
  //   `${process.env.TRACKING_API_URL}/shipment/${externalTrackingId}`,
  //   { headers: { Authorization: `Bearer ${process.env.TRACKING_API_KEY}` },
  //     next: { revalidate: 30 } }   // cache 30s
  // )
  // if (!res.ok) return null
  // const data = await res.json()
  // return {
  //   lat:         data.latitude,
  //   lng:         data.longitude,
  //   speed:       data.speed_kmh,
  //   heading:     data.bearing,
  //   lastUpdated: data.timestamp,
  //   statusText:  data.status_description,
  //   location:    data.last_known_location,
  // }
  //
  // ──────────────────────────────────────────

  return null  // Returns null until API is connected — UI shows placeholder
}
