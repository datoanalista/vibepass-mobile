import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useQR } from '../context/QRContext';

const ValidationMenuScreen = ({ navigation }) => {
  const { qrData, getValidationSummary } = useQR();

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleOptionPress = (option) => {
    switch (option) {
      case 'tickets':
        navigation.navigate('TicketValidation');
        break;
      case 'activities':
        navigation.navigate('ActivityValidation');
        break;
      case 'food':
        navigation.navigate('FoodValidation');
        break;
      case 'drinks':
        navigation.navigate('DrinkValidation');
        break;
      default:
        break;
    }
  };

  const summary = getValidationSummary();

  // Check if each category has items
  const hasTickets = (qrData?.attendees && qrData.attendees.length > 0) || 
                     (qrData?.tickets && qrData.tickets > 0);
  const hasActivities = qrData?.activities?.items && qrData.activities.items.length > 0;
  const hasFoodItems = qrData?.food?.items && qrData.food.items.length > 0;

  // For this implementation, we'll show "Alimentos y Bebestibles" as one category
  // since the backend groups them together in the "food" array
  const hasFood = hasFoodItems;

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#1B2735" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Text style={styles.backButtonIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Validación y canjes</Text>
          <Text style={styles.headerSubtitle}>Selecciona una opción</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Event Info Card */}
          {(qrData?.event || qrData?.evento) && (
            <View style={styles.eventInfoCard}>
              <Text style={styles.eventInfoTitle}>📋 Información de la compra</Text>
              <View style={styles.eventInfoRow}>
                <Text style={styles.eventInfoLabel}>Evento:</Text>
                <Text style={styles.eventInfoValue}>
                  {qrData.event?.nombre || qrData.evento}
                </Text>
              </View>
              <View style={styles.eventInfoRow}>
                <Text style={styles.eventInfoLabel}>Fecha:</Text>
                <Text style={styles.eventInfoValue}>
                  {qrData.event?.fecha || qrData.fecha}
                </Text>
              </View>
              <View style={styles.eventInfoRow}>
                <Text style={styles.eventInfoLabel}>N° Venta:</Text>
                <Text style={styles.eventInfoValue}>
                  {qrData.saleNumber || qrData.saleId || 'N/A'}
                </Text>
              </View>
              <View style={styles.eventInfoRow}>
                <Text style={styles.eventInfoLabel}>Total:</Text>
                <Text style={[styles.eventInfoValue, styles.totalValue]}>
                  ${(qrData.totals?.total || qrData.total || 0).toLocaleString()}
                </Text>
              </View>
            </View>
          )}

          {/* Validation Options */}
          <View style={styles.optionsContainer}>
            {/* Tickets Option */}
            {hasTickets && (
              <TouchableOpacity 
                style={[styles.optionCard, styles.ticketOption]}
                onPress={() => handleOptionPress('tickets')}
              >
                <View style={styles.optionIcon}>
                  <Text style={styles.optionIconText}>🎫</Text>
                </View>
                <Text style={styles.optionTitle}>Validador QR</Text>
                <Text style={styles.optionDescription}>Entradas al evento</Text>
                {summary && (
                  <View style={styles.optionBadge}>
                    <Text style={styles.optionBadgeText}>
                      {summary.tickets.entered}/{summary.tickets.total}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

            {/* Activities Option */}
            {hasActivities && (
              <TouchableOpacity 
                style={[styles.optionCard, styles.activityOption]}
                onPress={() => handleOptionPress('activities')}
              >
                <View style={styles.optionIcon}>
                  <Text style={styles.optionIconText}>🎯</Text>
                </View>
                <Text style={styles.optionTitle}>Atracciones</Text>
                <Text style={styles.optionDescription}>Actividades del evento</Text>
                {summary && (
                  <View style={styles.optionBadge}>
                    <Text style={styles.optionBadgeText}>
                      {summary.activities.redeemed}/{summary.activities.total}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

            {/* Food & Drinks Option (Combined) */}
            {hasFood && (
              <TouchableOpacity 
                style={[styles.optionCard, styles.foodOption]}
                onPress={() => handleOptionPress('food')}
              >
                <View style={styles.optionIcon}>
                  <Text style={styles.optionIconText}>🍽️</Text>
                </View>
                <Text style={styles.optionTitle}>Alimentos y Bebestibles</Text>
                <Text style={styles.optionDescription}>Comida y bebidas del evento</Text>
                <View style={styles.optionBadge}>
                  <Text style={styles.optionBadgeText}>
                    {qrData.food.items.length} item{qrData.food.items.length !== 1 ? 's' : ''}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {/* No items message */}
            {!hasTickets && !hasActivities && !hasFood && (
              <View style={styles.noItemsCard}>
                <Text style={styles.noItemsIcon}>📭</Text>
                <Text style={styles.noItemsTitle}>Sin elementos para validar</Text>
                <Text style={styles.noItemsDescription}>
                  Esta compra no contiene elementos que requieran validación.
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B2735',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#1B2735',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  backButtonIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  eventInfoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  eventInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 15,
    textAlign: 'center',
  },
  eventInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  eventInfoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    flex: 1,
  },
  eventInfoValue: {
    fontSize: 14,
    color: '#374151',
    flex: 2,
    textAlign: 'right',
    fontWeight: '600',
  },
  totalValue: {
    color: '#059669',
    fontSize: 16,
    fontWeight: 'bold',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    position: 'relative',
  },
  ticketOption: {
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  activityOption: {
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  foodOption: {
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  drinkOption: {
    borderLeftWidth: 4,
    borderLeftColor: '#06B6D4',
  },
  optionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  optionIconText: {
    fontSize: 28,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 5,
    textAlign: 'center',
  },
  optionDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 10,
  },
  optionBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  optionBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  noItemsCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  noItemsIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  noItemsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 10,
    textAlign: 'center',
  },
  noItemsDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ValidationMenuScreen;
