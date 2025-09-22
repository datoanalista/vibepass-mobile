import React, { createContext, useContext, useState } from 'react';
import ApiService from '../services/api';

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

    console.log('🔄 Initializing validation states with data:', data);
    console.log('🎫 Attendance info:', data.attendance);

    const newStates = {
      tickets: {},
      food: {},
      activities: {}
    };

    // Handle different QR formats
    if (data.attendees) {
      // Full format with attendees
      data.attendees.forEach((attendee) => {
        // NEW: Backend now provides isCheckedIn directly on each attendee
        const hasCheckedIn = attendee.isCheckedIn || false;
        newStates.tickets[attendee.index] = hasCheckedIn;
        console.log(`👤 Attendee ${attendee.index} (${attendee.datosPersonales?.nombreCompleto}): checked in = ${hasCheckedIn}${hasCheckedIn ? ` at ${attendee.checkedInAt}` : ''}`);
      });
    } else if (data.tickets && typeof data.tickets === 'number') {
      // Simple format with just ticket count
      for (let i = 0; i < data.tickets; i++) {
        let hasCheckedIn = false;
        // NEW: Backend now uses attendeeIndex in checkedIn array
        if (data.attendance?.checkedIn && Array.isArray(data.attendance.checkedIn)) {
          hasCheckedIn = data.attendance.checkedIn.some(checkedIn => checkedIn.attendeeIndex === i);
        }
        newStates.tickets[i] = hasCheckedIn;
        console.log(`🎫 Ticket ${i}: checked in = ${hasCheckedIn}`);
      }
    }

    // Initialize food validation states (remaining quantity)
    // API returns 'products' with new cantidadDisponible field
    if (data.products && Array.isArray(data.products)) {
      data.products.forEach((item) => {
        // NEW: Use cantidadDisponible from backend (cantidadComprada - cantidadCanjeada)
        newStates.food[item.id] = item.cantidadDisponible || 0;
        console.log(`🍽️ Product ${item.nombre}: ${item.cantidadDisponible} available (${item.cantidadComprada} bought, ${item.cantidadCanjeada} redeemed)`);
      });
    }

    // Initialize activity validation states (remaining quantity)
    // API returns 'activities' with new cantidadDisponible field
    if (data.activities && Array.isArray(data.activities)) {
      data.activities.forEach((item) => {
        // NEW: Use cantidadDisponible from backend (cantidadComprada - cantidadCanjeada)
        newStates.activities[item.id] = item.cantidadDisponible || 0;
        console.log(`🎯 Activity ${item.nombreActividad}: ${item.cantidadDisponible} available (${item.cantidadComprada} bought, ${item.cantidadCanjeada} redeemed)`);
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

  // API Integration Methods
  
  // Check-in attendees via API
  const checkInAttendeesAPI = async (attendeeIndexes) => {
    try {
      const saleNumber = qrData?.saleNumber || qrData?.saleId;
      if (!saleNumber) {
        throw new Error('No sale number available');
      }

      const result = await ApiService.checkInAttendees(saleNumber, attendeeIndexes);
      
      if (result.success) {
        console.log('✅ Check-in API successful, updating local state for indexes:', attendeeIndexes);
        console.log('🔍 API result data:', result.data);
        console.log('🔍 New check-ins:', result.data.newCheckIns);
        console.log('🔍 Total checked in:', result.data.totalCheckedIn);
        
        // Update local state based on the backend response
        // Only mark as entered the attendees that were actually checked in (newCheckIns)
        if (result.data.checkedInAttendees && Array.isArray(result.data.checkedInAttendees)) {
          result.data.checkedInAttendees.forEach(checkedInData => {
            console.log(`📝 Marking attendee ${checkedInData.index} as entered (from backend response)`);
            markAttendeeEntered(checkedInData.index);
          });
        } else {
          // Fallback: mark all requested indexes as entered
          attendeeIndexes.forEach(index => {
            console.log(`📝 Marking attendee ${index} as entered locally (fallback)`);
            markAttendeeEntered(index);
          });
        }
        
        console.log('✅ Local state updated, current validation states:', validationStates);
        return result;
      } else {
        throw new Error(result.message || 'Check-in failed');
      }
    } catch (error) {
      console.error('❌ Check-in API error:', error);
      throw error;
    }
  };

  // Redeem products via API
  const redeemProductsAPI = async (redemptions) => {
    try {
      const saleNumber = qrData?.saleNumber || qrData?.saleId;
      if (!saleNumber) {
        throw new Error('No sale number available');
      }

      const result = await ApiService.redeemProducts(saleNumber, redemptions);
      
      if (result.success) {
        // Update local state to reflect the redemptions
        redemptions.forEach(redemption => {
          redeemFoodItem(redemption.itemId, redemption.cantidad);
        });
        return result;
      } else {
        throw new Error(result.message || 'Products redemption failed');
      }
    } catch (error) {
      console.error('❌ Products redemption API error:', error);
      throw error;
    }
  };

  // Redeem activities via API
  const redeemActivitiesAPI = async (redemptions) => {
    try {
      const saleNumber = qrData?.saleNumber || qrData?.saleId;
      if (!saleNumber) {
        throw new Error('No sale number available');
      }

      const result = await ApiService.redeemActivities(saleNumber, redemptions);
      
      if (result.success) {
        // Update local state to reflect the redemptions
        redemptions.forEach(redemption => {
          redeemActivityItem(redemption.itemId, redemption.cantidad);
        });
        return result;
      } else {
        throw new Error(result.message || 'Activities redemption failed');
      }
    } catch (error) {
      console.error('❌ Activities redemption API error:', error);
      throw error;
    }
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
    getValidationSummary,
    // API methods
    checkInAttendeesAPI,
    redeemProductsAPI,
    redeemActivitiesAPI
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
