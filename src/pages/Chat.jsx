import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  LayersControl,
  useMapEvents,
  useMap,
  Circle,
  Polygon,
  Polyline,
} from "react-leaflet";
import {
  Search,
  Compass,
  X,
  MapPin,
  Ruler,
  Square,
  Circle as CircleIcon,
  Route,
} from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Search Result Component
const SearchResult = ({ result, onSelect, onClose }) => (
  <div className="absolute top-16 left-4 right-4 bg-white rounded-lg shadow-lg z-[1001] max-h-60 overflow-y-auto">
    <div className="p-2">
      {result.map((place, index) => (
        <button
          key={index}
          onClick={() => onSelect(place)}
          className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md flex items-center gap-2"
        >
          <MapPin size={16} />
          <span>{place.display_name}</span>
        </button>
      ))}
    </div>
    <button
      onClick={onClose}
      className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full"
    >
      <X size={16} />
    </button>
  </div>
);

// Location Controls Component
const LocationControls = ({ onMyLocation }) => (
  <div className="absolute right-4 top-4 z-[1000]">
    <button
      onClick={onMyLocation}
      className="bg-white p-3 rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
      title="My Location"
    >
      <Compass size={24} />
    </button>
  </div>
);

// Search Component
const SearchControl = ({ onSearch, isSearching }) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="absolute top-4 left-4 right-4 z-[1000] max-w-md"
    >
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search place or coordinates (e.g., 40.7128, -74.0060)"
          className="w-full px-4 py-2 pl-10 pr-4 rounded-lg shadow-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Search
          size={20}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-900 border-t-transparent"></div>
          </div>
        )}
      </div>
    </form>
  );
};

// Measurement modes
const MEASUREMENT_MODES = {
  NONE: "none",
  DISTANCE: "distance",
  AREA: "area",
  RADIUS: "radius",
  PATH: "path",
};

// Component to track map events
const MapEvents = ({ onMapData, onMapClick }) => {
  const map = useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onMapData((prev) => ({
        ...prev,
        lastClick: { lat: lat.toFixed(4), lng: lng.toFixed(4) },
      }));
      onMapClick(e);
    },
    zoom: (e) => {
      onMapData((prev) => ({
        ...prev,
        zoomLevel: map.getZoom(),
      }));
    },
    moveend: () => {
      const bounds = map.getBounds();
      onMapData((prev) => ({
        ...prev,
        bounds: {
          north: bounds.getNorth().toFixed(4),
          south: bounds.getSouth().toFixed(4),
          east: bounds.getEast().toFixed(4),
          west: bounds.getWest().toFixed(4),
        },
      }));
    },
  });
  return null;
};

// Map Controller Component
const MapController = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    if (center && zoom) {
      map.setView(center, zoom, {
        animate: true,
        duration: 1.5, // Increased duration
        easeLinearity: 0.25,
        noMoveStart: true,
        // Additional animation options for smoother movement
        pan: {
          duration: 1.5,
          easeLinearity: 0.25,
        },
        zoom: {
          animate: true,
          duration: 1.5,
        },
      });
    }
  }, [center, zoom, map]);

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
      circleArea: null,
    },
  });

  const [measurementMode, setMeasurementMode] = useState(
    MEASUREMENT_MODES.NONE
  );
  const [points, setPoints] = useState([]);
  const [radius, setRadius] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([20, -20]);
  const [mapZoom, setMapZoom] = useState(3);

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

      const lat1 = (p1[0] * Math.PI) / 180;
      const lon1 = (p1[1] * Math.PI) / 180;
      const lat2 = (p2[0] * Math.PI) / 180;
      const lon2 = (p2[1] * Math.PI) / 180;

      area += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
    }

    area = Math.abs((area * R * R) / 2);
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
          setPoints((prev) => [...prev, newPoint]);
          if (points.length === 1) {
            setMapData((prev) => ({
              ...prev,
              measurements: {
                ...prev.measurements,
                distance: calculateDistance(points[0], newPoint),
              },
            }));
          }
        }
        break;

      case MEASUREMENT_MODES.AREA:
        setPoints((prev) => [...prev, newPoint]);
        if (points.length >= 2) {
          setMapData((prev) => ({
            ...prev,
            measurements: {
              ...prev.measurements,
              area: calculateArea([...points, newPoint]),
            },
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

          setPoints((prev) => [...prev, newPoint]);
          setMapData((prev) => ({
            ...prev,
            measurements: {
              ...prev.measurements,
              radius: distance,
              circleArea: areaInKm2,
            },
          }));
        }
        break;

      case MEASUREMENT_MODES.PATH:
        setPoints((prev) => [...prev, newPoint]);
        if (points.length > 0) {
          setMapData((prev) => ({
            ...prev,
            measurements: {
              ...prev.measurements,
              pathDistance: calculatePathDistance([...points, newPoint]),
            },
          }));
        }
        break;
    }
  };

  // Reset measurements
  const resetMeasurement = () => {
    setPoints([]);
    setRadius(0);
    setMapData((prev) => ({
      ...prev,
      measurements: {
        distance: null,
        area: null,
        radius: null,
        pathDistance: null,
        circleArea: null,
      },
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

  // Handle search
  const handleSearch = async (query) => {
    setIsSearching(true);
    try {
      // Check if query is coordinates
      const coordsRegex =
        /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;

      if (coordsRegex.test(query)) {
        const [lat, lng] = query
          .split(",")
          .map((coord) => parseFloat(coord.trim()));
        setMapCenter([lat, lng]);
        setMapZoom(16); // Closer zoom for coordinate searches
        setSelectedLocation({
          lat,
          lng,
          display_name: `${lat}, ${lng}`,
        });
        setSearchResults([]);
      } else {
        // Search using Nominatim API
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
          )}&limit=5`
        );
        const data = await response.json();
        setSearchResults(data);

        // If we get exactly one result, zoom to it automatically
        if (data.length === 1) {
          handleSelectPlace(data[0]);
        }
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search result selection
  const handleSelectPlace = (place) => {
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lon);

    // More granular zoom levels based on place type
    let zoom = 13; // default zoom
    if (place.type === "country") zoom = 5;
    else if (place.type === "state") zoom = 7;
    else if (place.type === "city" || place.type === "town") zoom = 10;
    else if (place.type === "village" || place.type === "suburb") zoom = 12;
    else if (place.importance) {
      // More gradual zoom calculation based on importance
      zoom = Math.round(16 - place.importance * 6);
    }

    // For coordinate searches, use a slightly lower initial zoom
    if (place.display_name.match(/^-?\d+\.\d+,\s*-?\d+\.\d+$/)) {
      zoom = 14;
    }

    setMapCenter([lat, lng]);
    setMapZoom(zoom);
    setSelectedLocation(place);
    setSearchResults([]);
  };

  // Handle my location
  const handleMyLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setMapCenter([latitude, longitude]);
        setMapZoom(14); // Slightly lower initial zoom for smoother transition
        setSelectedLocation({
          lat: latitude,
          lng: longitude,
          display_name: "Your Location",
        });
      });
    }
  };
  return (
    <div className="w-full h-screen relative">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="w-full h-full"
        zoomControl={false}
      >
        <MapController center={mapCenter} zoom={mapZoom} />
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Street Map">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
          </LayersControl.BaseLayer>
        </LayersControl>

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
            {measurementMode === MEASUREMENT_MODES.DISTANCE &&
              points.length === 2 && (
                <Polyline positions={points} color="red" weight={3} />
              )}

            {/* Area polygon */}
            {measurementMode === MEASUREMENT_MODES.AREA &&
              points.length >= 3 && (
                <Polygon positions={points} color="blue" fillOpacity={0.2} />
              )}

            {/* Radius circle */}
            {measurementMode === MEASUREMENT_MODES.RADIUS &&
              points.length > 0 && (
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
                    <Polyline
                      positions={points}
                      color="green"
                      dashArray="5,10"
                    />
                  )}
                </>
              )}

            {/* Path line */}
            {measurementMode === MEASUREMENT_MODES.PATH &&
              points.length > 1 && (
                <Polyline positions={points} color="purple" weight={3} />
              )}
          </>
        )}

        {selectedLocation && (
          <Marker
            position={[
              selectedLocation.lat,
              selectedLocation.lon || selectedLocation.lng,
            ]}
          >
            <Popup>
              <div className="text-sm">{selectedLocation.display_name}</div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Search Controls */}
      <SearchControl onSearch={handleSearch} isSearching={isSearching} />

      {/* Search Results */}
      {searchResults.length > 0 && (
        <SearchResult
          result={searchResults}
          onSelect={handleSelectPlace}
          onClose={() => setSearchResults([])}
        />
      )}

      {/* Location Controls */}
      <LocationControls onMyLocation={handleMyLocation} />

      {/* Floating Measurement Tools */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-[1000]">
        <button
          onClick={() => changeMeasurementMode(MEASUREMENT_MODES.DISTANCE)}
          className={`p-3 rounded-lg shadow-lg flex items-center justify-center transition-all ${
            measurementMode === MEASUREMENT_MODES.DISTANCE
              ? "bg-red-500 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
          title="Measure Distance"
        >
          <Ruler size={24} />
        </button>

        <button
          onClick={() => changeMeasurementMode(MEASUREMENT_MODES.AREA)}
          className={`p-3 rounded-lg shadow-lg flex items-center justify-center transition-all ${
            measurementMode === MEASUREMENT_MODES.AREA
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
          title="Measure Area"
        >
          <Square size={24} />
        </button>

        <button
          onClick={() => changeMeasurementMode(MEASUREMENT_MODES.RADIUS)}
          className={`p-3 rounded-lg shadow-lg flex items-center justify-center transition-all ${
            measurementMode === MEASUREMENT_MODES.RADIUS
              ? "bg-green-500 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
          title="Measure Radius"
        >
          <CircleIcon size={24} />
        </button>

        <button
          onClick={() => changeMeasurementMode(MEASUREMENT_MODES.PATH)}
          className={`p-3 rounded-lg shadow-lg flex items-center justify-center transition-all ${
            measurementMode === MEASUREMENT_MODES.PATH
              ? "bg-purple-500 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
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
            {measurementMode === MEASUREMENT_MODES.DISTANCE &&
              mapData.measurements.distance && (
                <p className="font-medium">
                  Distance: {mapData.measurements.distance.toFixed(2)} km
                </p>
              )}

            {measurementMode === MEASUREMENT_MODES.AREA &&
              mapData.measurements.area && (
                <p className="font-medium">
                  Area: {mapData.measurements.area.toFixed(2)} km²
                </p>
              )}

            {measurementMode === MEASUREMENT_MODES.RADIUS && (
              <>
                {mapData.measurements.radius && (
                  <p className="font-medium">
                    Radius: {mapData.measurements.radius.toFixed(2)} km
                  </p>
                )}
                {mapData.measurements.circleArea && (
                  <p className="font-medium">
                    Circle Area: {mapData.measurements.circleArea.toFixed(2)}{" "}
                    km²
                  </p>
                )}
              </>
            )}

            {measurementMode === MEASUREMENT_MODES.PATH &&
              mapData.measurements.pathDistance && (
                <p className="font-medium">
                  Path Distance: {mapData.measurements.pathDistance.toFixed(2)}{" "}
                  km
                </p>
              )}

            <div className="text-gray-600 mt-2">
              {measurementMode === MEASUREMENT_MODES.DISTANCE &&
                points.length < 2 &&
                (points.length === 0
                  ? "Click to set starting point"
                  : "Click to set end point")}
              {measurementMode === MEASUREMENT_MODES.AREA &&
                points.length < 3 &&
                "Click to add points (minimum 3 for area)"}
              {measurementMode === MEASUREMENT_MODES.RADIUS &&
                points.length < 2 &&
                (points.length === 0
                  ? "Click to set center point"
                  : "Click to set radius")}
              {measurementMode === MEASUREMENT_MODES.PATH &&
                (points.length === 0
                  ? "Click to start path"
                  : "Click to add points to path")}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorldMap;
