import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Text, View, Button, ToastAndroid } from 'react-native';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import MapView, { Polyline } from 'react-native-maps';
import { SQLite } from 'expo-sqlite';

import {
  updateLocation,
  updateLocationServiceStatus,
  startTrip,
  endTrip,
  updateDuration,
  saveTripDataStart,
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
  db = null;

  async componentWillMount() {
    const ignore = this.checkLocationService();
    let {status} = await Permissions.askAsync(
      Permissions.LOCATION,
    );
    if (status !== 'granted') {
      ToastAndroid.show('App does not function without location permission', ToastAndroid.SHORT);
    }
  }

  componentDidMount() {
    this.db = SQLite.openDatabase(mainUtils.DB_NAME);
    this.db.transaction(tx => {
      tx.executeSql(
        'create table if not exists trip_tracker (id text primary key not null, tripData text);',
        [],
        (tx, rs) => {
        }, (tx, err) => {
          ToastAndroid.show(err, ToastAndroid.SHORT);
        });
    }, err => {
      ToastAndroid.show(err, ToastAndroid.SHORT);
    }, () => {
    });
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
      timeInterval: 1000,
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

  saveTrip = () => {
    const recordId = `${new Date().toString().replace(/ GMT.*/, '').replace(/[ |:]/g, '-')}`;
    const {
      saveTripDataStart: saveTripDataStartAction,
      allLocations: tripData,
    } = this.props;
    saveTripDataStartAction(this.db, recordId, JSON.stringify(tripData));
  };

  getRegion = () => {
    const {allLocations, location} = this.props;
    const lastLocation = allLocations.length > 0 ? allLocations[allLocations.length - 1] : location;
    return mainUtils.regionFrom(lastLocation.coords);
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
      saveTrip,
    } = this.props;

    const {isMapReady} = this.state;

    if (saveTrip.status !== null) {
      !saveTrip.status && !saveTrip.err
        ? ToastAndroid.show(saveTrip.err, ToastAndroid.SHORT)
        : ToastAndroid.show('Saved data', ToastAndroid.SHORT);
    }

    return (
      <View style={mainStyle.container}>
        <View style={mainStyle.controls}>
          <Button
            disabled={saveTrip.status}
            onPress={tripInProgress ? this.stopTrip : this.startTrip}
            title={tripInProgress ? '  Stop Trip' : '  Start Trip'}
          />
          <Button
            title="Save Trip"
            disabled={!!tripInProgress || saveTrip.status}
            onPress={this.saveTrip}
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
                region={this.getRegion()}
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
    saveTripDataStart,
  }
)(Main);
