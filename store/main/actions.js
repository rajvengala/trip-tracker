import * as types from './types';

export const updateLocation = (location, distanceCovered, maxSpeed) => ({
  type: types.UPDATE_LOCATION,
  location,
  distanceCovered,
  maxSpeed,
});

export const updateLocationServiceStatus = (status) => ({
  type: types.UPDATE_LOCATION_SERVICE_STATUS,
  status,
});

export const startTrip = () => ({
  type: types.START_TRIP,
});

export const endTrip = () => ({
  type: types.END_TRIP,
});

export const updateDuration = () => ({
  type: types.UPDATE_DURATION,
});

