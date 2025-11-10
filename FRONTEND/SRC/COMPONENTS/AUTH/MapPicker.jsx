// frontend/src/components/MapPicker.jsx
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix default marker icon paths for Vite + Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href
});

function ClickMarker({ latlng, setLatlng }) {
  useMapEvents({
    click(e) {
      setLatlng({ lat: e.latlng.lat, lng: e.latlng.lng });
    }
  });
  return <Marker position={[latlng.lat, latlng.lng]} />;
}

export default function MapPicker({ latlng, setLatlng }) {
  useEffect(()=>{}, [latlng]);
  return (
    <div style={{height:300, marginTop:8}}>
      <MapContainer center={[latlng.lat, latlng.lng]} zoom={13} style={{height:'100%'}}>
        <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ClickMarker latlng={latlng} setLatlng={setLatlng} />
      </MapContainer>
    </div>
  );
}
