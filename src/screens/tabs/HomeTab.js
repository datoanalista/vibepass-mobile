import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import StorageService from '../../services/storage';

const HomeTab = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  // Reload data when returning from event selection
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadUserData();
    });

    return unsubscribe;
  }, [navigation]);

  const loadUserData = async () => {
    try {
      const user = await StorageService.getUserData();
      const eventId = await StorageService.getSelectedEvent();
      
      if (user) {
        setUserData(user);
        setSelectedEventId(eventId);
        
        // Find the selected event details
        if (eventId && user.eventos) {
          const event = user.eventos.find(e => e.id === eventId);
          setSelectedEvent(event);
        }
        
        console.log('✅ User data loaded:', user);
        console.log('🎪 Selected event ID:', eventId);
      }
    } catch (error) {
      console.error('❌ Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEvent = () => {
    if (userData?.eventos && userData.eventos.length > 1) {
      navigation.navigate('EventSelection', { 
        eventos: userData.eventos,
        returnToHome: true 
      });
    } else {
      Alert.alert('Información', 'Solo tiene un evento asignado');
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
            <View style={styles.logoContainer}>
              <Image
                source={require('../../../assets/vibepass_logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Current Event Info */}
          {selectedEvent && (
            <View style={styles.currentEventCard}>
              <Text style={styles.currentEventTitle}>🎪 Evento Activo</Text>
              
              <View style={styles.currentEventInfoRow}>
                <Text style={styles.currentEventInfoLabel}>Evento:</Text>
                <Text style={styles.currentEventInfoValue}>
                  {selectedEvent.informacionGeneral?.nombreEvento || 'Sin nombre'}
                </Text>
              </View>
              
              <View style={styles.currentEventInfoRow}>
                <Text style={styles.currentEventInfoLabel}>Fecha:</Text>
                <Text style={styles.currentEventInfoValue}>
                  {formatDate(selectedEvent.informacionGeneral?.fechaEvento)}
                </Text>
              </View>
              
              {selectedEvent.informacionGeneral?.lugarEvento && (
                <View style={styles.currentEventInfoRow}>
                  <Text style={styles.currentEventInfoLabel}>Lugar:</Text>
                  <Text style={styles.currentEventInfoValue}>
                    {selectedEvent.informacionGeneral.lugarEvento}
                  </Text>
                </View>
              )}
              
              <View style={styles.currentEventInfoRow}>
                <Text style={styles.currentEventInfoLabel}>Estado:</Text>
                <Text style={[styles.currentEventInfoValue, styles.currentEventStatusValue]}>
                  {selectedEvent.informacionGeneral?.estado === 'en_curso' ? 'En Curso' : 
                   selectedEvent.informacionGeneral?.estado === 'programado' ? 'Programado' :
                   selectedEvent.informacionGeneral?.estado || 'Sin estado'}
                </Text>
              </View>

              {userData?.eventos && userData.eventos.length > 1 && (
                <TouchableOpacity 
                  style={styles.changeEventButton}
                  onPress={handleChangeEvent}
                >
                  <Text style={styles.changeEventButtonText}>Cambiar Evento</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

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

          {/* Events Link */}
          <View style={styles.eventsLinkContainer}>
            <TouchableOpacity 
              style={styles.eventsLink} 
              onPress={() => navigation.navigate('Events')}
            >
              <Text style={styles.eventsLinkText}>Ir a Eventos asignados</Text>
            </TouchableOpacity>
          </View>

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
    paddingBottom: 100, // Extra padding to account for fixed tab bar
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 200,
    height: 80,
  },
  // Current Event Card
  currentEventCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.95)',
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
  changeEventButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 15,
    alignItems: 'center',
  },
  changeEventButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
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
  // Current Event specific styles
  currentEventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
    textAlign: 'center',
  },
  currentEventInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  currentEventInfoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    flex: 1,
  },
  currentEventInfoValue: {
    fontSize: 14,
    color: '#FFFFFF',
    flex: 2,
    textAlign: 'right',
  },
  currentEventStatusValue: {
    color: '#FFFFFF',
    fontWeight: '600',
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
  eventsLinkContainer: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  eventsLink: {
    backgroundColor: '#2E7CE4',
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
  eventsLinkText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutContainer: {
    alignItems: 'center',
    paddingTop: 10,
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
