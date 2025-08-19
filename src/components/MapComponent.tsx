import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// 1) bring in Leaflet's CSS *here*, locally
import "leaflet/dist/leaflet.css";

// 2) fix default marker icons the modern ES way (no require)
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

type Props = {
  coords: { lat: number; lng: number };
  height?: string; // tailwind height class (e.g., "h-64", "h-[500px]")
};

const MapComponent: React.FC<Props> = ({ coords, height = "h-64" }) => {
  return (
    // parent container must have a height
    <div className={`${height} w-full`}>
      <MapContainer
        center={[coords.lat, coords.lng]}
        zoom={13}
        className="h-full w-full rounded-lg"
        scrollWheelZoom
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        />
        <Marker position={[coords.lat, coords.lng]}>
          <Popup>
            Lat: {coords.lat}, Lng: {coords.lng}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapComponent;
