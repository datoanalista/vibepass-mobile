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

const ActivityValidationScreen = ({ navigation }) => {
  const { qrData, validationStates, redeemActivityItem, redeemActivitiesAPI } = useQR();

  const handleGoBack = () => {
    navigation.goBack();
  };

  // API returns activities as direct array, not activities.items
  const activityItems = qrData?.activities || [];

  const handleRedeemItem = async (item, quantity = 1) => {
    const remainingQuantity = validationStates.activities[item.id] || 0;
    
    if (remainingQuantity <= 0) {
      Alert.alert(
        'Sin cupos',
        `No quedan cupos de ${item.nombreActividad} para canjear.`,
        [{ text: 'OK' }]
      );
      return;
    }

    const actualQuantity = Math.min(quantity, remainingQuantity);

    Alert.alert(
      'Confirmar canje',
      `¿Confirmar canje de ${actualQuantity} cupo${actualQuantity !== 1 ? 's' : ''} para ${item.nombreActividad}?`,
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
              console.log('🎯 Redeeming activity via API:', { itemId: item.id, cantidad: actualQuantity });
              
              // Call API to redeem activity
              await redeemActivitiesAPI([{
                itemId: item.id,
                cantidad: actualQuantity
              }]);
              
              Alert.alert(
                'Canje exitoso',
                `Se han canjeado ${actualQuantity} cupo${actualQuantity !== 1 ? 's' : ''} para ${item.nombreActividad}.`,
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('❌ Error redeeming activity:', error);
              Alert.alert(
                'Error',
                `No se pudo canjear ${item.nombreActividad}. ${error.message}`,
                [{ text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  };

  const handleRedeemAll = (item) => {
    const remainingQuantity = validationStates.activities[item.id] || 0;
    handleRedeemItem(item, remainingQuantity);
  };

  if (activityItems.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" backgroundColor="#1B2735" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Text style={styles.backButtonIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Validación de Actividades</Text>
            <Text style={styles.headerSubtitle}>Sin actividades registradas</Text>
          </View>
        </View>
        
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🎯</Text>
          <Text style={styles.emptyTitle}>Sin actividades</Text>
          <Text style={styles.emptyDescription}>
            Esta compra no incluye actividades para canjear.
          </Text>
        </View>
      </View>
    );
  }

  // Calculate summary using new backend fields
  const totalItems = activityItems.reduce((sum, item) => sum + (item.cantidadComprada || 0), 0);
  const redeemedItems = activityItems.reduce((sum, item) => sum + (item.cantidadCanjeada || 0), 0);
  const totalActivitiesValue = activityItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#1B2735" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Text style={styles.backButtonIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Validación de Actividades</Text>
          <Text style={styles.headerSubtitle}>
            {redeemedItems} de {totalItems} cupos canjeados
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Summary Card */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>📊 Resumen de Actividades</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total de cupos:</Text>
              <Text style={styles.summaryValue}>{totalItems}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Canjeados:</Text>
              <Text style={[styles.summaryValue, styles.redeemedValue]}>{redeemedItems}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Pendientes:</Text>
              <Text style={[styles.summaryValue, styles.pendingValue]}>
                {totalItems - redeemedItems}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total actividades:</Text>
              <Text style={[styles.summaryValue, styles.totalValue]}>
                ${totalActivitiesValue.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Activity Items List */}
          <View style={styles.itemsContainer}>
            <Text style={styles.sectionTitle}>🎯 Lista de Actividades</Text>
            
            {activityItems.map((item) => {
              // NEW: Use backend calculated fields instead of local state
              const purchasedQuantity = item.cantidadComprada || 0;
              const redeemedQuantity = item.cantidadCanjeada || 0;
              const remainingQuantity = item.cantidadDisponible || 0;
              const isFullyRedeemed = remainingQuantity === 0;
              
              return (
                <View key={item.id} style={styles.itemCard}>
                  <View style={styles.itemInfo}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemName}>{item.nombreActividad}</Text>
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
                        <Text style={styles.detailLabel}>Precio por cupo:</Text>
                        <Text style={styles.detailValue}>${item.precio.toLocaleString()}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Cupos comprados:</Text>
                        <Text style={styles.detailValue}>{purchasedQuantity}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Canjeados:</Text>
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
                          <Text style={styles.redeemOneButtonText}>Canjear 1 cupo</Text>
                        </TouchableOpacity>
                        
                        {remainingQuantity > 1 && (
                          <TouchableOpacity 
                            style={styles.redeemAllButton}
                            onPress={() => handleRedeemAll(item)}
                          >
                            <Text style={styles.redeemAllButtonText}>
                              Canjear todos ({remainingQuantity})
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  )}

                  {isFullyRedeemed && (
                    <View style={styles.completedMessage}>
                      <Text style={styles.completedMessageText}>
                        ✅ Todos los cupos han sido canjeados
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
    color: '#8B5CF6',
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
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
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
    backgroundColor: '#EDE9FE',
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  completeBadgeText: {
    color: '#581C87',
  },
  pendingBadgeText: {
    color: '#92400E',
  },
  itemDetails: {
    backgroundColor: '#FAF5FF',
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
    color: '#8B5CF6',
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
    backgroundColor: '#8B5CF6',
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
    backgroundColor: '#7C3AED',
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
    backgroundColor: '#EDE9FE',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  completedMessageText: {
    color: '#581C87',
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

export default ActivityValidationScreen;
