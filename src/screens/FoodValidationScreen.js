import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useQR } from '../context/QRContext';

const FoodValidationScreen = ({ navigation }) => {
  const { qrData, validationStates, redeemFoodItem, redeemProductsAPI } = useQR();
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [showQuantityModal, setShowQuantityModal] = useState(false);

  const handleGoBack = () => {
    navigation.goBack();
  };

  // Get all food items (including drinks since they're grouped together)
  // API returns products array instead of food.items
  const foodItems = qrData?.products || [];

  const handleQuantitySelector = (item) => {
    const remainingQuantity = item.cantidadDisponible || 0;
    
    if (remainingQuantity <= 0) {
      Alert.alert(
        'Sin stock',
        `No quedan unidades de ${item.nombre} para canjear.`,
        [{ text: 'OK' }]
      );
      return;
    }

    setSelectedItem(item);
    setSelectedQuantity(1);
    setShowQuantityModal(true);
  };

  const handleConfirmRedeem = async () => {
    if (!selectedItem || selectedQuantity <= 0) return;

    Alert.alert(
      'Confirmar canje',
      `¿Confirmar canje de ${selectedQuantity} unidad${selectedQuantity !== 1 ? 'es' : ''} de ${selectedItem.nombre}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Confirmar',
          style: 'default',
          onPress: async () => {
            try {
              console.log('🍽️ Redeeming product via API:', { itemId: selectedItem.id, cantidad: selectedQuantity });
              
              // Call API to redeem product
              await redeemProductsAPI([{
                itemId: selectedItem.id,
                cantidad: selectedQuantity
              }]);
              
              Alert.alert(
                'Canje exitoso',
                `Se han canjeado ${selectedQuantity} unidad${selectedQuantity !== 1 ? 'es' : ''} de ${selectedItem.nombre}.`,
                [{ text: 'OK' }]
              );
              
              // Close modal
              setShowQuantityModal(false);
              setSelectedItem(null);
              setSelectedQuantity(1);
            } catch (error) {
              console.error('❌ Error redeeming product:', error);
              Alert.alert(
                'Error',
                `No se pudo canjear ${selectedItem.nombre}. ${error.message}`,
                [{ text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  };

  const generateQuantityOptions = (maxQuantity) => {
    const options = [];
    for (let i = 1; i <= maxQuantity; i++) {
      options.push(i);
    }
    return options;
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

  // Calculate summary using new backend fields
  const totalItems = foodItems.reduce((sum, item) => sum + (item.cantidadComprada || 0), 0);
  const redeemedItems = foodItems.reduce((sum, item) => sum + (item.cantidadCanjeada || 0), 0);
  const totalProductsValue = foodItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);

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
              <Text style={styles.summaryLabel}>Total productos:</Text>
              <Text style={[styles.summaryValue, styles.totalValue]}>
                ${totalProductsValue.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Food Items List */}
          <View style={styles.itemsContainer}>
            <Text style={styles.sectionTitle}>🍽️ Lista de Productos</Text>
            
            {foodItems.map((item) => {
              // NEW: Use backend calculated fields instead of local state
              const purchasedQuantity = item.cantidadComprada || 0;
              const redeemedQuantity = item.cantidadCanjeada || 0;
              const remainingQuantity = item.cantidadDisponible || 0;
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
                      <TouchableOpacity 
                        style={styles.quantitySelectorButton}
                        onPress={() => handleQuantitySelector(item)}
                      >
                        <View style={styles.quantitySelectorContent}>
                          <Text style={styles.quantitySelectorText}>Seleccionar cantidad</Text>
                          <Text style={styles.quantitySelectorIcon}>▼</Text>
                        </View>
                      </TouchableOpacity>
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

      {/* Quantity Selection Modal */}
      <Modal
        visible={showQuantityModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowQuantityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccionar Cantidad</Text>
            <Text style={styles.modalSubtitle}>
              {selectedItem?.nombre} - Máximo: {selectedItem?.cantidadDisponible || 0}
            </Text>
            
            <View style={styles.quantityOptionsContainer}>
              <ScrollView style={styles.quantityScrollView} showsVerticalScrollIndicator={false}>
                {selectedItem && generateQuantityOptions(selectedItem.cantidadDisponible || 0).map((quantity) => (
                  <TouchableOpacity
                    key={quantity}
                    style={[
                      styles.quantityOption,
                      selectedQuantity === quantity && styles.selectedQuantityOption
                    ]}
                    onPress={() => setSelectedQuantity(quantity)}
                  >
                    <Text style={[
                      styles.quantityOptionText,
                      selectedQuantity === quantity && styles.selectedQuantityOptionText
                    ]}>
                      {quantity} unidad{quantity !== 1 ? 'es' : ''}
                    </Text>
                    {selectedQuantity === quantity && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowQuantityModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.redeemButton}
                onPress={handleConfirmRedeem}
              >
                <Text style={styles.redeemButtonText}>Canjear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  quantitySelectorButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    minWidth: 200,
  },
  quantitySelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantitySelectorText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  quantitySelectorIcon: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 8,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    margin: 20,
    maxHeight: '80%',
    minWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  quantityOptionsContainer: {
    maxHeight: 300,
    marginBottom: 20,
  },
  quantityScrollView: {
    maxHeight: 250,
  },
  quantityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 5,
    backgroundColor: '#F9FAFB',
  },
  selectedQuantityOption: {
    backgroundColor: '#3B82F6',
  },
  quantityOptionText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  selectedQuantityOptionText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#6B7280',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  redeemButton: {
    flex: 1,
    backgroundColor: '#059669',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  redeemButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
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
