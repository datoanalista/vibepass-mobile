import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import StorageService from '../../services/storage';

const EventsTab = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [groupedEvents, setGroupedEvents] = useState({});

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await StorageService.getUserData();
      if (user) {
        setUserData(user);
        groupEventsByStatus(user.eventos || []);
        console.log('✅ User data loaded:', user);
      }
    } catch (error) {
      console.error('❌ Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupEventsByStatus = (events) => {
    const grouped = {};
    
    events.forEach(event => {
      const status = event.informacionGeneral?.estado || 'sin_estado';
      
      if (!grouped[status]) {
        grouped[status] = [];
      }
      grouped[status].push(event);
    });
    
    setGroupedEvents(grouped);
  };

  const handleEventPress = (event) => {
    // Navigate to event detail view
    navigation.navigate('EventDetail', { event });
  };

  const getStatusDisplayName = (status) => {
    const statusMap = {
      'programado': 'Programados',
      'en_curso': 'En Curso',
      'finalizado': 'Finalizados',
      'cancelado': 'Cancelados',
      'sin_estado': 'Sin Estado'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'programado': '#3B82F6',
      'en_curso': '#10B981',
      'finalizado': '#6B7280',
      'cancelado': '#EF4444',
      'sin_estado': '#9CA3AF'
    };
    return colorMap[status] || '#9CA3AF';
  };

  const isEventInProgress = (event) => {
    return event.informacionGeneral?.estado === 'en_curso';
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
        <Text style={styles.loadingText}>Cargando eventos...</Text>
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
            <Text style={styles.headerTitle}>Mis Eventos</Text>
            <Text style={styles.headerSubtitle}>
              {userData?.totalEventos || 0} evento{(userData?.totalEventos || 0) !== 1 ? 's' : ''} asignado{(userData?.totalEventos || 0) !== 1 ? 's' : ''}
            </Text>
          </View>

          {/* Events grouped by status */}
          {Object.keys(groupedEvents).length > 0 ? (
            <View style={styles.eventsContainer}>
              {Object.entries(groupedEvents).map(([status, events]) => (
                <View key={status} style={styles.statusGroup}>
                  <View style={styles.statusHeader}>
                    <Text style={[styles.statusTitle, { color: getStatusColor(status) }]}>
                      {getStatusDisplayName(status)}
                    </Text>
                    <Text style={styles.statusCount}>
                      {events.length} evento{events.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  
                  {events.map((event, index) => (
                    <TouchableOpacity
                      key={event.id || index}
                      style={[
                        styles.eventCard,
                        isEventInProgress(event) && styles.eventCardInProgress
                      ]}
                      onPress={() => handleEventPress(event)}
                    >
                      {isEventInProgress(event) && (
                        <View style={styles.inProgressIndicator}>
                          <Text style={styles.inProgressText}>EN CURSO</Text>
                        </View>
                      )}
                      
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
                            <Text style={[
                              styles.eventDetailText,
                              { color: getStatusColor(status) }
                            ]}>
                              Estado: {getStatusDisplayName(status)}
                            </Text>
                          </View>
                        </View>
                        
                        <View style={styles.eventFooter}>
                          <Text style={styles.tapToView}>Toca para ver detalles</Text>
                          <Text style={styles.arrowIcon}>→</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
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
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
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
  eventsContainer: {
    marginTop: 10,
  },
  statusGroup: {
    marginBottom: 30,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusCount: {
    fontSize: 14,
    color: '#9CA3AF',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
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
    position: 'relative',
  },
  eventCardInProgress: {
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  inProgressIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  inProgressText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
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
  tapToView: {
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

export default EventsTab;
