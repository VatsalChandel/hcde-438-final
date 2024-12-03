import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, deleteDoc, doc, updateDoc, addDoc, setDoc } from 'firebase/firestore';
import CoffeeEntryForm from '../components/CoffeeEntryForm';
import { GOOGLE_PLACES_API_KEY } from '../keys'
import './Home.css';


const Home = () => {
  const [coffeeShops, setCoffeeShops] = useState([]);
  const [editingShop, setEditingShop] = useState(null);

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

  // Fetch address and coordinates for a given place name
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

  // Save coffee shop (add or update)
  const handleSave = async (shop) => {
    try {
      // Fetch address and coordinates
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

      if (shop.id) {
        // Update existing shop
        const shopRef = doc(db, 'coffeeShops', shop.id);
        await setDoc(shopRef, updatedShop); // Update document
        setCoffeeShops((prev) =>
          prev.map((s) => (s.id === shop.id ? { ...s, ...updatedShop } : s))
        );
      } else {
        // Add new shop with custom ID
        const customId = `${shop.name}-${shop.items[0]}`.toLowerCase().replace(/\s+/g, '-');
        const docRef = doc(db, 'coffeeShops', customId);
        await setDoc(docRef, updatedShop); // Save with custom ID
        setCoffeeShops((prev) => [...prev, { id: customId, ...updatedShop }]);
      }

      setEditingShop(null); // Close edit form
    } catch (error) {
      console.error('Error saving coffee shop:', error);
    }
  };

  const handleEdit = (shop) => {
    setEditingShop(shop);
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

  return (
    <div>
      <h1>I've Been Here ☕</h1>
      {editingShop ? (
        <CoffeeEntryForm
          initialData={editingShop}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      ) : (
        <>
          <CoffeeEntryForm onSave={handleSave} onDelete={handleDelete} />
          <h2>Visited Coffee Shops</h2>
          <ul>
            {coffeeShops.map((shop) => {
              if (!shop.id) {
                console.error('Shop ID is missing or invalid', shop); // Log missing IDs
                return null;
              }

              return (
                <li key={shop.id}>
                  <strong>{shop.name}</strong> - {shop.rating} Stars - ${shop.price}
                  <br />
                  <em>{shop.address}</em> {/* Display address */}
                  <br />
                  <small>
                    Lat: {shop.lat}, Lng: {shop.lng} {/* Display coordinates */}
                  </small>
                  <br />
                  <button onClick={() => handleEdit(shop)}>Edit</button>
                  <button onClick={() => handleDelete(shop.id)}>Delete</button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
};

export default Home;
