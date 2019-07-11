import update from 'immutability-helper';
import * as types from './types';

export const initialState = {
  location: {},
  locationServiceStatus: false,
  tripInProgress: false,
  distanceCovered: 0,
  duration: 0,
  tripStartTime: 0,
  tripEndTime: 0,
  maxSpeed: 0,
  history: {
    locations: [],
  },
  saveTrip: {
    status: null,
    err: null,
  }
};

const main = (state = initialState, action) => {
  switch (action.type) {
    case types.UPDATE_LOCATION: {
      const {location, distanceCovered, maxSpeed} = action;
      return update(state, {
        location: {
          $set: location,
        },
        distanceCovered: {
          $set: distanceCovered,
        },
        maxSpeed: {
          $set: maxSpeed,
        },
        history: {
          locations: {
            $push: [location],
          }
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
        history: {
          $set: initialState.history,
        }
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

    case types.SAVE_TRIP_DATA_START: {
      return update(state, {
        saveTrip: {
          status: {
            $set: true,
          },
          err: {
            $set: null,
          }
        },
      });
    }

    case types.SAVE_TRIP_DATA_END: {
      const {errMsg} = action;
      const err = `${errMsg.stmtErr}. ${errMsg.transErr}`;
      return update(state, {
        saveTrip: {
          status: {
            $set: false,
          },
          err: {
            $set: err,
          },
        },
      });
    }

    default:
      return state;
  }
};

export default main;
