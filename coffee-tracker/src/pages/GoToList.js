// src/pages/GoToList.js
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

const GoToList = () => {
  const [goToPlaces, setGoToPlaces] = useState([]); 
  const [newPlace, setNewPlace] = useState(''); 

  const collectionRef = collection(db, 'goToPlaces'); 

  useEffect(() => {
    const fetchGoToPlaces = async () => {
      try {
        const querySnapshot = await getDocs(collectionRef);
        const places = querySnapshot.docs.map((doc) => doc.data().name);
        setGoToPlaces(places);
      } catch (error) {
        console.error('Error fetching go-to places: ', error);
      }
    };

    fetchGoToPlaces();
  }, []);

  const addPlace = async () => {
    if (newPlace.trim() === '') {
      alert('Please enter a valid place name.');
      return;
    }

    try {
      await addDoc(collectionRef, { name: newPlace.trim() }); 
      setGoToPlaces([...goToPlaces, newPlace.trim()]); 
      setNewPlace(''); 
    } catch (error) {
      console.error('Error adding new place: ', error);
    }
  };

  const handleInputChange = (e) => {
    setNewPlace(e.target.value);
  };

  return (
    <div>
      <h1>Go-To List</h1>
      <ul>
        {goToPlaces.map((place, index) => (
          <li key={index}>{place}</li>
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
