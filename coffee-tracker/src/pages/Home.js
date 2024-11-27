import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import CoffeeEntryForm from '../components/CoffeeEntryForm';

const Home = () => {
  const [coffeeShops, setCoffeeShops] = useState([]);
  const [editingShop, setEditingShop] = useState(null);

  useEffect(() => {
    const fetchCoffeeShops = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'coffeeShops'));
        const shops = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCoffeeShops(shops);
      } catch (error) {
        console.error('Error fetching coffee shops:', error);
      }
    };

    fetchCoffeeShops();
  }, []);

  const handleEdit = (shop) => {
    setEditingShop(shop); // Set the shop to be edited
  };

  const handleSave = async (updatedShop) => {
    try {
      const shopRef = doc(db, 'coffeeShops', updatedShop.id);
      await updateDoc(shopRef, updatedShop); // Update the shop in Firestore

      // Update the local state
      setCoffeeShops((prevShops) =>
        prevShops.map((shop) => (shop.id === updatedShop.id ? updatedShop : shop))
      );

      setEditingShop(null); // Exit editing mode
    } catch (error) {
      console.error('Error updating coffee shop:', error);
    }
  };

  return (
    <div>
      <h1>Coffee Tracker</h1>
      <CoffeeEntryForm
        initialData={editingShop} // Pass the data of the shop being edited
        onSave={handleSave} // Callback to save changes
      />
      <h2>Visited Coffee Shops</h2>
      <ul>
        {coffeeShops.map((shop) => (
          <li key={shop.id}>
            {shop.name} - {shop.rating} Stars - ${shop.price}
            <button onClick={() => handleEdit(shop)}>Edit</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
