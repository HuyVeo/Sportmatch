"use client";

import "leaflet/dist/leaflet.css";

import { useEffect } from "react";
import { divIcon } from "leaflet";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import type { LatLng } from "@/lib/geo";

export type CourtPin = { id: string; lat: number; lng: number; name: string };

function pinIcon(selected: boolean) {
  const [width, height] = selected ? [36, 48] : [28, 38];
  const color = selected ? "#ea580c" : "#f97316";
  return divIcon({
    className: "",
    html: `<svg width="${width}" height="${height}" viewBox="0 0 28 38" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 2px 3px rgba(0,0,0,.35))"><path d="M14 0C6.27 0 0 6.27 0 14c0 9.8 12.36 22.68 12.89 23.23a1.54 1.54 0 0 0 2.22 0C15.64 36.68 28 23.8 28 14 28 6.27 21.73 0 14 0z" fill="${color}"/><circle cx="14" cy="14" r="5.2" fill="#fff" fill-opacity="0.92"/></svg>`,
    iconSize: [width, height],
    iconAnchor: [width / 2, height],
  });
}

const COURT_ICON = pinIcon(false);
const SELECTED_ICON = pinIcon(true);

// Chấm xanh ngọc có vòng sóng lan ra — "Vị trí của tôi".
const ME_ICON = divIcon({
  className: "",
  html: `<span style="position:relative;display:flex;width:20px;height:20px;align-items:center;justify-content:center"><span class="animate-ping" style="position:absolute;inset:0;border-radius:9999px;background:rgba(45,212,191,.6)"></span><span style="position:relative;width:16px;height:16px;border-radius:9999px;background:#2dd4bf;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)"></span></span>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

/** Di chuyển camera mỗi khi `focus` đổi (chọn sân, định vị...). */
function CameraFocus({ focus }: { focus: (LatLng & { key: number }) | null }) {
  const map = useMap();

  useEffect(() => {
    if (!focus) return;
    map.flyTo([focus.lat, focus.lng], Math.max(map.getZoom(), 14), {
      duration: 0.6,
    });
  }, [map, focus]);

  return null;
}

function CenterTracker({ onChange }: { onChange: (center: LatLng) => void }) {
  useMapEvents({
    moveend(event) {
      const center = event.target.getCenter();
      onChange({ lat: center.lat, lng: center.lng });
    },
  });
  return null;
}

export default function CourtsMap({
  courts,
  selectedId,
  me,
  initialCenter,
  focus,
  onSelect,
  onCenterChange,
}: {
  courts: CourtPin[];
  selectedId: string | null;
  me: LatLng | null;
  initialCenter: LatLng;
  focus: (LatLng & { key: number }) | null;
  onSelect: (id: string) => void;
  onCenterChange: (center: LatLng) => void;
}) {
  return (
    <MapContainer
      center={[initialCenter.lat, initialCenter.lng]}
      zoom={13}
      scrollWheelZoom
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <CameraFocus focus={focus} />
      <CenterTracker onChange={onCenterChange} />

      {courts.map((court) => {
        const selected = court.id === selectedId;
        return (
          <Marker
            key={court.id}
            position={[court.lat, court.lng]}
            icon={selected ? SELECTED_ICON : COURT_ICON}
            title={court.name}
            zIndexOffset={selected ? 1000 : 0}
            eventHandlers={{ click: () => onSelect(court.id) }}
          />
        );
      })}

      {me ? (
        <Marker
          position={[me.lat, me.lng]}
          icon={ME_ICON}
          title="Vị trí của tôi"
          zIndexOffset={2000}
          interactive={false}
        />
      ) : null}
    </MapContainer>
  );
}
