import React, { useState, useEffect } from "react";
import "../../App.css";

export default function VehicleRequestForm() {
    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
    const [formData, setFormData] = useState({
        requesterName: "",
        requesterPosition: "",
        travelerName: "",
        travelerPosition: "",
        department: "",
        phoneNumber: "",
        dutyNature: "",
        fromLocation: "",
        toLocation: "",
        travelDateTime: "",
        reason: "",
        distanceKm: "",
    });

    const [autoDistance, setAutoDistance] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [showSplash, setShowSplash] = useState(false);
    const [fadeOut, setFadeOut] = useState(false);

    // 🔹 Generate request ID
    const generateRequestId = () => {
        const year = new Date().getFullYear();
        let counter = localStorage.getItem("vehicleRequestCounter");
        if (!counter) counter = 1;
        else counter = parseInt(counter) + 1;
        localStorage.setItem("vehicleRequestCounter", counter);
        const paddedCounter = String(counter).padStart(3, "0");
        return `VEH-REQ-${year}-${paddedCounter}`;
    };

    // 🔹 Convert place text -> coordinates
    const getCoordinates = async (place) => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`
            );
            const data = await res.json();
            if (data.length > 0) {
                return {
                    lat: parseFloat(data[0].lat),
                    lon: parseFloat(data[0].lon),
                };
            }
        } catch (err) {
            console.error("Geocoding error:", err);
        }
        return null;
    };

    // 🔹 Get route distance
    const getRouteDistanceKm = async (fromCoords, toCoords) => {
        try {
            const url = `https://router.project-osrm.org/route/v1/driving/${fromCoords.lon},${fromCoords.lat};${toCoords.lon},${toCoords.lat}?overview=false`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.code === "Ok" && data.routes && data.routes.length > 0) {
                const meters = data.routes[0].distance;
                return meters / 1000;
            }
        } catch (err) {
            console.error("Routing error:", err);
        }
        return null;
    };

    // 🔹 Haversine fallback
    const haversineKm = (lat1, lon1, lat2, lon2) => {
        const toRad = (deg) => (deg * Math.PI) / 180;
        const R = 6371;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // 🔹 Auto calculate distance
    useEffect(() => {
        const calculateDistance = async () => {
            if (formData.fromLocation && formData.toLocation) {
                setLoading(true);
                setAutoDistance(null);

                const fromCoords = await getCoordinates(formData.fromLocation);
                const toCoords = await getCoordinates(formData.toLocation);

                if (fromCoords && toCoords) {
                    const routeKm = await getRouteDistanceKm(fromCoords, toCoords);
                    const distance =
                        routeKm !== null
                            ? routeKm.toFixed(2)
                            : haversineKm(fromCoords.lat, fromCoords.lon, toCoords.lat, toCoords.lon).toFixed(2);

                    setAutoDistance(distance);
                    setFormData((prev) => ({ ...prev, distanceKm: distance }));
                }

                setLoading(false);
            }
        };
        calculateDistance();
    }, [formData.fromLocation, formData.toLocation]);

    // 🔹 Input change
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 🔹 Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const requestId = generateRequestId();
            const payload = { ...formData, requestId };

            await fetch(`${API_BASE_URL}/vehicle-requests`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            setMessage(`✅ Vehicle request submitted successfully! (ID: ${requestId})`);

            // Show success splash
            setShowSplash(true);
            setTimeout(() => setFadeOut(true), 5000);
            setTimeout(() => {
                setShowSplash(false);
                window.location.reload(); // refresh after animation
            }, 5000);

            // Reset form
            setFormData({
                requesterName: "",
                requesterPosition: "",
                travelerName: "",
                travelerPosition: "",
                department: "",
                phoneNumber: "",
                dutyNature: "",
                fromLocation: "",
                toLocation: "",
                travelDateTime: "",
                reason: "",
                distanceKm: "",
            });
            setAutoDistance(null);
        } catch (err) {
            console.error(err);
            setMessage("❌ Failed to submit request");
        }
    };


    if (showSplash) {
        return (
            <div className={`splash-screen ${fadeOut ? "fade-out" : ""}`}>
                <div className="splash-content">
                    <img src="/logo.png" alt="Logo" className="splash-logo" />
                    <p className="splash-text">✅ Request Submitted Successfully!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="vehicle-form-container">
            <form className="employee-vehicle-form" onSubmit={handleSubmit}>
                <div className="form-row">
                    <input name="requesterName" placeholder="Requester Name" value={formData.requesterName} onChange={handleChange} required />
                    <input name="requesterPosition" placeholder="Requester Position" value={formData.requesterPosition} onChange={handleChange} required />
                </div>

                <div className="form-row">
                    <input name="travelerName" placeholder="Traveler Name" value={formData.travelerName} onChange={handleChange} required />
                    <input name="travelerPosition" placeholder="Traveler Position" value={formData.travelerPosition} onChange={handleChange} required />
                </div>

                <div className="form-row">
                    <input name="department" placeholder="Department" value={formData.department} onChange={handleChange} required />
                    <input name="phoneNumber" placeholder="Phone Number" value={formData.phoneNumber} onChange={handleChange} required />
                </div>

                <div className="form-row">
                    <input name="dutyNature" placeholder="Duty Nature" value={formData.dutyNature} onChange={handleChange} required />
                    <input type="datetime-local" name="travelDateTime" value={formData.travelDateTime} onChange={handleChange} required />
                </div>

                <div className="form-row">
                    <input name="fromLocation" placeholder="From (City, Place)" value={formData.fromLocation} onChange={handleChange} required />
                    <input name="toLocation" placeholder="To (City, Place)" value={formData.toLocation} onChange={handleChange} required />
                    <input
                        type="number"
                        step="0.01"
                        name="distanceKm"
                        placeholder="✅ Edit if the km count is incorrect"
                        value={formData.distanceKm}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="distance-row">
                    {loading && <p className="distance-calculating">Calculating distance...</p>}
                    {!loading && autoDistance && <p className="distance-message">🧭 Auto calculated distance: <strong>{autoDistance} km</strong></p>}
                </div>

                <div className="form-row">
                    <textarea name="reason" placeholder="Reason" value={formData.reason} onChange={handleChange} required />
                </div>

                <button type="submit" className="VehicleRequestButton">Submit Request</button>
            </form>

            {message && <p className="form-message">{message}</p>}
        </div>
    );
}
