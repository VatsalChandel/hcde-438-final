import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { GOOGLE_PLACES_API_KEY } from '../keys';

const GoToList = () => {
  const [goToPlaces, setGoToPlaces] = useState([]);
  const [newPlace, setNewPlace] = useState('');
  const [editingPlace, setEditingPlace] = useState(null);

  const collectionRef = collection(db, 'goToPlaces');

 
  
  // Fetch all places on component mount
  useEffect(() => {
    const fetchGoToPlaces = async () => {
      try {
        const querySnapshot = await getDocs(collectionRef);
        const places = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGoToPlaces(places);
      } catch (error) {
        console.error('Error fetching go-to places: ', error);
      }
    };

    fetchGoToPlaces();
  }, []);

  // Fetch address and coordinates from Google Maps API
  const fetchLocationDetails = async (placeName) => {
    const userLatitude = 47.6634069; // Example user latitude
    const userLongitude = -122.3138355; // Example user longitude
    const searchRadius = 16093; // 10 miles in meters
  
    const GOOGLE_API_URL = `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      placeName
    )}&location=${userLatitude},${userLongitude}&radius=${searchRadius}&key=${GOOGLE_PLACES_API_KEY}`;
  
    try {
      const response = await fetch(GOOGLE_API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const result = data.results[0];
      if (result) {
        return {
          address: result.formatted_address,
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
        };
      } else {
        throw new Error('Location not found');
      }
    } catch (error) {
      console.error('Error fetching location details:', error);
      return null;
    }
  };
  
  

  // Add a new place with address and coordinates
  const addPlace = async () => {
    if (newPlace.trim() === '') {
      alert('Please enter a valid place name.');
      return;
    }

    try {
      const locationDetails = await fetchLocationDetails(newPlace.trim());
      if (locationDetails) {
        const docRef = await addDoc(collectionRef, {
          name: newPlace.trim(),
          ...locationDetails, // Includes address, lat, and lng
        });
        setGoToPlaces([
          ...goToPlaces,
          { id: docRef.id, name: newPlace.trim(), ...locationDetails },
        ]);
        setNewPlace('');
      } else {
        alert('Could not fetch location details. Please try again.');
      }
    } catch (error) {
      console.error('Error adding new place: ', error);
    }
  };

  // Update a place's name and address
  const updatePlace = async (id, updatedName, updatedAddress) => {
    try {
      const updatedLocation = await fetchLocationDetails(updatedAddress);
      if (!updatedLocation) {
        alert('Could not update location. Please try again.');
        return;
      }

      const placeRef = doc(db, 'goToPlaces', id);
      await updateDoc(placeRef, {
        name: updatedName,
        address: updatedLocation.address,
        lat: updatedLocation.lat,
        lng: updatedLocation.lng,
      });

      setGoToPlaces((prevPlaces) =>
        prevPlaces.map((place) =>
          place.id === id
            ? { ...place, name: updatedName, ...updatedLocation }
            : place
        )
      );
      setEditingPlace(null);
    } catch (error) {
      console.error('Error updating place:', error);
    }
  };

  // Delete a place
  const deletePlace = async (id) => {
    try {
      const placeRef = doc(db, 'goToPlaces', id);
      await deleteDoc(placeRef);
      setGoToPlaces((prevPlaces) => prevPlaces.filter((place) => place.id !== id));
    } catch (error) {
      console.error('Error deleting place:', error);
    }
  };

  // Handle input change for the new place
  const handleInputChange = (e) => {
    setNewPlace(e.target.value);
  };

  // Handle edit action
  const handleEdit = (place) => {
    setEditingPlace(place);
  };

  return (
    <div>
      <h1>I Wanna Go 🏃‍♂️</h1>

      <div>
        <input
          type="text"
          placeholder="Enter a new place"
          value={newPlace}
          onChange={handleInputChange}
        />
        <button onClick={addPlace}>Add Place</button>
      </div>


      <ul>
        {goToPlaces.map((place) => (
          <li key={place.id}>
            {editingPlace?.id === place.id ? (
              <>
                <input
                  type="text"
                  value={editingPlace.name}
                  onChange={(e) =>
                    setEditingPlace({ ...editingPlace, name: e.target.value })
                  }
                />
                <input
                  type="text"
                  value={editingPlace.address}
                  onChange={(e) =>
                    setEditingPlace({ ...editingPlace, address: e.target.value })
                  }
                />
                <button
                  onClick={() =>
                    updatePlace(editingPlace.id, editingPlace.name, editingPlace.address)
                  }
                >
                  Save
                </button>
                <button onClick={() => setEditingPlace(null)}>Cancel</button>
              </>
            ) : (
              <>
                <strong>{place.name}</strong>
                <br />
                <em>{place.address}</em>
                <div>
                  <button onClick={() => handleEdit(place)}>Edit</button>
                  <button onClick={() => deletePlace(place.id)}>Delete</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
      
    </div>
  );
};

export default GoToList;
