import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Icon,
  useMap,
} from "react-leaflet";
import { Card, ListGroup, Offcanvas, ProgressBar } from "react-bootstrap";
import { Icon as LIcon } from "leaflet";
import { FaCar, FaExclamationTriangle, FaLocationArrow } from "react-icons/fa";
import _ from "lodash";
import vehiclesData from "./vehicles.json";
import vehicleIcon from "./car-top-view.png";
import "leaflet/dist/leaflet.css";
import axios from "axios";

const initialMapCenter = [53.55, 10.0]; // Hamburg

const carIcon = new LIcon({
  iconUrl: vehicleIcon,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  className: "carIconDeactive",
});
const carIconActive = new LIcon({
  iconUrl: vehicleIcon,
  iconSize: [45, 45],
  iconAnchor: [16, 32],
  className: "carIconActive",
});

function MapWrapper({ selectedMarker, handleMarkerClick }) {
  const map = useMap();

  useEffect(() => {
    if (selectedMarker) {
      map.flyTo(
        [
          selectedMarker.geoCoordinate.latitude,
          selectedMarker.geoCoordinate.longitude,
        ],
        18
      );
    }
  }, [selectedMarker, map]);

  return null;
}

function CarItem({ car, onClick, isActive }) {
  const itemRef = useRef();

  useEffect(() => {
    if (isActive) {
      itemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    }
  }, [isActive]);

  return (
    <ListGroup.Item
      ref={itemRef}
      onClick={() => onClick(car)}
      active={isActive}
      className="car-item"
    >
      <h6>
        <FaCar style={{ marginRight: "8px" }} />
        {car.plate}
      </h6>
      <span>{car.address.split(",")[0]}</span>
    </ListGroup.Item>
  );
}

function App() {
  const [cars, setCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);

  async function fetchData() {
    try {
      const data = vehiclesData;
      setCars(data);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleCarClick = (car) => {
    setSelectedCar(car);
    setTimeout(() => {
      setShow((prevState) => !prevState);
    }, 1000);
  };

  return (
    <div className="d-flex col-12">
      <div className="col-4 col-md-3 overflow-auto" style={{ height: "100vh" }}>
        <Card>
          {selectedCar && (
            <Offcanvas
              show={show}
              onHide={handleClose}
              backdropClassName="backdrop"
              placement="end"
              className="off-canvas"
            >
              <Offcanvas.Header closeButton>
                <Offcanvas.Title>{selectedCar.plate}</Offcanvas.Title>
              </Offcanvas.Header>
              <Offcanvas.Body>
                <div className="mb-1 d-flex column align-items-center">
                  <FaLocationArrow style={{ marginRight: "8px" }} />
                  <span>{selectedCar.address}</span>
                </div>

                <div className="mb-1">
                  <FaCar style={{ marginRight: "3px" }} /> Fuel Level:
                  <ProgressBar
                    className="mt-1"
                    now={selectedCar.fuelLevel}
                    label={`${selectedCar.fuelLevel}%`}
                  />
                </div>
              </Offcanvas.Body>
            </Offcanvas>
          )}
          <Card.Header className="text-center">List of Drivers</Card.Header>
          <ListGroup variant="flush">
            {cars.map((car, index) => (
              <CarItem
                key={index}
                car={car}
                onClick={handleCarClick}
                isActive={_.isEqual(car, selectedCar)}
              />
            ))}
          </ListGroup>
        </Card>
      </div>
      <div className="col-8 col-md-9">
        <MapContainer
          center={initialMapCenter}
          zoom={13}
          style={{ height: "100vh", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {cars.map((car, index) => (
            <Marker
              key={index}
              icon={_.isEqual(car, selectedCar) ? carIconActive : carIcon}
              position={[
                car.geoCoordinate.latitude,
                car.geoCoordinate.longitude,
              ]}
              eventHandlers={{
                click: () => {
                  handleCarClick(car);
                },
              }}
            />
          ))}
          {selectedCar && (
            <MapWrapper
              selectedMarker={selectedCar}
              handleMarkerClick={handleCarClick}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}

export default App;
