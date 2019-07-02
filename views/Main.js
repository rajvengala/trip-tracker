import React, { Component } from 'react';
import { connect } from 'react-redux';
import store from '../store';
import { Platform, Text, View, StyleSheet, Button, ToastAndroid } from 'react-native';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';
import * as TaskManager from 'expo-task-manager';
import {
  updateLocation,
  updateLocationServiceStatus,
  startTrip,
  endTrip,
  updateDuration,
} from '../store/main/actions';
import haversine from '../utils/haversine';


const BACKGROUND_LOCATION_TRACKER = 'Background location tracker';
const MINUTE = 60;
const HOUR = MINUTE * 60;
const ACCURACY_THRESHOLD = 40;

const roundOf = value => Math.round(value * 100) / 100;

TaskManager.defineTask(BACKGROUND_LOCATION_TRACKER, ({data, error}) => {
  if (error) {
    ToastAndroid.show(error.message, ToastAndroid.SHORT);
    return;
  }
  const {locations} = data;
  const [location] = locations;
  const currentCoords = {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };

  const state = store.getState();
  const {
    lastLocation,
    distanceCovered: lastDistanceCovered,
    maxSpeed: lastMaxSpeed
  } = state.main;

  let distanceCovered = 0;
  if (Object.keys(lastLocation).length > 0) {
    const lastCoords = {
      latitude: lastLocation.coords.latitude,
      longitude: lastLocation.coords.longitude,
    };
    distanceCovered = haversine(lastCoords, currentCoords, {units: 'km'});
  }

  let totalDistanceCovered = distanceCovered;
  if (location.coords.accuracy <= ACCURACY_THRESHOLD) {
    totalDistanceCovered = roundOf(distanceCovered + lastDistanceCovered);
  }

  const maxSpeed = location.coords.speed > lastMaxSpeed ? location.coords.speed : lastMaxSpeed;
  store.dispatch(updateLocation(location, totalDistanceCovered, maxSpeed));
});

export class Main extends Component {
  timerCallback = null;

  static formatDate(msec) {
    if (!msec) return '';
    const date = new Date(msec);
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  };

  static convertMsecToKmph(msec) {
    return roundOf(msec * 3.6);
  }

  static convertMsecToMiph(msec) {
    return roundOf(msec * 2.23);
  }

  static formatMinutes(duration) {
    const mins = parseInt(duration / MINUTE);
    const secs = duration % MINUTE;
    return `${mins} m ${secs} s`;
  }

  static formatHours(duration) {
    const hours = parseInt(duration / HOUR);
    const mins = duration % HOUR;
    return `${hours} h ${Main.formatMinutes(mins)}`;
  }

  static formatDuration(duration) {
    if (duration < MINUTE) {
      return `${duration} s`;
    }

    if (duration > HOUR) {
      return Main.formatHours(duration);
    }

    if (duration > MINUTE) {
      return Main.formatMinutes(duration);
    }
  };

  static avgSpeed(distance, duration) {
    if (!distance || !duration) return 0;
    return roundOf(distance / (duration / HOUR));
  }

  static getSpeed(location) {
    if (Object.keys(location).length > 0) {
      return Main.convertMsecToKmph(location.coords.speed);
    }
    return 0;
  }

  async componentWillMount() {
    if (Platform.OS === 'android' && !Constants.isDevice) {
      ToastAndroid.show('App does not work in an Android emulator. Try it on your device', ToastAndroid.SHORT);
    } else {
      const ignore = this.checkLocationService();
      let { status } = await Permissions.askAsync(Permissions.LOCATION);
      if (status !== 'granted') {
        ToastAndroid.show('App will not work without access to location service');
      }
    }
  }

  startTrip = () => {
    const {
      startTrip: startTripAction,
      updateDuration: updateDurationAction,
    } = this.props;
    const ignore = Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TRACKER, {
      accuracy: Location.Accuracy.BestForNavigation,
      // distanceInterval: 5,
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
    const ignore = Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TRACKER);
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

  render() {
    const {
      locationServiceStatus,
      location,
      tripInProgress,
      distanceCovered,
      duration,
      maxSpeed,
      tripStartTime,
      tripEndTime,
    } = this.props;

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.headerLabel}>Trip Start</Text>
            <Text style={styles.headerValue}>{Main.formatDate(tripStartTime)}</Text>
          </View>
          <View style={styles.headerRow}>
            <Text style={styles.headerLabel}>Trip End</Text>
            <Text style={styles.headerValue}>{Main.formatDate(tripEndTime)}</Text>
          </View>
        </View>
        <View style={styles.widgetRow}>
          <View style={styles.widget}>
            <Text style={styles.widgetLabel}>Speed</Text>
            <View style={styles.widgetValueContainer}>
              <Text style={styles.widgetValue}>{Main.getSpeed(location)}</Text>
              <Text style={styles.widgetValueUnit}>Km/h</Text>
            </View>
          </View>
          <View style={styles.widget}>
            <Text style={styles.widgetLabel}>Avg. Speed</Text>
            <View style={styles.widgetValueContainer}>
              <Text style={styles.widgetValue}>{Main.avgSpeed(distanceCovered, duration)}</Text>
              <Text style={styles.widgetValueUnit}>Km/h</Text>
            </View>
          </View>
        </View>
        <View style={styles.widgetRow}>
          <View style={styles.widget}>
            <Text style={styles.widgetLabel}>Max. Speed</Text>
            <View style={styles.widgetValueContainer}>
              <Text style={styles.widgetValue}>{Main.convertMsecToKmph(maxSpeed)}</Text>
              <Text style={styles.widgetValueUnit}>Km/h</Text>
            </View>
          </View>
          <View style={styles.widget}>
            <Text style={styles.widgetLabel}>Distance</Text>
            <View style={styles.widgetValueContainer}>
              <Text style={styles.widgetValue}>{distanceCovered}</Text>
              <Text style={styles.widgetValueUnit}>Km</Text>
            </View>
          </View>
        </View>
        <View style={styles.widgetRow}>
          <View style={styles.widget}>
            <Text style={styles.widgetLabel}>Duration</Text>
            <View style={[styles.widgetValueContainer, styles.durationValue]}>
              <Text style={styles.widgetValue}>{Main.formatDuration(duration)}</Text>
              {/*<Text style={styles.widgetValueUnit}></Text>*/}
            </View>
          </View>
        </View>
        <View style={styles.footer}>
          <Button
            onPress={tripInProgress ? this.stopTrip : this.startTrip}
            title={tripInProgress ? '  Stop Trip' : '  Start Trip'}
          />
          <Button
            title="Save Trip"
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: Constants.statusBarHeight,
    flex: 0,
    flexDirection: 'column',
    padding: 10,
  },
  header: {
    marginBottom: 5,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 5,
    backgroundColor: '#673AB7',
    justifyContent: 'space-between',
    padding: 10,
  },
  headerLabel: {
    fontSize: 20,
    color: 'white',
  },
  headerValue: {
    fontSize: 16,
    color: 'white',
  },
  widgetRow: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 100,
    marginBottom: 5,
    marginLeft: 1,
  },
  widget: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: '#C2185B',
    padding: 5,
    marginRight: 1,
  },
  widgetLabel: {
    fontSize: 20,
    color: 'white',
  },
  widgetValueContainer: {
    flex: 0,
    flexDirection: 'row',
  },
  durationValue: {
    justifyContent: 'center',
  },
  widgetValue: {
    fontSize: 38,
    marginRight: 10,
    color: 'white',
  },
  widgetValueUnit: {
    fontSize: 18,
    textAlignVertical: 'center',
    color: 'white',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
});

export default connect(
  state => ({
    statusMessage: state.main.statusMessage,
    location: state.main.location,
    locationServiceStatus: state.main.locationServiceStatus,
    tripInProgress: state.main.tripInProgress,
    distanceCovered: state.main.distanceCovered,
    duration: state.main.duration,
    maxSpeed: state.main.maxSpeed,
    tripStartTime: state.main.tripStartTime,
    tripEndTime: state.main.tripEndTime,
  }),
  {
    updateLocation,
    updateLocationServiceStatus,
    startTrip,
    endTrip,
    updateDuration,
  }
)(Main);

