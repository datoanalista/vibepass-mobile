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
import ApiService from '../services/api';
import StorageService from '../services/storage';

const EventsListScreen = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load user data
      const user = await StorageService.getUserData();
      if (user) {
        setUserData(user);
      }

      // Load events
      const result = await ApiService.getValidatorEvents();
      if (result.success && result.data) {
        setEvents(result.data);
        console.log('✅ Events loaded:', result.data);
      } else {
        throw new Error(result.message || 'Failed to load events');
      }
    } catch (error) {
      console.error('❌ Error loading data:', error);
      Alert.alert(
        'Error',
        'No se pudieron cargar los eventos. Por favor, inténtalo de nuevo.',
        [
          {
            text: 'Reintentar',
            onPress: loadData,
          },
          {
            text: 'Volver',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEventPress = (event) => {
    navigation.navigate('EventDetail', { event });
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" backgroundColor="#1B2735" />
        <ActivityIndicator size="large" color="#2E7CE4" />
        <Text style={styles.loadingText}>Cargando eventos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#1B2735" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Mis Eventos</Text>
          <Text style={styles.headerSubtitle}>
            {userData?.nombreCompleto || 'Validador'}
          </Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Salir</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Events List */}
          {events.length > 0 ? (
            <View style={styles.eventsContainer}>
              <Text style={styles.eventsTitle}>
                🎫 {events.length} evento{events.length !== 1 ? 's' : ''} asignado{events.length !== 1 ? 's' : ''}
              </Text>
              
              {events.map((event, index) => (
                <TouchableOpacity
                  key={event._id || index}
                  style={styles.eventCard}
                  onPress={() => handleEventPress(event)}
                >
                  {/* Event Banner */}
                  {event.informacionGeneral?.bannerPromocional && (
                    <Image 
                      source={{ uri: event.informacionGeneral.bannerPromocional }}
                      style={styles.eventBanner}
                      resizeMode="cover"
                    />
                  )}
                  
                  <View style={styles.eventContent}>
                    <Text style={styles.eventName}>
                      {event.informacionGeneral?.nombreEvento || 'Sin nombre'}
                    </Text>
                    
                    <Text style={styles.eventDescription}>
                      {event.informacionGeneral?.descripcion || 'Sin descripción'}
                    </Text>
                    
                    <View style={styles.eventDetails}>
                      <View style={styles.eventDetailRow}>
                        <Text style={styles.eventDetailIcon}>📅</Text>
                        <Text style={styles.eventDetailText}>
                          {formatDate(event.informacionGeneral?.fechaEvento)}
                        </Text>
                      </View>
                      
                      <View style={styles.eventDetailRow}>
                        <Text style={styles.eventDetailIcon}>⏰</Text>
                        <Text style={styles.eventDetailText}>
                          {event.informacionGeneral?.horaInicio && event.informacionGeneral?.horaTermino
                            ? `${formatTime(event.informacionGeneral.horaInicio)} - ${formatTime(event.informacionGeneral.horaTermino)}`
                            : 'Horario no especificado'}
                        </Text>
                      </View>
                      
                      <View style={styles.eventDetailRow}>
                        <Text style={styles.eventDetailIcon}>📍</Text>
                        <Text style={styles.eventDetailText}>
                          {event.informacionGeneral?.lugarEvento || 'Lugar no especificado'}
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
          ) : (
            <View style={styles.noEventsContainer}>
              <Text style={styles.noEventsIcon}>📭</Text>
              <Text style={styles.noEventsTitle}>No hay eventos asignados</Text>
              <Text style={styles.noEventsDescription}>
                No tienes eventos asignados en este momento. Contacta al administrador para obtener acceso a eventos.
              </Text>
            </View>
          )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#1B2735',
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
  logoutButton: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  eventsContainer: {
    marginTop: 10,
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  eventCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    marginBottom: 20,
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
  eventBanner: {
    width: '100%',
    height: 150,
  },
  eventContent: {
    padding: 20,
  },
  eventName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B2735',
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 15,
    lineHeight: 20,
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
    marginTop: 50,
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
});

export default EventsListScreen;
