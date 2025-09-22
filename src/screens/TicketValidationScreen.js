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

const TicketValidationScreen = ({ navigation }) => {
  const { qrData, validationStates, markAttendeeEntered, checkInAttendeesAPI } = useQR();

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleMarkEntered = async (attendeeIndex, attendeeName) => {
    Alert.alert(
      'Confirmar entrada',
      `¿Confirmar entrada de ${attendeeName}?`,
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
              console.log('🎫 Marking attendee as entered via API:', attendeeIndex);
              
              // Call API to check-in attendee
              await checkInAttendeesAPI([attendeeIndex]);
              
              Alert.alert(
                'Entrada confirmada',
                `${attendeeName} ha ingresado al evento.`,
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('❌ Error checking in attendee:', error);
              Alert.alert(
                'Error',
                `No se pudo registrar la entrada de ${attendeeName}. ${error.message}`,
                [{ text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  };


  // Check if we have attendees or just ticket count
  const hasAttendees = qrData?.attendees && qrData.attendees.length > 0;
  const hasTicketCount = qrData?.tickets && qrData.tickets > 0;
  
  if (!hasAttendees && !hasTicketCount) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" backgroundColor="#1B2735" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Text style={styles.backButtonIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Validación de Entradas</Text>
            <Text style={styles.headerSubtitle}>Sin asistentes registrados</Text>
          </View>
        </View>
        
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🎫</Text>
          <Text style={styles.emptyTitle}>Sin entradas</Text>
          <Text style={styles.emptyDescription}>
            Esta compra no incluye entradas al evento.
          </Text>
        </View>
      </View>
    );
  }

  // Calculate totals based on available data
  const totalAttendees = hasAttendees ? qrData.attendees.length : (qrData.tickets || 0);
  const enteredAttendees = Object.values(validationStates.tickets).filter(Boolean).length;
  
  // Create mock attendees if we only have ticket count
  const attendeesToShow = hasAttendees ? qrData.attendees : 
    Array.from({ length: qrData.tickets }, (_, index) => ({
      index,
      tipoEntrada: 'General',
      datosPersonales: {
        nombreCompleto: `Asistente ${index + 1}`,
        rut: 'No disponible',
        telefono: 'No disponible',
        correo: 'No disponible'
      }
    }));

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#1B2735" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Text style={styles.backButtonIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Validación de Entradas</Text>
          <Text style={styles.headerSubtitle}>
            {enteredAttendees} de {totalAttendees} asistentes han ingresado
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Warning for simple format */}
          {qrData?.isSimpleFormat && (
            <View style={styles.warningCard}>
              <Text style={styles.warningTitle}>⚠️ Información limitada</Text>
              <Text style={styles.warningText}>
                {qrData.errorMessage || 'Mostrando información básica del QR. Los datos detallados de asistentes no están disponibles.'}
              </Text>
            </View>
          )}

          {/* Summary Card */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>📊 Resumen de Entradas</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total de asistentes:</Text>
              <Text style={styles.summaryValue}>{totalAttendees}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Han ingresado:</Text>
              <Text style={[styles.summaryValue, styles.enteredValue]}>{enteredAttendees}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Pendientes:</Text>
              <Text style={[styles.summaryValue, styles.pendingValue]}>
                {totalAttendees - enteredAttendees}
              </Text>
            </View>
          </View>

          {/* Attendees List */}
          <View style={styles.attendeesContainer}>
            <Text style={styles.sectionTitle}>👥 Lista de Asistentes</Text>
            
            {attendeesToShow.map((attendee, index) => {
              const hasEntered = validationStates.tickets[attendee.index] || false;
              
              return (
                <View key={attendee.index} style={styles.attendeeCard}>
                  <View style={styles.attendeeInfo}>
                    <View style={styles.attendeeHeader}>
                      <Text style={styles.attendeeName}>
                        {attendee.datosPersonales.nombreCompleto}
                      </Text>
                    </View>
                    
                    <View style={styles.attendeeDetails}>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>RUT:</Text>
                        <Text style={styles.detailValue}>{attendee.datosPersonales.rut}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Tipo entrada:</Text>
                        <Text style={styles.detailValue}>{attendee.tipoEntrada}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Correo:</Text>
                        <Text style={styles.detailValue}>{attendee.datosPersonales.correo}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Teléfono:</Text>
                        <Text style={styles.detailValue}>{attendee.datosPersonales.telefono}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.attendeeActions}>
                    {!hasEntered ? (
                      <TouchableOpacity 
                        style={styles.enterButton}
                        onPress={() => handleMarkEntered(attendee.index, attendee.datosPersonales.nombreCompleto)}
                      >
                        <Text style={styles.enterButtonText}>✅ Marcar entrada</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.alreadyEnteredContainer}>
                        <Text style={styles.alreadyEnteredText}>
                          ✅ Asistente ya ha ingresado al evento
                        </Text>
                      </View>
                    )}
                  </View>
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
  warningCard: {
    backgroundColor: 'rgba(251, 191, 36, 0.95)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 8,
    textAlign: 'center',
  },
  warningText: {
    fontSize: 12,
    color: '#92400E',
    textAlign: 'center',
    lineHeight: 16,
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
  enteredValue: {
    color: '#059669',
  },
  pendingValue: {
    color: '#F59E0B',
  },
  attendeesContainer: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  attendeeCard: {
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
  attendeeInfo: {
    marginBottom: 15,
  },
  attendeeHeader: {
    marginBottom: 15,
  },
  attendeeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  attendeeDetails: {
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
    flex: 2,
    textAlign: 'right',
  },
  attendeeActions: {
    alignItems: 'center',
  },
  enterButton: {
    backgroundColor: '#059669',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 30,
    minWidth: 150,
  },
  enterButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
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
  alreadyEnteredContainer: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  alreadyEnteredText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default TicketValidationScreen;
