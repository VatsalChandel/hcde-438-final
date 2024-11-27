// src/pages/Home.js
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import CoffeeEntryForm from '../components/CoffeeEntryForm';

const Home = () => {
  const [coffeeShops, setCoffeeShops] = useState([]);

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

  return (
    <div>
      <h1>Coffee Tracker</h1>
      <CoffeeEntryForm />
      <h2>Visited Coffee Shops</h2>
      <ul>
        {coffeeShops.map(shop => (
          <li key={shop.id}>
            {shop.name} - {shop.rating} Stars - ${shop.price}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
