// src/components/CoffeeEntryForm.js
import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const CoffeeEntryForm = () => {
  const [name, setName] = useState('');
  const [items, setItems] = useState('');
  const [rating, setRating] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const coffeeShop = { name, items, rating: Number(rating), price: Number(price) };
      await addDoc(collection(db, 'coffeeShops'), coffeeShop);
      alert('Coffee shop added!');
      setName('');
      setItems('');
      setRating('');
      setPrice('');
    } catch (error) {
      console.error('Error adding coffee shop: ', error);
      alert('Failed to add coffee shop.');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Coffee Shop Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Items Purchased"
        value={items}
        onChange={(e) => setItems(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Rating (1-5)"
        value={rating}
        onChange={(e) => setRating(e.target.value)}
        min="1"
        max="5"
        required
      />
      <input
        type="number"
        placeholder="Total Price ($)"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Add Coffee Shop'}
      </button>
    </form>
  );
};

export default CoffeeEntryForm;
