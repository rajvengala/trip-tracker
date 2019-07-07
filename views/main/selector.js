import { createSelector } from 'reselect'

const mainState = state => state.main;

const polylineCoords = location => ({
  latitude: location.coords.latitude,
  longitude: location.coords.longitude,
});

const mainComponentSelector = createSelector(
  mainState,
  (main) => ({
    location: main.location,
    locationServiceStatus: main.locationServiceStatus,
    tripInProgress: main.tripInProgress,
    distanceCovered: main.distanceCovered,
    duration: main.duration,
    maxSpeed: main.maxSpeed,
    tripStartTime: main.tripStartTime,
    tripEndTime: main.tripEndTime,
    polylineCoordinates: main.history.locations.map(polylineCoords),
    allLocations: main.history.locations,
  }),
);

export { mainComponentSelector };
