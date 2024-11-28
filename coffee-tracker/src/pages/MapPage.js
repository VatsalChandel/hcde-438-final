import { GoogleMap, Marker, LoadScript } from '@react-google-maps/api';
import { GOOGLE_PLACES_API_KEY } from '../keys'
import React, { useEffect, useState } from 'react';
import { db } from '../firebase'; 
import { collection, getDocs } from 'firebase/firestore';

const containerStyle = {
  width: '100%',
  height: '600px',
};


const MapPage = () => {
  const [coffeeShops, setCoffeeShops] = useState([]);
  const [goToPlaces, setGoToPlaces] = useState([]);
  const [userLocation, setUserLocation] = useState(null); // Store user's location



  useEffect(() => {
    // Fetch data from Firebase
    const fetchData = async () => {
      try {
        const coffeeShopsSnapshot = await getDocs(collection(db, 'coffeeShops'));
        const goToPlacesSnapshot = await getDocs(collection(db, 'goToPlaces'));

        setCoffeeShops(
          coffeeShopsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );

        setGoToPlaces(
          goToPlacesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );
      } catch (error) {
        console.error('Error fetching data from Firebase:', error);
      }
    };

    fetchData();

    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error('Error getting user location:', error);
          // You can set a default location or handle error
          setUserLocation({ lat: 47.663399, lng: -122.313911 }); // Fallback location
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
      setUserLocation({ lat: 47.663399, lng: -122.313911 }); // Fallback location
    }
  }, []);




  return (
    <LoadScript googleMapsApiKey={GOOGLE_PLACES_API_KEY}>
      <GoogleMap mapContainerStyle={containerStyle} center={userLocation} zoom={12}>
        {/* Markers for Coffee Shops */}
        {coffeeShops.map((shop) => (
          <Marker
            key={shop.id}
            position={{ lat: shop.lat, lng: shop.lng }}
            icon="http://maps.google.com/mapfiles/ms/icons/green-dot.png" // Green for coffee shops
            title={`Coffee Shop: ${shop.name}`}
          />
        ))}

        {/* Markers for Go-To Places */}
        {goToPlaces.map((place) => (
          <Marker
            key={place.id}
            position={{ lat: place.lat, lng: place.lng }}
            icon="http://maps.google.com/mapfiles/ms/icons/blue-dot.png" // Blue for go-to places
            title={`Go-To: ${place.name}`}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  );
};

export default MapPage;
