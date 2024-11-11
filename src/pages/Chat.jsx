import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, LayersControl } from 'react-leaflet';

// Import leaflet CSS in your component
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const WorldMap = () => {
  const center = [20, -20];
  const zoom = 3;
  
  const cities = [
    { name: 'New York', coords: [40.7128, -74.0060] },
    { name: 'London', coords: [51.5074, -0.1278] },
    { name: 'Paris', coords: [48.8566, 2.3522] },
    { name: 'Tokyo', coords: [35.6762, 139.6503] },
  ];

  return (
    <div className="w-full h-screen relative">      
      <MapContainer 
        center={center} 
        zoom={zoom} 
        className="w-full h-full"
        zoomControl={false}
      >
        <LayersControl position="topright">
          {/* Base street map layer */}
          <LayersControl.BaseLayer checked name="Street Map">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
          </LayersControl.BaseLayer>

          {/* Satellite layer */}
          <LayersControl.BaseLayer name="Satellite">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              maxZoom={19}
            />
          </LayersControl.BaseLayer>

          {/* Terrain layer */}
          <LayersControl.BaseLayer name="Terrain">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              maxZoom={13}
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        <ZoomControl position="bottomright" />

        {cities.map((city) => (
          <Marker 
            key={city.name} 
            position={city.coords}
          >
            <Popup>
              <div className="text-sm font-medium">{city.name}</div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default WorldMap;