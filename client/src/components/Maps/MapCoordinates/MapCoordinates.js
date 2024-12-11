// import styles from "./MapCoordinates.module.scss";
// import classNames from "classnames/bind";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// const cx = classNames.bind(styles);

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

function DraggableMarker({ position, onPositionChange }) {
  const markerRef = useRef(null);
  const map = useMap();

  const eventHandlers = useCallback(
    {
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          onPositionChange(newPos);
          map.flyTo(newPos, map.getZoom());
        }
      },
    },
    [map, onPositionChange]
  );

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    />
  );
}

function MapEvents({ onPositionChange }) {
  useMapEvents({
    click(e) {
      onPositionChange(e.latlng);
    },
  });
  return null;
}
const MapCoordinates = ({
  fullAddress,
  setFormData,
  latitude,
  longitude,
  initData,
}) => {
  const [position, setPosition] = useState({ lat: latitude, lng: longitude });
  const [initFullAddress, setInitFullAddress] = useState("");
  const mapRef = useRef(null);
  useEffect(() => {
    const firstAddress = `${initData.street}, ${initData.ward.name}, ${initData.district.name}, ${initData.province.name}`;
    setInitFullAddress(firstAddress);
  }, []);
  useEffect(() => {
    if (fullAddress !== initFullAddress) {
      getCoordinates(fullAddress);
    }
  }, [fullAddress]);

  useEffect(() => {
    if (position) {
      setFormData((prev) => ({
        ...prev,
        latitude: position.lat,
        longitude: position.lng,
      }));
      // console.log("Updated position:", position);
    }
  }, [position, setFormData]);

  const getCoordinates = async (address) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/search?format=json&q=${encodeURIComponent(
          address
        )}`
      );

      if (response.data && response.data.length > 0) {
        const { lat, lon } = response.data[0];
        const newPosition = { lat: parseFloat(lat), lng: parseFloat(lon) };
        setPosition(newPosition);
        if (mapRef.current) {
          mapRef.current.flyTo([lat, lon], 15);
        }
      } else {
        // console.error("Không tìm thấy địa chỉ");
      }
    } catch (error) {
      // console.error("Lỗi khi lấy tọa độ:", error);
    }
  };

  const handlePositionChange = useCallback((newPosition) => {
    setPosition(newPosition);
  }, []);

  return (
    <div>
      {position && (
        <MapContainer
          center={[position.lat, position.lng]}
          zoom={15}
          style={{ height: "250px", width: "100%", marginTop: "20px" }}
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <DraggableMarker
            position={position}
            onPositionChange={handlePositionChange}
          />
          <MapEvents onPositionChange={handlePositionChange} />
        </MapContainer>
      )}
    </div>
  );
};

export default MapCoordinates;
