import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import StorageService from '../services/storage';

const EventSelectionScreen = ({ navigation, route }) => {
  const { eventos, returnToHome } = route.params;
  const [selectedEventId, setSelectedEventId] = useState(null);

  // Pre-select current event if returning from home
  useEffect(() => {
    if (returnToHome) {
      loadCurrentEvent();
    }
  }, [returnToHome]);

  const loadCurrentEvent = async () => {
    try {
      const currentEventId = await StorageService.getSelectedEvent();
      if (currentEventId) {
        setSelectedEventId(currentEventId);
      }
    } catch (error) {
      console.error('❌ Error loading current event:', error);
    }
  };

  const handleEventSelect = (evento) => {
    setSelectedEventId(evento.id);
  };

  const handleContinue = async () => {
    if (!selectedEventId) {
      Alert.alert('Error', 'Por favor seleccione un evento');
      return;
    }

    try {
      console.log('🎪 Selected event:', selectedEventId);
      await StorageService.saveSelectedEvent(selectedEventId);
      
      if (returnToHome) {
        // Go back to home tab
        navigation.goBack();
      } else {
        // First time selection - go to main tabs
        navigation.replace('MainTabs');
      }
    } catch (error) {
      console.error('❌ Error saving selected event:', error);
      Alert.alert('Error', 'No se pudo guardar la selección del evento');
    }
  };

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

  const getStatusDisplayName = (status) => {
    const statusMap = {
      'programado': 'Programado',
      'en_curso': 'En Curso',
      'finalizado': 'Finalizado',
      'cancelado': 'Cancelado',
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
      'sin_estado': '#F59E0B'
    };
    return colorMap[status] || '#6B7280';
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#1B2735" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Seleccionar Evento</Text>
        <Text style={styles.headerSubtitle}>
          Tiene {eventos.length} evento{eventos.length !== 1 ? 's' : ''} asignado{eventos.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Instructions */}
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>📋 Instrucciones</Text>
            <Text style={styles.instructionsText}>
              Seleccione el evento en el que desea trabajar. Puede cambiar de evento en cualquier momento desde la aplicación.
            </Text>
          </View>

          {/* Events List */}
          <View style={styles.eventsContainer}>
            <Text style={styles.sectionTitle}>🎪 Eventos Disponibles</Text>
            
            {eventos.map((evento, index) => {
              const isSelected = selectedEventId === evento.id;
              const status = evento.informacionGeneral?.estado || 'sin_estado';
              const statusColor = getStatusColor(status);
              
              return (
                <TouchableOpacity
                  key={evento.id}
                  style={[
                    styles.eventCard,
                    isSelected && styles.selectedEventCard
                  ]}
                  onPress={() => handleEventSelect(evento)}
                >
                  <View style={styles.eventHeader}>
                    <Text style={styles.eventName}>
                      {evento.informacionGeneral?.nombreEvento || 'Evento sin nombre'}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                      <Text style={styles.statusText}>
                        {getStatusDisplayName(status)}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.eventDetails}>
                    <View style={styles.eventDetailRow}>
                      <Text style={styles.eventDetailLabel}>📅 Fecha:</Text>
                      <Text style={styles.eventDetailValue}>
                        {formatDate(evento.informacionGeneral?.fechaEvento)}
                      </Text>
                    </View>
                    
                    {evento.informacionGeneral?.lugarEvento && (
                      <View style={styles.eventDetailRow}>
                        <Text style={styles.eventDetailLabel}>📍 Lugar:</Text>
                        <Text style={styles.eventDetailValue}>
                          {evento.informacionGeneral.lugarEvento}
                        </Text>
                      </View>
                    )}
                    
                    {evento.informacionGeneral?.horaInicio && evento.informacionGeneral?.horaTermino && (
                      <View style={styles.eventDetailRow}>
                        <Text style={styles.eventDetailLabel}>🕐 Horario:</Text>
                        <Text style={styles.eventDetailValue}>
                          {evento.informacionGeneral.horaInicio} - {evento.informacionGeneral.horaTermino}
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  {isSelected && (
                    <View style={styles.selectedIndicator}>
                      <Text style={styles.selectedText}>✅ Seleccionado</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.continueButton, !selectedEventId && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!selectedEventId}
        >
          <Text style={styles.continueButtonText}>
            {returnToHome ? 'Cambiar a Evento Seleccionado' : 'Continuar con Evento Seleccionado'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B2735',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#1B2735',
    alignItems: 'center',
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
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  instructionsCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.95)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  eventsContainer: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  eventCard: {
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
  selectedEventCard: {
    borderWidth: 2,
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  eventName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  eventDetails: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 15,
  },
  eventDetailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  eventDetailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    width: 80,
  },
  eventDetailValue: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  selectedIndicator: {
    marginTop: 15,
    alignItems: 'center',
  },
  selectedText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1B2735',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  continueButton: {
    backgroundColor: '#10B981',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  continueButtonDisabled: {
    backgroundColor: '#6B7280',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EventSelectionScreen;
