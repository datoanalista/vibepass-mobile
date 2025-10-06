import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { CameraView, Camera } from 'expo-camera';
import { useQR } from '../../context/QRContext';
import ApiService from '../../services/api';

const QRCodeTab = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setQRData } = useQR();

  useEffect(() => {
    getBarCodeScannerPermissions();
  }, []);

  const getBarCodeScannerPermissions = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned) return;
    
    setScanned(true);
    setLoading(true);

    try {
      console.log('📱 QR Code scanned:', data);
      
      // Parse QR data
      const qrData = JSON.parse(data);
      
      // Validate QR data structure - be more flexible
      if (!qrData.saleId && !qrData.saleNumber && !qrData.eventoId && !qrData._id) {
        throw new Error('QR inválido - No contiene ID de venta válido');
      }

      // Check if this is a simple QR that needs additional data
      if ((qrData.saleId || qrData.saleNumber) && !qrData.attendees) {
        console.log('🔍 Simple QR detected, fetching complete sale details...');
        
        try {
          // Use saleNumber if available, otherwise use saleId
          const saleIdentifier = qrData.saleNumber || qrData.saleId;
          const saleDetails = await ApiService.getSaleDetails(saleIdentifier);
          
          if (saleDetails.success) {
            // Merge the QR data with the complete sale details
            const completeData = {
              ...qrData,
              ...saleDetails.data,
              // Keep the original simple format fields as backup
              originalQR: qrData
            };
            
            console.log('✅ Complete sale data retrieved:', completeData);
            setQRData(completeData);
          } else {
            // If we can't get complete data, use the simple format
            console.log('⚠️ Could not get complete data, using simple format');
            setQRData(qrData);
          }
        } catch (error) {
          console.log('⚠️ Error fetching sale details, using simple format:', error.message);
          // Continue with simple format if API call fails
          // Add a flag to indicate this is simple format
          const simpleFormatData = {
            ...qrData,
            isSimpleFormat: true,
            errorMessage: 'No se pudieron obtener los datos completos de la venta'
          };
          setQRData(simpleFormatData);
        }
      } else {
        // This is already a complete QR or doesn't need additional data
        setQRData(qrData);
      }

      console.log('✅ QR data processed successfully');

      // Navigate to validation menu
      setTimeout(() => {
        setLoading(false);
        navigation.navigate('ValidationMenu');
      }, 1500); // Increased timeout to allow for API call

    } catch (error) {
      console.error('❌ Error parsing QR code:', error);
      setLoading(false);
      
      // Show error and allow scanning again
      setTimeout(() => {
        setScanned(false);
      }, 2000);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" backgroundColor="#1B2735" />
        <ActivityIndicator size="large" color="#2E7CE4" />
        <Text style={styles.loadingText}>Solicitando permisos de cámara...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" backgroundColor="#1B2735" />
        <View style={styles.content}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>📷</Text>
            <Text style={styles.errorText}>
              No se puede acceder a la cámara
            </Text>
            <Text style={styles.errorDescription}>
              Para escanear códigos QR, necesitas permitir el acceso a la cámara en la configuración de la aplicación.
            </Text>
            
            <TouchableOpacity style={styles.backButton} onPress={getBarCodeScannerPermissions}>
              <Text style={styles.backButtonText}>Intentar de nuevo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#1B2735" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Escáner QR</Text>
          <Text style={styles.headerSubtitle}>Coloca la cámara frente al código QR</Text>
        </View>
      </View>

      {/* Camera View */}
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        />
        
        {/* QR Frame Overlay */}
        <View style={styles.overlay}>
          <View style={styles.qrFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>

        {/* Loading Overlay */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContent}>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={styles.loadingOverlayText}>
                {scanned ? 'Obteniendo datos completos...' : 'Procesando QR...'}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          {scanned 
            ? '✅ Código escaneado correctamente' 
            : '🎯 Apunta la cámara hacia el código QR'
          }
        </Text>
        
        {scanned && !loading && (
          <TouchableOpacity 
            style={styles.scanAgainButton} 
            onPress={() => setScanned(false)}
          >
            <Text style={styles.scanAgainButtonText}>Escanear otro código</Text>
          </TouchableOpacity>
        )}
      </View>
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
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 30,
    marginHorizontal: 20,
  },
  errorTitle: {
    fontSize: 48,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  qrFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#F59E0B',
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingOverlayText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 15,
    fontWeight: '500',
  },
  instructions: {
    backgroundColor: '#1B2735',
    paddingHorizontal: 20,
    paddingVertical: 30,
    paddingBottom: 100, // Extra padding to account for fixed tab bar
    alignItems: 'center',
  },
  instructionText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
  },
  scanAgainButton: {
    backgroundColor: '#2E7CE4',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  scanAgainButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#6B7280',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default QRCodeTab;
