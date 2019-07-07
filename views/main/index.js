import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Platform, Text, View, StyleSheet, Button, ToastAndroid } from 'react-native';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import MapView, { Polyline } from 'react-native-maps';

import {
  updateLocation,
  updateLocationServiceStatus,
  startTrip,
  endTrip,
  updateDuration,
} from '../../store/main/actions';
import { mainComponentSelector } from './selector';
import { mainStyle } from './style';
import { default as mainUtils } from './mainUtils';
import { default as locationChangeListenerTask } from './locationChangeListener';


locationChangeListenerTask.startLocationChangeListenerTask();

export class Main extends Component {
  timerCallback = null;
  state = {
    isMapReady: false,
  };

  async componentWillMount() {
    if (Platform.OS === 'android' && !Constants.isDevice) {
      ToastAndroid.show('App does not work in an Android emulator. Try it on your device', ToastAndroid.SHORT);
    } else {
      const ignore = this.checkLocationService();
      let {status} = await Permissions.askAsync(
        Permissions.LOCATION,
        Permissions.CAMERA_ROLL
      );
      if (status !== 'granted') {
        ToastAndroid.show('App may not function without access to location and storage permissions');
      }
    }
  }

  onMapReady = () => {
    this.setState({
      ...this.state,
      isMapReady: true,
    });
  };

  startTrip = () => {
    const {
      startTrip: startTripAction,
      updateDuration: updateDurationAction,
    } = this.props;
    const ignore = Location.startLocationUpdatesAsync(locationChangeListenerTask.BACKGROUND_LOCATION_TRACKER, {
      accuracy: Location.Accuracy.BestForNavigation,
    });
    startTripAction();
    this.timerCallback = setInterval(() => {
      updateDurationAction();
    }, 1000);
  };

  stopTrip = () => {
    const {
      endTrip: endTripAction,
    } = this.props;
    const ignore = Location.stopLocationUpdatesAsync(locationChangeListenerTask.BACKGROUND_LOCATION_TRACKER);
    clearInterval(this.timerCallback);
    endTripAction();
  };

  checkLocationService = async () => {
    const {updateLocationServiceStatus: updateLocationServiceStatusAction} = this.props;
    const locationServiceStatus = await Location.hasServicesEnabledAsync();
    if (locationServiceStatus) {
      updateLocationServiceStatusAction(locationServiceStatus, 'Location service is enabled');
      return;
    }
    updateLocationServiceStatusAction(locationServiceStatus, 'Location Service is disabled');
  };

  logAllLocations = async () => {
    const {allLocations} = this.props;
    const filename = `${new Date().toString().replace(/ GMT.*/, '').replace(/[ |:]/g, '-')}.json`;
    const filepath = `${FileSystem.documentDirectory}${filename}`;
    const asset = await MediaLibrary.createAssetAsync(filepath);
    const file = await FileSystem.writeAsStringAsync(
      filepath,
      JSON.stringify(allLocations),
      {encoding: FileSystem.EncodingType.UTF8});
    ToastAndroid.show(`Saved data to file ${file}`);
  };

  render() {
    const {
      location,
      tripInProgress,
      distanceCovered,
      duration,
      maxSpeed,
      tripStartTime,
      tripEndTime,
      polylineCoordinates,
    } = this.props;
    const {isMapReady} = this.state;

    return (
      <View style={mainStyle.container}>
        <View style={mainStyle.controls}>
          <Button
            onPress={tripInProgress ? this.stopTrip : this.startTrip}
            title={tripInProgress ? '  Stop Trip' : '  Start Trip'}
          />
          <Button
            title="Save Trip"
            onPress={this.logAllLocations}
          />
        </View>
        <View style={mainStyle.header}>
          <View style={mainStyle.headerRow}>
            <Text style={mainStyle.headerLabel}>Trip Start</Text>
            <Text style={mainStyle.headerValue}>{mainUtils.formatDate(tripStartTime)}</Text>
          </View>
          <View style={mainStyle.headerRow}>
            <Text style={mainStyle.headerLabel}>Trip End</Text>
            <Text style={mainStyle.headerValue}>{mainUtils.formatDate(tripEndTime)}</Text>
          </View>
        </View>
        <View style={mainStyle.widgetRow}>
          <View style={mainStyle.widget}>
            <Text style={mainStyle.widgetLabel}>Speed</Text>
            <View style={mainStyle.widgetValueContainer}>
              <Text style={mainStyle.widgetValue}>{mainUtils.getSpeed(location)}</Text>
              <Text style={mainStyle.widgetValueUnit}>Km/h</Text>
            </View>
          </View>
          <View style={mainStyle.widget}>
            <Text style={mainStyle.widgetLabel}>Avg. Speed</Text>
            <View style={mainStyle.widgetValueContainer}>
              <Text style={mainStyle.widgetValue}>{mainUtils.avgSpeed(distanceCovered, duration)}</Text>
              <Text style={mainStyle.widgetValueUnit}>Km/h</Text>
            </View>
          </View>
        </View>
        <View style={mainStyle.widgetRow}>
          <View style={mainStyle.widget}>
            <Text style={mainStyle.widgetLabel}>Max. Speed</Text>
            <View style={mainStyle.widgetValueContainer}>
              <Text style={mainStyle.widgetValue}>{mainUtils.convertMsecToKmph(maxSpeed)}</Text>
              <Text style={mainStyle.widgetValueUnit}>Km/h</Text>
            </View>
          </View>
          <View style={mainStyle.widget}>
            <Text style={mainStyle.widgetLabel}>Distance</Text>
            <View style={mainStyle.widgetValueContainer}>
              <Text style={mainStyle.widgetValue}>{distanceCovered}</Text>
              <Text style={mainStyle.widgetValueUnit}>Km</Text>
            </View>
          </View>
        </View>
        <View style={mainStyle.widgetRow}>
          <View style={mainStyle.widget}>
            <Text style={mainStyle.widgetLabel}>Duration</Text>
            <View style={[mainStyle.widgetValueContainer, mainStyle.durationValue]}>
              <Text style={mainStyle.widgetValue}>{mainUtils.formatDuration(duration)}</Text>
              {/*<Text style={mainStyle.widgetValueUnit}></Text>*/}
            </View>
          </View>
        </View>
        <View style={mainStyle.mapView}>
          {
            Object.keys(location).length > 0
            &&
            (
              <MapView
                style={mainStyle.map}
                initialRegion={mainUtils.regionFrom(location.coords)}
                onMapReady={this.onMapReady}
                provider="google"
                mapType="standard"
                showsPointsOfInterest
                showsScale
              >
                {isMapReady ? <Polyline coordinates={polylineCoordinates} /> : null}
              </MapView>
            )
          }
        </View>
      </View>
    );
  }
}

export default connect(
  mainComponentSelector,
  {
    updateLocation,
    updateLocationServiceStatus,
    startTrip,
    endTrip,
    updateDuration,
  }
)(Main);
