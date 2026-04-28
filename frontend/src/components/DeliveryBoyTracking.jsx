    import React, { useEffect } from 'react';
    import scooter from "../assets/scooter.png";
    import home from "../assets/home.png";
    import L from "leaflet";
    import 'leaflet/dist/leaflet.css';
    import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';

    // Custom component to handle map centering when location updates
    function RecenterMap({ location }) {
        const map = useMap();
        useEffect(() => {
            if (location[0] && location[1]) {
                map.setView(location);
            }
        }, [location, map]);
        return null;
    }

    const deliveryBoyIcon = new L.Icon({
        iconUrl: scooter,
        iconSize: [40, 40],
        iconAnchor: [20, 40]
    });

    const customerIcon = new L.Icon({
        iconUrl: home,
        iconSize: [40, 40],
        iconAnchor: [20, 40]
    });

    function DeliveryBoyTracking({ data }) {
        // Correcting data paths based on your earlier controller logic
        const deliveryBoylat = data?.deliveryBoyLocation?.lat;
        const deliveryBoylon = data?.deliveryBoyLocation?.lon;
        const customerLat = data?.customerLocation?.lat;
        const customerLon = data?.customerLocation?.lon;

        // Safety check to prevent crash if data isn't loaded yet
        if (!deliveryBoylat || !customerLat) {
            return (
                <div className='w-full h-[400px] mt-3 rounded-xl overflow-hidden shadow-md bg-gray-100 flex items-center justify-center'>
                    <p className="text-gray-500">Loading map...</p>
                </div>
            );
        }

        const path = [
            [deliveryBoylat, deliveryBoylon],
            [customerLat, customerLon]
        ];

        const center = [deliveryBoylat, deliveryBoylon];

        return (
            <div className='w-full h-[400px] mt-3 rounded-xl overflow-hidden shadow-md'>
                <MapContainer
                    center={center}
                    zoom={15}
                    className="h-full w-full"
                >
                    <TileLayer
                        attribution='&copy; OpenStreetMap'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <RecenterMap location={center} />

                    {/* Fixed position syntax */}
                    <Marker position={[deliveryBoylat, deliveryBoylon]} icon={deliveryBoyIcon}>
                        <Popup>Delivery Partner</Popup>
                    </Marker>

                    <Marker position={[customerLat, customerLon]} icon={customerIcon}>
                        <Popup>Customer Location</Popup>
                    </Marker>
                    <Polyline positions={path} color="blue" weight={4} dashArray="5, 10" />
                </MapContainer>
            </div>
        );
    }

    export default DeliveryBoyTracking;