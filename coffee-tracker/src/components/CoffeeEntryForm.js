import React, { useEffect, useState } from 'react';

const CoffeeEntryForm = ({ initialData, onSave }) => {
  const [name, setName] = useState('');
  const [items, setItems] = useState('');
  const [rating, setRating] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setItems(Array.isArray(initialData.items) ? initialData.items.join(', ') : initialData.items || ''); // Ensure items is a string
      setRating(initialData.rating || '');
      setPrice(initialData.price || '');
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedShop = {
      id: initialData?.id, // Retain the ID for updating
      name,
      items: items.split(',').map((item) => item.trim()), // Convert string back to array
      rating: Number(rating),
      price: Number(price),
    };
    onSave(updatedShop); // Pass the updated shop back to the parent
    setName('');
    setItems('');
    setRating('');
    setPrice('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Coffee Shop Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Items (separate with commas):</label>
        <input
          type="text"
          value={items}
          onChange={(e) => setItems(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Rating (1-5):</label>
        <input
          type="number"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          min="1"
          max="5"
          required
        />
      </div>
      <div>
        <label>Total Price ($):</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
      </div>
      <button type="submit">{initialData ? 'Save Changes' : 'Add Coffee Shop'}</button>
    </form>
  );
};

export default CoffeeEntryForm;
