import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import StorageService from '../../services/storage';

const HomeTab = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await StorageService.getUserData();
      if (user) {
        setUserData(user);
        console.log('✅ User data loaded:', user);
      }
    } catch (error) {
      console.error('❌ Error loading user data:', error);
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
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('❌ Error during logout:', error);
              Alert.alert('Error', 'Error al cerrar sesión');
            }
          },
        },
      ]
    );
  };

  const handleEventPress = (event) => {
    // Navigate directly to QR Scanner with event context
    navigation.navigate('QRScanner', { selectedEvent: event });
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      const months = [
        'ene', 'feb', 'mar', 'abr', 'may', 'jun',
        'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
      ];
      
      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      
      return `${day} de ${month} de ${year}`;
    } catch (error) {
      return dateString;
    }
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
              {userData?.validator?.nombre || 'Validador'}
            </Text>
            <Text style={styles.userType}>
              {userData?.validator?.rol || 'Validador'}
            </Text>
          </View>

          {/* Validator Info */}
          {userData?.validator && (
            <View style={styles.validatorInfoCard}>
              <Text style={styles.infoTitle}>Información del Validador</Text>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Nombre:</Text>
                <Text style={styles.infoValue}>
                  {userData.validator.nombre || 'No disponible'}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Correo:</Text>
                <Text style={styles.infoValue}>
                  {userData.validator.correo || 'No disponible'}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>RUT:</Text>
                <Text style={styles.infoValue}>
                  {userData.validator.rut || 'No disponible'}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Estado:</Text>
                <Text style={[styles.infoValue, styles.statusValue]}>
                  Activo
                </Text>
              </View>
            </View>
          )}

          {/* Events List */}
          {userData?.eventos && userData.eventos.length > 0 && (
            <View style={styles.eventsContainer}>
              <Text style={styles.eventsTitle}>
                🎫 Mis Eventos ({userData.eventos.length})
              </Text>
              
              {userData.eventos.map((event, index) => (
                <TouchableOpacity
                  key={event.id || index}
                  style={styles.eventCard}
                  onPress={() => handleEventPress(event)}
                >
                  <View style={styles.eventContent}>
                    <Text style={styles.eventName}>
                      {event.informacionGeneral?.nombreEvento || 'Sin nombre'}
                    </Text>
                    
                    <View style={styles.eventDetails}>
                      <View style={styles.eventDetailRow}>
                        <Text style={styles.eventDetailIcon}>📅</Text>
                        <Text style={styles.eventDetailText}>
                          {formatDate(event.informacionGeneral?.fechaEvento)}
                        </Text>
                      </View>
                      
                      <View style={styles.eventDetailRow}>
                        <Text style={styles.eventDetailIcon}>📍</Text>
                        <Text style={styles.eventDetailText}>
                          {event.informacionGeneral?.lugarEvento || 'Lugar no especificado'}
                        </Text>
                      </View>
                      
                      <View style={styles.eventDetailRow}>
                        <Text style={styles.eventDetailIcon}>📊</Text>
                        <Text style={styles.eventDetailText}>
                          Estado: {event.informacionGeneral?.estado || 'No especificado'}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.eventFooter}>
                      <Text style={styles.tapToValidate}>Toca para validar entradas</Text>
                      <Text style={styles.arrowIcon}>→</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* No events message */}
          {(!userData?.eventos || userData.eventos.length === 0) && (
            <View style={styles.noEventsContainer}>
              <Text style={styles.noEventsIcon}>📭</Text>
              <Text style={styles.noEventsTitle}>No hay eventos asignados</Text>
              <Text style={styles.noEventsDescription}>
                No tienes eventos asignados en este momento. Contacta al administrador para obtener acceso a eventos.
              </Text>
            </View>
          )}

          {/* Logout Button */}
          <View style={styles.logoutContainer}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
            </TouchableOpacity>
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
  scrollContainer: {
    flex: 1,
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
    color: '#10B981',
    fontWeight: '600',
  },
  // Events Container
  eventsContainer: {
    marginBottom: 20,
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
    textAlign: 'center',
  },
  eventCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden',
  },
  eventContent: {
    padding: 20,
  },
  eventName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B2735',
    marginBottom: 12,
  },
  eventDetails: {
    marginBottom: 15,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventDetailIcon: {
    fontSize: 16,
    marginRight: 10,
    width: 20,
  },
  eventDetailText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  tapToValidate: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
  },
  arrowIcon: {
    fontSize: 18,
    color: '#059669',
    fontWeight: 'bold',
  },
  noEventsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 40,
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
  noEventsIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  noEventsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 10,
    textAlign: 'center',
  },
  noEventsDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  logoutContainer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 30,
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
});

export default HomeTab;
