import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';

// This small block fixes a common issue with the marker icon in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow
});
L.Marker.prototype.options.icon = DefaultIcon;


// Define the type of data this component expects
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
      style={{ height: '400px', width: '100%' }} // <-- Height is essential!
    >
      {/* This adds the visual map tiles from a free provider */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* This places a pin at the exact coordinates */}
      <Marker position={[coords.lat, coords.lng]} />
    </MapContainer>
  );
}

export default MapComponent;