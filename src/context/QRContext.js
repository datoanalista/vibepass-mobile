import React, { createContext, useContext, useState } from 'react';

// Create QR Context
const QRContext = createContext();

// QR Provider Component
export const QRProvider = ({ children }) => {
  const [qrData, setQrData] = useState(null);
  const [validationStates, setValidationStates] = useState({
    tickets: {},     // { attendeeIndex: boolean }
    food: {},        // { itemId: remainingQuantity }
    activities: {}   // { itemId: remainingQuantity }
  });

  // Set QR data from scanner
  const setQRData = (data) => {
    setQrData(data);
    // Initialize validation states based on QR data
    initializeValidationStates(data);
  };

  // Initialize validation states when QR is scanned
  const initializeValidationStates = (data) => {
    if (!data) return;

    const newStates = {
      tickets: {},
      food: {},
      activities: {}
    };

    // Initialize ticket validation states (false = not entered)
    if (data.attendees) {
      data.attendees.forEach((attendee) => {
        newStates.tickets[attendee.index] = false;
      });
    }

    // Initialize food validation states (remaining quantity)
    if (data.food && data.food.items) {
      data.food.items.forEach((item) => {
        newStates.food[item.id] = item.cantidad;
      });
    }

    // Initialize activity validation states (remaining quantity)
    if (data.activities && data.activities.items) {
      data.activities.items.forEach((item) => {
        newStates.activities[item.id] = item.cantidad;
      });
    }

    setValidationStates(newStates);
  };

  // Mark attendee as entered
  const markAttendeeEntered = (attendeeIndex) => {
    setValidationStates(prev => ({
      ...prev,
      tickets: {
        ...prev.tickets,
        [attendeeIndex]: true
      }
    }));
  };

  // Redeem food item
  const redeemFoodItem = (itemId, quantity = 1) => {
    setValidationStates(prev => {
      const currentQuantity = prev.food[itemId] || 0;
      const newQuantity = Math.max(0, currentQuantity - quantity);
      
      return {
        ...prev,
        food: {
          ...prev.food,
          [itemId]: newQuantity
        }
      };
    });
  };

  // Redeem activity item
  const redeemActivityItem = (itemId, quantity = 1) => {
    setValidationStates(prev => {
      const currentQuantity = prev.activities[itemId] || 0;
      const newQuantity = Math.max(0, currentQuantity - quantity);
      
      return {
        ...prev,
        activities: {
          ...prev.activities,
          [itemId]: newQuantity
        }
      };
    });
  };

  // Clear QR data
  const clearQRData = () => {
    setQrData(null);
    setValidationStates({
      tickets: {},
      food: {},
      activities: {}
    });
  };

  // Get validation summary
  const getValidationSummary = () => {
    if (!qrData) return null;

    const totalAttendees = qrData.attendees?.length || 0;
    const enteredAttendees = Object.values(validationStates.tickets).filter(Boolean).length;

    const totalFoodItems = qrData.food?.items?.reduce((sum, item) => sum + item.cantidad, 0) || 0;
    const redeemedFoodItems = qrData.food?.items?.reduce((sum, item) => {
      const remaining = validationStates.food[item.id] || 0;
      return sum + (item.cantidad - remaining);
    }, 0) || 0;

    const totalActivityItems = qrData.activities?.items?.reduce((sum, item) => sum + item.cantidad, 0) || 0;
    const redeemedActivityItems = qrData.activities?.items?.reduce((sum, item) => {
      const remaining = validationStates.activities[item.id] || 0;
      return sum + (item.cantidad - remaining);
    }, 0) || 0;

    return {
      tickets: { total: totalAttendees, entered: enteredAttendees },
      food: { total: totalFoodItems, redeemed: redeemedFoodItems },
      activities: { total: totalActivityItems, redeemed: redeemedActivityItems }
    };
  };

  const value = {
    qrData,
    validationStates,
    setQRData,
    markAttendeeEntered,
    redeemFoodItem,
    redeemActivityItem,
    clearQRData,
    getValidationSummary
  };

  return (
    <QRContext.Provider value={value}>
      {children}
    </QRContext.Provider>
  );
};

// Custom hook to use QR context
export const useQR = () => {
  const context = useContext(QRContext);
  if (!context) {
    throw new Error('useQR must be used within a QRProvider');
  }
  return context;
};

export default QRContext;
