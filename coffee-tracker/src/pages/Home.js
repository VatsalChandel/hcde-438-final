import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, deleteDoc, doc, updateDoc, addDoc, setDoc } from 'firebase/firestore';
import CoffeeEntryForm from '../components/CoffeeEntryForm';

const Home = () => {
  const [coffeeShops, setCoffeeShops] = useState([]);
  const [editingShop, setEditingShop] = useState(null);

  useEffect(() => {
    const fetchCoffeeShops = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'coffeeShops'));
        const shops = querySnapshot.docs.map(doc => ({
          id: doc.id, // Ensure the id is included here
          ...doc.data(),
        }));
        setCoffeeShops(shops);
      } catch (error) {
        console.error('Error fetching coffee shops:', error);
      }
    };
  
    fetchCoffeeShops();
  }, []);
  

  const handleEdit = (shop) => {
    setEditingShop(shop);
  };

  const handleSave = async (shop) => {
    if (shop.id) {
      // Update existing shop
      try {
        const shopRef = doc(db, 'coffeeShops', shop.id);
        await setDoc(shopRef, shop); // This updates the document
        setCoffeeShops((prev) =>
          prev.map((s) => (s.id === shop.id ? { ...s, ...shop } : s))
        );
        setEditingShop(null); // Close edit form
      } catch (error) {
        console.error('Error updating coffee shop:', error);
      }
    } else {
      // Add new shop with custom ID
      try {
        const customId = `${shop.name}-${shop.items[0]}`.toLowerCase().replace(/\s+/g, '-');
        const docRef = doc(db, 'coffeeShops', customId);
        await setDoc(docRef, shop); // Save with custom ID
        setCoffeeShops((prev) => [...prev, { id: customId, ...shop }]);
      } catch (error) {
        console.error('Error adding coffee shop:', error);
      }
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

  return (
    <div>
      <h1>Coffee Tracker</h1>
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
            {coffeeShops.map(shop => {
              if (!shop.id) {
                console.error("Shop ID is missing or invalid", shop); // Log missing IDs
                return null;
              }

              return (
                <li key={shop.id}>
                  {shop.name} - {shop.rating} Stars - ${shop.price}
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
