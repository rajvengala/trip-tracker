import * as TaskManager from 'expo-task-manager';
import { ToastAndroid } from 'react-native';
import store from '../../store';
import haversine from '../../utils/haversine';
import { updateLocation } from '../../store/main/actions';
import { default as mainUtils } from './mainUtils';

const BACKGROUND_LOCATION_TRACKER = 'Background location tracker';

const startLocationChangeListenerTask = () => {
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
      history,
      distanceCovered: lastDistanceCovered,
      maxSpeed: lastMaxSpeed
    } = state.main;
    const lastLocation = history.locations.length > 0 ? history.locations[history.locations.length - 1] : {};

    let distanceCovered = 0;
    if (Object.keys(lastLocation).length > 0) {
      const lastCoords = {
        latitude: lastLocation.coords.latitude,
        longitude: lastLocation.coords.longitude,
      };
      distanceCovered = haversine(lastCoords, currentCoords, {units: 'km'});
    }

    const totalDistanceCovered = mainUtils.roundOf(distanceCovered + lastDistanceCovered);
    const maxSpeed = location.coords.speed > lastMaxSpeed ? location.coords.speed : lastMaxSpeed;
    store.dispatch(updateLocation(location, totalDistanceCovered, maxSpeed));
  });
};

export default {
  BACKGROUND_LOCATION_TRACKER,
  startLocationChangeListenerTask,
};


