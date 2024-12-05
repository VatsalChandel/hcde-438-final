import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

import { collection, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';
import CoffeeEntryForm from '../components/CoffeeEntryForm';
import { GOOGLE_PLACES_API_KEY } from '../keys';
import './Home.css';
import { useNavigate } from 'react-router-dom';



const Home = () => {
  const [coffeeShops, setCoffeeShops] = useState([]);

  const [editingShop, setEditingShop] = useState(null);
  const [isAdding, setIsAdding] = useState(false); // Track "Add Location" form visibility
  
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {

 

    const fetchCoffeeShops = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'coffeeShops'));
        const shops = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCoffeeShops(shops);
      } catch (error) {
        console.error('Error fetching coffee shops:', error);
      }
    };

    fetchCoffeeShops();
  }, []);

  const fetchLocationDetails = async (placeName) => {
    const GOOGLE_API_URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      placeName
    )}&key=${GOOGLE_PLACES_API_KEY}`;

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

  const handleSave = async (shop) => {
    try {
      // Fetch location details if a shop name is provided
      const locationDetails = shop.name
        ? await fetchLocationDetails(shop.name)
        : null;

      if (!locationDetails) {
        alert('Could not fetch location details. Please check the place name.');
        return;
      }

      const updatedShop = {
        ...shop,
        ...locationDetails, // Includes address, lat, and lng
      };

      const customId = shop.id
        ? shop.id // Use existing ID if editing
        : `${shop.name}-${shop.items[0]}`.toLowerCase().replace(/\s+/g, '-');
      const docRef = doc(db, 'coffeeShops', customId);

      await setDoc(docRef, updatedShop); // Save with updated location details
      setCoffeeShops((prev) =>
        prev.map((s) =>
          s.id === customId ? { ...s, ...updatedShop } : s
        ).concat(shop.id ? [] : [{ id: customId, ...updatedShop }])
      );

      setIsAdding(false); // Hide form after saving
      setEditingShop(null); // Reset editing state
    } catch (error) {
      console.error('Error saving coffee shop:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const docRef = doc(db, 'coffeeShops', id);
      await deleteDoc(docRef);
      setCoffeeShops((prev) => prev.filter((shop) => shop.id !== id));
    } catch (error) {
      console.error('Error deleting coffee shop:', error);
    }
  };

  const closeForm = () => {
    setIsAdding(false);
    setEditingShop(null);
  }

  return (
    <div>
      
      <h1>I've Been Here ☕</h1>

      {isAdding || editingShop ? (
        <CoffeeEntryForm
          initialData={editingShop}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={closeForm}
        />
      ) : (
        <>
         <ul>

            {coffeeShops.map((shop) => (
              <li key={shop.id}>
                <div className="shop-details">
                  <strong>{shop.name}</strong>
                  <em>{shop.address}</em>
                  <div className="shop-meta">
                    {shop.rating} Stars || ${shop.price} || Got: {shop.items.join(", ")}
                  </div>
                </div>
                <div className="button-group">
                  <button onClick={() => setEditingShop(shop)}>Edit</button>
                  <button onClick={() => handleDelete(shop.id)}>Delete</button>
                </div>
              </li>
            ))}
        </ul>
        <div className="add-location-container">
          <button onClick={() => setIsAdding(true)} className="add-location">Add Location</button>
        </div>
        </>
        
      )}

    </div>
  );
};

export default Home;
