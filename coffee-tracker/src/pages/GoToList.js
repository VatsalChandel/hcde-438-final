import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

const GOOGLE_PLACES_API_KEY = 'AIzaSyATHLTNMlM6iWMO0mkb_dPUT4N54fZrlyQ';

const GoToList = () => {
  const [goToPlaces, setGoToPlaces] = useState([]);
  const [newPlace, setNewPlace] = useState('');
  const [editingPlace, setEditingPlace] = useState(null);

  const collectionRef = collection(db, 'goToPlaces');

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

  const fetchAddress = async (placeName) => {
    const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
    const GOOGLE_API_URL = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(
      placeName
    )}&inputtype=textquery&fields=formatted_address&key=${GOOGLE_PLACES_API_KEY}`;

    try {
      const response = await fetch(CORS_PROXY + GOOGLE_API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.candidates[0]?.formatted_address || 'Address not found';
    } catch (error) {
      console.error('Error fetching address:', error);
      return null;
    }
  };

  const addPlace = async () => {
    if (newPlace.trim() === '') {
      alert('Please enter a valid place name.');
      return;
    }

    try {
      const address = await fetchAddress(newPlace.trim());
      if (address) {
        const docRef = await addDoc(collectionRef, { name: newPlace.trim(), address });
        setGoToPlaces([...goToPlaces, { id: docRef.id, name: newPlace.trim(), address }]);
        setNewPlace('');
      } else {
        alert('Could not fetch address. Please try again.');
      }
    } catch (error) {
      console.error('Error adding new place: ', error);
    }
  };

  const updatePlace = async (id, updatedName, updatedAddress) => {
    try {
      const placeRef = doc(db, 'goToPlaces', id);
      await updateDoc(placeRef, { name: updatedName, address: updatedAddress });
      setGoToPlaces((prevPlaces) =>
        prevPlaces.map((place) =>
          place.id === id ? { ...place, name: updatedName, address: updatedAddress } : place
        )
      );
    } catch (error) {
      console.error('Error updating place:', error);
    }
  };

  const deletePlace = async (id) => {
    try {
      const placeRef = doc(db, 'goToPlaces', id);
      await deleteDoc(placeRef);
      setGoToPlaces((prevPlaces) => prevPlaces.filter((place) => place.id !== id));
    } catch (error) {
      console.error('Error deleting place:', error);
    }
  };

  const handleInputChange = (e) => {
    setNewPlace(e.target.value);
  };

  const handleEdit = (place) => {
    setEditingPlace(place);
  };

  return (
    <div>
      <h1>Go-To List</h1>
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
                  onClick={() => {
                    updatePlace(editingPlace.id, editingPlace.name, editingPlace.address);
                    setEditingPlace(null);
                  }}
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
      <div>
        <input
          type="text"
          placeholder="Enter a new place"
          value={newPlace}
          onChange={handleInputChange}
        />
        <button onClick={addPlace}>Add Place</button>
      </div>
    </div>
  );
};

export default GoToList;
