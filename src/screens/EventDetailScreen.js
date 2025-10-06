import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

const EventDetailScreen = ({ navigation, route }) => {
  const { event } = route.params;

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleStartValidation = () => {
    // Navigate to QR Scanner with event context
    navigation.navigate('QRScanner', { selectedEvent: event });
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      const months = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
      ];
      
      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      
      return `${day} de ${month} de ${year}`;
    } catch (error) {
      return dateString;
    }
  };

  // Format time function
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    
    try {
      const [hours, minutes] = timeString.split(':');
      return `${hours}:${minutes}`;
    } catch (error) {
      return timeString;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#1B2735" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Text style={styles.backButtonIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Detalle del Evento</Text>
          <Text style={styles.headerSubtitle}>Información completa</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Event Banner */}
          {event.informacionGeneral?.bannerPromocional && (
            <View style={styles.bannerContainer}>
              <Image 
                source={{ uri: event.informacionGeneral.bannerPromocional }}
                style={styles.eventBanner}
                resizeMode="cover"
              />
            </View>
          )}
          
          {/* Event Information Card */}
          <View style={styles.eventInfoCard}>
            <Text style={styles.eventName}>
              {event.informacionGeneral?.nombreEvento || 'Sin nombre'}
            </Text>
            
            <Text style={styles.eventDescription}>
              {event.informacionGeneral?.descripcion || 'Sin descripción'}
            </Text>
            
            <View style={styles.eventDetailsContainer}>
              <View style={styles.eventDetailRow}>
                <Text style={styles.eventDetailIcon}>📅</Text>
                <View style={styles.eventDetailContent}>
                  <Text style={styles.eventDetailLabel}>Fecha</Text>
                  <Text style={styles.eventDetailValue}>
                    {formatDate(event.informacionGeneral?.fechaEvento)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.eventDetailRow}>
                <Text style={styles.eventDetailIcon}>⏰</Text>
                <View style={styles.eventDetailContent}>
                  <Text style={styles.eventDetailLabel}>Horario</Text>
                  <Text style={styles.eventDetailValue}>
                    {event.informacionGeneral?.horaInicio && event.informacionGeneral?.horaTermino
                      ? `${formatTime(event.informacionGeneral.horaInicio)} - ${formatTime(event.informacionGeneral.horaTermino)}`
                      : 'No especificado'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.eventDetailRow}>
                <Text style={styles.eventDetailIcon}>📍</Text>
                <View style={styles.eventDetailContent}>
                  <Text style={styles.eventDetailLabel}>Lugar</Text>
                  <Text style={styles.eventDetailValue}>
                    {event.informacionGeneral?.lugarEvento || 'No especificado'}
                  </Text>
                </View>
              </View>
              
              {event.informacionGeneral?.capacidadMaxima && (
                <View style={styles.eventDetailRow}>
                  <Text style={styles.eventDetailIcon}>👥</Text>
                  <View style={styles.eventDetailContent}>
                    <Text style={styles.eventDetailLabel}>Capacidad</Text>
                    <Text style={styles.eventDetailValue}>
                      {event.informacionGeneral.capacidadMaxima} personas
                    </Text>
                  </View>
                </View>
              )}
              
              {event.informacionGeneral?.tipoEvento && (
                <View style={styles.eventDetailRow}>
                  <Text style={styles.eventDetailIcon}>🎭</Text>
                  <View style={styles.eventDetailContent}>
                    <Text style={styles.eventDetailLabel}>Tipo</Text>
                    <Text style={styles.eventDetailValue}>
                      {event.informacionGeneral.tipoEvento}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Event Status Card */}
          <View style={styles.statusCard}>
            <View style={styles.statusContainer}>
              <View style={styles.statusIndicator} />
              <Text style={styles.statusText}>Evento Activo</Text>
            </View>
            <Text style={styles.statusDescription}>
              Listo para validar entradas y canjes
            </Text>
          </View>

          {/* Validation Button */}
          <TouchableOpacity 
            style={styles.validationButton}
            onPress={handleStartValidation}
          >
            <View style={styles.validationButtonIcon}>
              <Text style={styles.validationButtonIconText}>📱</Text>
            </View>
            <View style={styles.validationButtonContent}>
              <Text style={styles.validationButtonTitle}>Iniciar Validación</Text>
              <Text style={styles.validationButtonDescription}>
                Escanear códigos QR para validar entradas
              </Text>
            </View>
            <Text style={styles.validationButtonArrow}>→</Text>
          </TouchableOpacity>

          {/* Additional Info */}
          <View style={styles.additionalInfoCard}>
            <Text style={styles.additionalInfoTitle}>ℹ️ Información Adicional</Text>
            <Text style={styles.additionalInfoText}>
              • Asegúrate de tener una buena conexión a internet{'\n'}
              • Verifica que el código QR esté bien visible{'\n'}
              • Mantén el dispositivo estable al escanear{'\n'}
              • Puedes validar múltiples elementos por compra
            </Text>
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
  bannerContainer: {
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  eventBanner: {
    width: '100%',
    height: 200,
  },
  eventInfoCard: {
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
  eventName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B2735',
    marginBottom: 10,
    textAlign: 'center',
  },
  eventDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  eventDetailsContainer: {
    marginTop: 10,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  eventDetailIcon: {
    fontSize: 20,
    marginRight: 15,
    width: 30,
    textAlign: 'center',
  },
  eventDetailContent: {
    flex: 1,
  },
  eventDetailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 2,
  },
  eventDetailValue: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  statusCard: {
    backgroundColor: 'rgba(217, 217, 217, 0.9)',
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  statusDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  validationButton: {
    backgroundColor: 'rgba(46, 124, 228, 0.95)',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
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
  validationButtonIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  validationButtonIconText: {
    fontSize: 24,
  },
  validationButtonContent: {
    flex: 1,
  },
  validationButtonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  validationButtonDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  validationButtonArrow: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  additionalInfoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  additionalInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 10,
  },
  additionalInfoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});

export default EventDetailScreen;
