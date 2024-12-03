import React, { useEffect, useState } from 'react';
import { db } from '../firebase'; // Ensure this path matches your setup
import { collection, getDocs } from 'firebase/firestore';

const Profile = () => {
  const [totalVisits, setTotalVisits] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [totalSpending, setTotalSpending] = useState(0);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const coffeeShopsCol = collection(db, 'coffeeShops');
        const coffeeShopsSnapshot = await getDocs(coffeeShopsCol);
        const coffeeShops = coffeeShopsSnapshot.docs.map(doc => doc.data());

        // Calculate statistics
        const totalVisits = coffeeShops.length;
        const totalRating = coffeeShops.reduce((sum, shop) => sum + shop.rating, 0);
        const totalSpending = coffeeShops.reduce((sum, shop) => sum + shop.price, 0);

        setTotalVisits(totalVisits);
        setAverageRating(totalVisits > 0 ? (totalRating / totalVisits).toFixed(1) : 0);
        setTotalSpending(totalSpending.toFixed(2));
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    fetchProfileData();
  }, []); 

  return (
    <div>
      <h1>About Me ☕</h1>
      <p>Total Visits: {totalVisits}</p>
      <p>Average Rating: {averageRating}</p>
      <p>Total Spending: ${totalSpending}</p>
    </div>
  );
};

export default Profile;
