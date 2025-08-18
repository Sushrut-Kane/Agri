import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';

// ✅ Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

// Fix for marker icon issue in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
  coords: {
    lat: number;
    lng: number;
  };
}

function MapComponent({ coords }: MapProps) {
  return (
    <MapContainer
      center={[coords.lat, coords.lng]}
      zoom={13}
      style={{ height: '400px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={[coords.lat, coords.lng]} />
    </MapContainer>
  );
}

export default MapComponent;
