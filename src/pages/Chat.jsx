import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, LayersControl, useMapEvents, useMap, Circle, Polygon, Polyline } from 'react-leaflet';
import { Ruler, Square, Circle as CircleIcon, Route, X } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
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

// Measurement modes
const MEASUREMENT_MODES = {
  NONE: 'none',
  DISTANCE: 'distance',
  AREA: 'area',
  RADIUS: 'radius',
  PATH: 'path'
};

// Component to track map events
const MapEvents = ({ onMapData, onMapClick }) => {
  const map = useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onMapData(prev => ({
        ...prev,
        lastClick: { lat: lat.toFixed(4), lng: lng.toFixed(4) }
      }));
      onMapClick(e);
    },
    zoom: (e) => {
      onMapData(prev => ({
        ...prev,
        zoomLevel: map.getZoom()
      }));
    },
    moveend: () => {
      const bounds = map.getBounds();
      onMapData(prev => ({
        ...prev,
        bounds: {
          north: bounds.getNorth().toFixed(4),
          south: bounds.getSouth().toFixed(4),
          east: bounds.getEast().toFixed(4),
          west: bounds.getWest().toFixed(4)
        }
      }));
    },
  });
  return null;
};

const WorldMap = () => {
  const [mapData, setMapData] = useState({
    lastClick: null,
    zoomLevel: 3,
    bounds: null,
    userLocation: null,
    measurements: {
      distance: null,
      area: null,
      radius: null,
      pathDistance: null,
      circleArea: null
    }
  });
  
  const [measurementMode, setMeasurementMode] = useState(MEASUREMENT_MODES.NONE);
  const [points, setPoints] = useState([]);
  const [radius, setRadius] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // Calculate distance between two points
  const calculateDistance = (point1, point2) => {
    return L.latLng(point1).distanceTo(L.latLng(point2)) / 1000; // in km
  };

  // Calculate area of a polygon using spherical excess formula
  const calculateArea = (points) => {
    if (points.length < 3) return 0;
    
    const closedPoints = [...points, points[0]];
    let area = 0;
    const R = 6371; // Earth's radius in kilometers
    
    for (let i = 0; i < closedPoints.length - 1; i++) {
      const p1 = closedPoints[i];
      const p2 = closedPoints[i + 1];
      
      const lat1 = p1[0] * Math.PI / 180;
      const lon1 = p1[1] * Math.PI / 180;
      const lat2 = p2[0] * Math.PI / 180;
      const lon2 = p2[1] * Math.PI / 180;
      
      area += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
    }
    
    area = Math.abs(area * R * R / 2);
    return area;
  };

  // Calculate path distance
  const calculatePathDistance = (points) => {
    let total = 0;
    for (let i = 1; i < points.length; i++) {
      total += calculateDistance(points[i - 1], points[i]);
    }
    return total;
  };

  // Handle map clicks
  const handleMapClick = (e) => {
    if (measurementMode === MEASUREMENT_MODES.NONE) return;
    setShowResults(true);

    const newPoint = [e.latlng.lat, e.latlng.lng];
    
    switch (measurementMode) {
      case MEASUREMENT_MODES.DISTANCE:
        if (points.length < 2) {
          setPoints(prev => [...prev, newPoint]);
          if (points.length === 1) {
            setMapData(prev => ({
              ...prev,
              measurements: {
                ...prev.measurements,
                distance: calculateDistance(points[0], newPoint)
              }
            }));
          }
        }
        break;

      case MEASUREMENT_MODES.AREA:
        setPoints(prev => [...prev, newPoint]);
        if (points.length >= 2) {
          setMapData(prev => ({
            ...prev,
            measurements: {
              ...prev.measurements,
              area: calculateArea([...points, newPoint])
            }
          }));
        }
        break;

      case MEASUREMENT_MODES.RADIUS:
        if (points.length === 0) {
          setPoints([newPoint]);
        } else if (points.length === 1) {
          const distance = calculateDistance(points[0], newPoint);
          const radiusInMeters = distance * 1000;
          setRadius(radiusInMeters);
          
          const areaInKm2 = Math.PI * Math.pow(distance, 2);
          
          setPoints(prev => [...prev, newPoint]);
          setMapData(prev => ({
            ...prev,
            measurements: {
              ...prev.measurements,
              radius: distance,
              circleArea: areaInKm2
            }
          }));
        }
        break;

      case MEASUREMENT_MODES.PATH:
        setPoints(prev => [...prev, newPoint]);
        if (points.length > 0) {
          setMapData(prev => ({
            ...prev,
            measurements: {
              ...prev.measurements,
              pathDistance: calculatePathDistance([...points, newPoint])
            }
          }));
        }
        break;
    }
  };

  // Reset measurements
  const resetMeasurement = () => {
    setPoints([]);
    setRadius(0);
    setMapData(prev => ({
      ...prev,
      measurements: {
        distance: null,
        area: null,
        radius: null,
        pathDistance: null,
        circleArea: null
      }
    }));
    setShowResults(false);
  };

  // Change measurement mode
  const changeMeasurementMode = (mode) => {
    if (mode === measurementMode) {
      setMeasurementMode(MEASUREMENT_MODES.NONE);
      resetMeasurement();
    } else {
      setMeasurementMode(mode);
      resetMeasurement();
    }
  };

  return (
    <div className="w-full h-screen relative">
      <MapContainer 
        center={[20, -20]} 
        zoom={3} 
        className="w-full h-full"
        zoomControl={false}
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Street Map">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        <ZoomControl position="bottomright" />
        <MapEvents onMapData={setMapData} onMapClick={handleMapClick} />

        {/* Measurement Visualizations */}
        {points.length > 0 && (
          <>
            {/* Markers for all points */}
            {points.map((point, idx) => (
              <Marker key={`point-${idx}`} position={point}>
                <Popup>Point {idx + 1}</Popup>
              </Marker>
            ))}

            {/* Distance line */}
            {measurementMode === MEASUREMENT_MODES.DISTANCE && points.length === 2 && (
              <Polyline positions={points} color="red" weight={3} />
            )}

            {/* Area polygon */}
            {measurementMode === MEASUREMENT_MODES.AREA && points.length >= 3 && (
              <Polygon positions={points} color="blue" fillOpacity={0.2} />
            )}

            {/* Radius circle */}
            {measurementMode === MEASUREMENT_MODES.RADIUS && points.length > 0 && (
              <>
                <Circle 
                  center={points[0]} 
                  radius={radius} 
                  color="green"
                  weight={2}
                  fillColor="green"
                  fillOpacity={0.1}
                />
                {points.length === 2 && (
                  <Polyline positions={points} color="green" dashArray="5,10" />
                )}
              </>
            )}

            {/* Path line */}
            {measurementMode === MEASUREMENT_MODES.PATH && points.length > 1 && (
              <Polyline positions={points} color="purple" weight={3} />
            )}
          </>
        )}
      </MapContainer>

      {/* Floating Measurement Tools */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-[1000]">
        <button
          onClick={() => changeMeasurementMode(MEASUREMENT_MODES.DISTANCE)}
          className={`p-3 rounded-lg shadow-lg flex items-center justify-center transition-all ${
            measurementMode === MEASUREMENT_MODES.DISTANCE
              ? 'bg-red-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          title="Measure Distance"
        >
          <Ruler size={24} />
        </button>

        <button
          onClick={() => changeMeasurementMode(MEASUREMENT_MODES.AREA)}
          className={`p-3 rounded-lg shadow-lg flex items-center justify-center transition-all ${
            measurementMode === MEASUREMENT_MODES.AREA
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          title="Measure Area"
        >
          <Square size={24} />
        </button>

        <button
          onClick={() => changeMeasurementMode(MEASUREMENT_MODES.RADIUS)}
          className={`p-3 rounded-lg shadow-lg flex items-center justify-center transition-all ${
            measurementMode === MEASUREMENT_MODES.RADIUS
              ? 'bg-green-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          title="Measure Radius"
        >
          <CircleIcon size={24} />
        </button>

        <button
          onClick={() => changeMeasurementMode(MEASUREMENT_MODES.PATH)}
          className={`p-3 rounded-lg shadow-lg flex items-center justify-center transition-all ${
            measurementMode === MEASUREMENT_MODES.PATH
              ? 'bg-purple-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          title="Measure Path"
        >
          <Route size={24} />
        </button>
      </div>

      {/* Results Panel */}
      {showResults && (
        <div className="absolute top-4 right-4 bg-white bg-opacity-90 p-4 rounded-lg shadow-lg max-w-sm z-[1000]">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Measurements</h3>
            <button 
              onClick={resetMeasurement}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-2 text-sm">
            {measurementMode === MEASUREMENT_MODES.DISTANCE && mapData.measurements.distance && (
              <p className="font-medium">Distance: {mapData.measurements.distance.toFixed(2)} km</p>
            )}

            {measurementMode === MEASUREMENT_MODES.AREA && mapData.measurements.area && (
              <p className="font-medium">Area: {mapData.measurements.area.toFixed(2)} km²</p>
            )}

            {measurementMode === MEASUREMENT_MODES.RADIUS && (
              <>
                {mapData.measurements.radius && (
                  <p className="font-medium">Radius: {mapData.measurements.radius.toFixed(2)} km</p>
                )}
                {mapData.measurements.circleArea && (
                  <p className="font-medium">Circle Area: {mapData.measurements.circleArea.toFixed(2)} km²</p>
                )}
              </>
            )}

            {measurementMode === MEASUREMENT_MODES.PATH && mapData.measurements.pathDistance && (
              <p className="font-medium">Path Distance: {mapData.measurements.pathDistance.toFixed(2)} km</p>
            )}

            <div className="text-gray-600 mt-2">
              {measurementMode === MEASUREMENT_MODES.DISTANCE && points.length < 2 && (
                points.length === 0 ? "Click to set starting point" : "Click to set end point"
              )}
              {measurementMode === MEASUREMENT_MODES.AREA && points.length < 3 && (
                "Click to add points (minimum 3 for area)"
              )}
              {measurementMode === MEASUREMENT_MODES.RADIUS && points.length < 2 && (
                points.length === 0 ? "Click to set center point" : "Click to set radius"
              )}
              {measurementMode === MEASUREMENT_MODES.PATH && (
                points.length === 0 ? "Click to start path" : "Click to add points to path"
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorldMap;