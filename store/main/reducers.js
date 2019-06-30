import update from 'immutability-helper';
import * as types from './types';

export const initialState = {
  location: {},
  locationServiceStatus: false,
  tripInProgress: false,
  lastLocation: {},
  distanceCovered: 0,
  duration: 0,
  tripStartTime: 0,
  tripEndTime: 0,
  maxSpeed: 0,
};

const main = (state = initialState, action) => {
  switch (action.type) {
    case types.UPDATE_LOCATION: {
      const {location, distanceCovered, maxSpeed} = action;
      return update(state, {
        location: {
          $set: location,
        },
        lastLocation: {
          $set: JSON.parse(JSON.stringify(state.location)),
        },
        distanceCovered: {
          $set: distanceCovered,
        },
        maxSpeed: {
          $set: maxSpeed,
        }
      });
    }

    case types.UPDATE_LOCATION_SERVICE_STATUS: {
      const {status, msg} = action;
      return update(state, {
        locationServiceStatus: {
          $set: status,
        },
      });
    }

    case types.START_TRIP: {
      const now = new Date().getTime();
      return update(initialState, {
        tripInProgress: {
          $set: 1,
        },
        tripStartTime: {
          $set: now,
        },
      });
    }

    case types.END_TRIP: {
      return update(state, {
        tripInProgress: {
          $set: 0,
        },
        tripEndTime: {
          $set: new Date().getTime(),
        },
      });
    }

    case types.UPDATE_DURATION: {
      const {tripStartTime} = state;
      const diff = Math.round((new Date().getTime() - tripStartTime) / 1000);
      return update(state, {
        duration: {
          $set: diff,
        },
      });
    }

    default:
      return state;
  }
};

export default main;
