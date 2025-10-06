import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import StorageService from '../services/storage';

const WelcomeScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [validatorData, setValidatorData] = useState(null);
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await StorageService.getUserData();
      if (user) {
        setUserData(user);
        // Extract validator and event data from the new response structure
        if (user.validator) {
          setValidatorData(user.validator);
        }
        if (user.evento) {
          setEventData(user.evento);
        }
        console.log('✅ User data loaded:', user);
      } else {
        console.log('❌ No user data found, redirecting to login');
        navigation.replace('Login');
      }
    } catch (error) {
      console.error('❌ Error loading user data:', error);
      navigation.replace('Login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearUserData();
              console.log('✅ User logged out successfully');
              navigation.replace('Login');
            } catch (error) {
              console.error('❌ Error during logout:', error);
              Alert.alert('Error', 'Error al cerrar sesión');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" backgroundColor="#1B2735" />
        <ActivityIndicator size="large" color="#2E7CE4" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#1B2735" />
      
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.welcomeTitle}>¡Bienvenido!</Text>
            <Text style={styles.userName}>
              {validatorData?.nombre || 'Validador'}
            </Text>
            <Text style={styles.userType}>
              {validatorData?.rol || 'Validador'}
            </Text>
          </View>

          {/* Event Information Card */}
          {eventData && (
            <View style={styles.eventCard}>
              <Text style={styles.eventCardTitle}>🎫 Evento Asignado</Text>
              
              {/* Event Banner */}
              {eventData.informacionGeneral?.bannerPromocional && (
                <Image 
                  source={{ uri: eventData.informacionGeneral.bannerPromocional }}
                  style={styles.eventBanner}
                  resizeMode="cover"
                />
              )}
              
              {/* Event Name */}
              <Text style={styles.eventName}>
                {eventData.informacionGeneral?.nombreEvento || 'Sin nombre'}
              </Text>
              
              {/* Event Description */}
              <Text style={styles.eventDescription}>
                {eventData.informacionGeneral?.descripcion || 'Sin descripción'}
              </Text>
              
              {/* Event Details */}
              <View style={styles.eventDetailsContainer}>
                <View style={styles.eventDetailRow}>
                  <Text style={styles.eventDetailIcon}>📅</Text>
                  <View style={styles.eventDetailContent}>
                    <Text style={styles.eventDetailLabel}>Fecha</Text>
                    <Text style={styles.eventDetailValue}>
                      {eventData.informacionGeneral?.fechaEvento || 'No especificada'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.eventDetailRow}>
                  <Text style={styles.eventDetailIcon}>⏰</Text>
                  <View style={styles.eventDetailContent}>
                    <Text style={styles.eventDetailLabel}>Horario</Text>
                    <Text style={styles.eventDetailValue}>
                      {eventData.informacionGeneral?.horaInicio && eventData.informacionGeneral?.horaTermino
                        ? `${eventData.informacionGeneral.horaInicio} - ${eventData.informacionGeneral.horaTermino}`
                        : 'No especificado'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.eventDetailRow}>
                  <Text style={styles.eventDetailIcon}>📍</Text>
                  <View style={styles.eventDetailContent}>
                    <Text style={styles.eventDetailLabel}>Lugar</Text>
                    <Text style={styles.eventDetailValue}>
                      {eventData.informacionGeneral?.lugarEvento || 'No especificado'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Validator Info */}
          {validatorData && (
            <View style={styles.validatorInfoCard}>
              <Text style={styles.infoTitle}>Información del Validador</Text>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Nombre:</Text>
                <Text style={styles.infoValue}>
                  {validatorData.nombre || 'No disponible'}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Correo:</Text>
                <Text style={styles.infoValue}>
                  {validatorData.correo || 'No disponible'}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>RUT:</Text>
                <Text style={styles.infoValue}>
                  {validatorData.rut || 'No disponible'}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Estado:</Text>
                <Text style={[styles.infoValue, styles.statusValue]}>
                  {validatorData.estado || 'No disponible'}
                </Text>
              </View>
              
              {validatorData.permisos && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Permisos:</Text>
                  <Text style={styles.infoValue}>
                    {validatorData.permisos.activos || 0} de {validatorData.permisos.total || 0}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Status Card */}
          <View style={styles.statusCard}>
            <View style={styles.statusContainer}>
              <View style={styles.statusIndicator} />
              <Text style={styles.statusText}>Conectado correctamente</Text>
            </View>
            <Text style={styles.statusDescription}>
              Listo para validar entradas del evento
            </Text>
          </View>

          {/* Events List Button */}
          <View style={styles.scannerButtonContainer}>
            <TouchableOpacity 
              style={styles.scannerButton}
              onPress={() => navigation.navigate('EventsList')}
            >
              <View style={styles.scannerButtonIcon}>
                <Text style={styles.scannerButtonIconText}>🎫</Text>
              </View>
              <View style={styles.scannerButtonContent}>
                <Text style={styles.scannerButtonTitle}>Ver Mis Eventos</Text>
                <Text style={styles.scannerButtonDescription}>
                  Seleccionar evento para validar entradas
                </Text>
              </View>
              <Text style={styles.scannerButtonArrow}>→</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
            </TouchableOpacity>
            
            <Text style={styles.footerText}>
              ✅ Escáner QR implementado - Listo para validar
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1B2735',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 10,
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  userName: {
    fontSize: 20,
    color: '#E5E7EB',
    marginBottom: 5,
  },
  userType: {
    fontSize: 14,
    color: '#9CA3AF',
    backgroundColor: 'rgba(46, 124, 228, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  // Event Card Styles
  eventCard: {
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
  eventCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 15,
    textAlign: 'center',
  },
  eventBanner: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  eventName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B2735',
    textAlign: 'center',
    marginBottom: 10,
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
  // Validator Info Card
  validatorInfoCard: {
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
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 15,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#374151',
    flex: 2,
    textAlign: 'right',
  },
  statusValue: {
    color: '#F59E0B',
    fontWeight: '600',
  },
  // Status Card
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
  // QR Scanner Button
  scannerButtonContainer: {
    marginBottom: 20,
  },
  scannerButton: {
    backgroundColor: 'rgba(46, 124, 228, 0.95)',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
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
  scannerButtonIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  scannerButtonIconText: {
    fontSize: 24,
  },
  scannerButtonContent: {
    flex: 1,
  },
  scannerButtonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  scannerButtonDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  scannerButtonArrow: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  // Footer
  footer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 30,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default WelcomeScreen;

