// src/pages/MapPage.js
import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';

const MapPage = () => {
  return (
    <div>
      <h1>Map</h1>
      <MapContainer center={[47.663399, -122.313911]} zoom={15} style={{ height: "400px", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </div>
  );
};

export default MapPage;
