import { Marker, Popup, TileLayer, CircleMarker } from "react-leaflet";
import L from "leaflet";
import {
  Ambulance,
  Building2,
  FlaskConical,
  Hospital,
  LocateFixed,
  Pill,
  Stethoscope,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { SafeMapContainer } from "@/components/maps/safe-map";
import { Button, buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import {
  AHMEDABAD_CARE_SITES,
  careKindLabel,
  carePinColor,
  rankCareSites,
  type CareNeedFilter,
  type CareSite,
} from "@/data/ahmedabad-care-sites";
import { useAppLocale } from "@/i18n/locale-context";
import { cn } from "@/lib/utils";

function makePinIcon(color: string) {
  const svg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="48" viewBox="0 0 36 48">
      <defs>
        <filter id="s" x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.35"/>
        </filter>
      </defs>
      <path filter="url(#s)" fill="${color}" d="M18 1C9.7 1 3 7.7 3 16c0 11.2 15 30 15 30s15-18.8 15-30C33 7.7 26.3 1 18 1z"/>
      <circle cx="18" cy="16" r="6.5" fill="white"/>
      <circle cx="18" cy="16" r="3.2" fill="${color}"/>
    </svg>
  `);
  return L.icon({
    iconUrl: `data:image/svg+xml,${svg}`,
    iconSize: [36, 48],
    iconAnchor: [18, 46],
    popupAnchor: [0, -40],
  });
}

const NEEDS: { id: CareNeedFilter; label: string; icon: typeof Hospital }[] = [
  { id: "all", label: "All help", icon: Building2 },
  { id: "phc", label: "Health Centre", icon: Stethoscope },
  { id: "hospital", label: "Hospital", icon: Hospital },
  { id: "pharmacy", label: "Pharmacy", icon: Pill },
  { id: "lab", label: "Lab", icon: FlaskConical },
  { id: "emergency", label: "Emergency", icon: Ambulance },
];

export function HospitalMapPage() {
  const { user } = useAuth();
  const { t } = useAppLocale();
  const [filter, setFilter] = useState<CareNeedFilter>("all");
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const defaultCenter: [number, number] = [23.0225, 72.5714];
  const center = userPos || defaultCenter;

  const locateMe = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported on this device");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude]);
        toast.success("Location updated — nearest care ranked for you");
      },
      () => toast.error("Unable to read location. Allow location access."),
      { enableHighAccuracy: true, timeout: 12_000 },
    );
  };

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      () => undefined,
      { maximumAge: 60_000, timeout: 8000 },
    );
  }, []);

  const sites = useMemo(
    () => rankCareSites(AHMEDABAD_CARE_SITES, userPos, filter),
    [filter, userPos],
  );

  const icons = useMemo(() => {
    const map = new Map<string, L.Icon>();
    for (const h of AHMEDABAD_CARE_SITES) {
      map.set(h.id, makePinIcon(carePinColor(h)));
    }
    return map;
  }, []);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5 pb-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Nearest care
          </p>
          <h1 className="font-display text-3xl font-semibold">
            Where can I get help?
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            PHC and CHC first, then government and district hospitals — not only
            the nearest private hospital. Open/closed uses today&apos;s hours.
          </p>
        </div>
        {user?.role === "patient" ? (
          <Link
            to="/government/pmjay"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            {t("pmjay_assistant")}
          </Link>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {NEEDS.map((need) => (
          <button
            key={need.id}
            type="button"
            onClick={() => setFilter(need.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
              filter === need.id
                ? "bg-[#2563EB] text-white shadow-sm"
                : "border border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            <need.icon className="h-3.5 w-3.5" />
            {need.label}
          </button>
        ))}
        <Button type="button" size="sm" variant="outline" onClick={locateMe}>
          <LocateFixed className="mr-1.5 h-4 w-4" />
          Use my location
        </Button>
        {userPos ? (
          <span className="text-xs text-muted-foreground">
            Ranked from your location · {sites.length} places
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">
            {sites.length} places in Ahmedabad
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-3 text-[11px] font-medium text-muted-foreground">
        <Legend color="#0F766E" label="PHC / CHC" />
        <Legend color="#2563EB" label="Government / district" />
        <Legend color="#7C3AED" label="Pharmacy" />
        <Legend color="#CA8A04" label="Lab" />
        <Legend color="#EF4444" label={t("emergency")} />
      </div>

      <div className="map-shell h-[440px] overflow-hidden rounded-3xl border border-border shadow-soft">
        <SafeMapContainer
          center={center}
          zoom={11}
          scrollWheelZoom={false}
          className="h-full w-full rounded-3xl"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {userPos ? (
            <CircleMarker
              center={userPos}
              radius={9}
              pathOptions={{
                color: "#0F766E",
                fillColor: "#14B8A6",
                fillOpacity: 0.9,
              }}
            >
              <Popup>You are here</Popup>
            </CircleMarker>
          ) : null}
          {sites.map((h) => (
            <Marker
              key={h.id}
              position={[h.latitude, h.longitude]}
              icon={icons.get(h.id)!}
            >
              <Popup>
                <strong>{h.name}</strong>
                <br />
                {careKindLabel(h.care_kind)}
                <br />
                {h.address}
                {h.distance_km != null ? (
                  <>
                    <br />
                    {h.distance_km.toFixed(1)} km
                  </>
                ) : null}
                <br />
                {h.open_now ? "Open now" : "Closed now"} · {h.hours}
                <br />
                <a href={`tel:${h.phone}`}>{h.phone}</a>
              </Popup>
            </Marker>
          ))}
        </SafeMapContainer>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sites.map((h) => (
          <CareCard key={h.id} site={h} />
        ))}
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}

function CareCard({
  site,
}: {
  site: CareSite & { distance_km: number | null; open_now: boolean };
}) {
  const { t } = useAppLocale();
  const color = carePinColor(site);

  return (
    <article className="flex flex-col rounded-3xl border border-border/80 bg-card p-4 shadow-soft">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {careKindLabel(site.care_kind)}
          </p>
          <p className="font-semibold leading-snug text-foreground">{site.name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {site.area || site.address}
          </p>
        </div>
        <span
          className="mt-0.5 h-3 w-3 shrink-0 rounded-full ring-2 ring-white"
          style={{ background: color }}
          aria-hidden
        />
      </div>

      <div className="mt-2 flex flex-wrap gap-2 text-xs">
        {site.distance_km != null ? (
          <span className="font-medium text-teal-700">
            {site.distance_km.toFixed(1)} km
          </span>
        ) : null}
        <span
          className={
            site.open_now
              ? "font-medium text-emerald-700"
              : "font-medium text-rose-700"
          }
        >
          {site.open_now ? "Open" : "Closed"} · {site.hours}
        </span>
      </div>

      {site.services?.length ? (
        <p className="mt-2 text-xs text-muted-foreground">
          {site.services.slice(0, 4).join(" · ")}
        </p>
      ) : null}

      <div className="mt-auto flex gap-2 pt-4">
        <a
          href={`tel:${site.phone}`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex-1")}
        >
          {t("call")}
        </a>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${site.latitude},${site.longitude}`}
          target="_blank"
          rel="noreferrer"
          className={cn(buttonVariants({ size: "sm" }), "flex-1")}
        >
          {t("open_maps")}
        </a>
      </div>
    </article>
  );
}
