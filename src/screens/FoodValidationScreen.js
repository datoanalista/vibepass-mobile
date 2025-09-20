import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useQR } from '../context/QRContext';

const FoodValidationScreen = ({ navigation }) => {
  const { qrData, validationStates, redeemFoodItem } = useQR();

  const handleGoBack = () => {
    navigation.goBack();
  };

  // Get all food items (including drinks since they're grouped together)
  // API returns products array instead of food.items
  const foodItems = qrData?.products || [];

  const handleRedeemItem = (item, quantity = 1) => {
    const remainingQuantity = validationStates.food[item.id] || 0;
    
    if (remainingQuantity <= 0) {
      Alert.alert(
        'Sin stock',
        `No quedan unidades de ${item.nombre} para canjear.`,
        [{ text: 'OK' }]
      );
      return;
    }

    const actualQuantity = Math.min(quantity, remainingQuantity);

    Alert.alert(
      'Confirmar canje',
      `¿Confirmar canje de ${actualQuantity} unidad${actualQuantity !== 1 ? 'es' : ''} de ${item.nombre}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Confirmar',
          style: 'default',
          onPress: () => {
            redeemFoodItem(item.id, actualQuantity);
            Alert.alert(
              'Canje exitoso',
              `Se han canjeado ${actualQuantity} unidad${actualQuantity !== 1 ? 'es' : ''} de ${item.nombre}.`,
              [{ text: 'OK' }]
            );
          },
        },
      ]
    );
  };

  const handleRedeemAll = (item) => {
    const remainingQuantity = validationStates.food[item.id] || 0;
    handleRedeemItem(item, remainingQuantity);
  };

  if (foodItems.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" backgroundColor="#1B2735" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Text style={styles.backButtonIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Validación de Alimentos y Bebestibles</Text>
          <Text style={styles.headerSubtitle}>Sin productos registrados</Text>
          </View>
        </View>
        
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🍕</Text>
          <Text style={styles.emptyTitle}>Sin productos</Text>
          <Text style={styles.emptyDescription}>
            Esta compra no incluye alimentos ni bebestibles para canjear.
          </Text>
        </View>
      </View>
    );
  }

  const totalItems = foodItems.reduce((sum, item) => sum + (item.cantidadComprada || item.cantidad || 0), 0);
  const redeemedItems = foodItems.reduce((sum, item) => {
    const remaining = validationStates.food[item.id] || 0;
    const purchased = item.cantidadComprada || item.cantidad || 0;
    return sum + (purchased - remaining);
  }, 0);

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#1B2735" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Text style={styles.backButtonIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Validación de Alimentos y Bebestibles</Text>
          <Text style={styles.headerSubtitle}>
            {redeemedItems} de {totalItems} unidades canjeadas
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Summary Card */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>📊 Resumen de Alimentos y Bebestibles</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total de unidades:</Text>
              <Text style={styles.summaryValue}>{totalItems}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Canjeadas:</Text>
              <Text style={[styles.summaryValue, styles.redeemedValue]}>{redeemedItems}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Pendientes:</Text>
              <Text style={[styles.summaryValue, styles.pendingValue]}>
                {totalItems - redeemedItems}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
              <Text style={[styles.summaryValue, styles.totalValue]}>
                ${qrData?.food?.subtotal?.toLocaleString() || '0'}
              </Text>
            </View>
          </View>

          {/* Food Items List */}
          <View style={styles.itemsContainer}>
            <Text style={styles.sectionTitle}>🍽️ Lista de Productos</Text>
            
            {foodItems.map((item) => {
              const remainingQuantity = validationStates.food[item.id] || 0;
              const purchasedQuantity = item.cantidadComprada || item.cantidad || 0;
              const redeemedQuantity = purchasedQuantity - remainingQuantity;
              const isFullyRedeemed = remainingQuantity === 0;
              
              return (
                <View key={item.id} style={styles.itemCard}>
                  <View style={styles.itemInfo}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemName}>{item.nombre}</Text>
                      <View style={[
                        styles.statusBadge, 
                        isFullyRedeemed ? styles.completeBadge : styles.pendingBadge
                      ]}>
                        <Text style={[
                          styles.statusBadgeText,
                          isFullyRedeemed ? styles.completeBadgeText : styles.pendingBadgeText
                        ]}>
                          {isFullyRedeemed ? '✅ Completo' : '⏳ Pendiente'}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.itemDetails}>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Precio unitario:</Text>
                        <Text style={styles.detailValue}>${item.precio.toLocaleString()}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Cantidad comprada:</Text>
                        <Text style={styles.detailValue}>{purchasedQuantity}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Canjeadas:</Text>
                        <Text style={[styles.detailValue, styles.redeemedText]}>
                          {redeemedQuantity}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Pendientes:</Text>
                        <Text style={[styles.detailValue, styles.pendingText]}>
                          {remainingQuantity}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Subtotal:</Text>
                        <Text style={[styles.detailValue, styles.subtotalText]}>
                          ${item.subtotal.toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {remainingQuantity > 0 && (
                    <View style={styles.itemActions}>
                      <View style={styles.actionButtons}>
                        <TouchableOpacity 
                          style={styles.redeemOneButton}
                          onPress={() => handleRedeemItem(item, 1)}
                        >
                          <Text style={styles.redeemOneButtonText}>Canjear 1</Text>
                        </TouchableOpacity>
                        
                        {remainingQuantity > 1 && (
                          <TouchableOpacity 
                            style={styles.redeemAllButton}
                            onPress={() => handleRedeemAll(item)}
                          >
                            <Text style={styles.redeemAllButtonText}>
                              Canjear todas ({remainingQuantity})
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  )}

                  {isFullyRedeemed && (
                    <View style={styles.completedMessage}>
                      <Text style={styles.completedMessageText}>
                        ✅ Todas las unidades han sido canjeadas
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
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
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 15,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  redeemedValue: {
    color: '#059669',
  },
  pendingValue: {
    color: '#F59E0B',
  },
  totalValue: {
    color: '#059669',
    fontSize: 18,
  },
  itemsContainer: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  itemCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  itemInfo: {
    marginBottom: 15,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  completeBadge: {
    backgroundColor: '#D1FAE5',
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  completeBadgeText: {
    color: '#065F46',
  },
  pendingBadgeText: {
    color: '#92400E',
  },
  itemDetails: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    flex: 1,
  },
  detailValue: {
    fontSize: 12,
    color: '#374151',
    flex: 1,
    textAlign: 'right',
  },
  redeemedText: {
    color: '#059669',
    fontWeight: 'bold',
  },
  pendingText: {
    color: '#F59E0B',
    fontWeight: 'bold',
  },
  subtotalText: {
    color: '#059669',
    fontWeight: 'bold',
    fontSize: 14,
  },
  itemActions: {
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  redeemOneButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  redeemOneButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  redeemAllButton: {
    backgroundColor: '#059669',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  redeemAllButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  completedMessage: {
    backgroundColor: '#D1FAE5',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  completedMessageText: {
    color: '#065F46',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default FoodValidationScreen;
