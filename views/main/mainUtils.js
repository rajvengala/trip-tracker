const MINUTE = 60;
const HOUR = MINUTE * 60;
const DB_NAME = 'trip-tracker';

function roundOf(value) {
  return Math.round(value * 100) / 100;
}

function formatDate(msec) {
  if (!msec) return '';
  const date = new Date(msec);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}

function convertMsecToKmph(msec) {
  return roundOf(msec * 3.6);
}

function convertMsecToMiph(msec) {
  return roundOf(msec * 2.23);
}

function formatMinutes(duration) {
  const mins = parseInt(duration / MINUTE);
  const secs = duration % MINUTE;
  return `${mins} m ${secs} s`;
}

function formatHours(duration) {
  const hours = parseInt(duration / HOUR);
  const mins = duration % HOUR;
  return `${hours} h ${formatMinutes(mins)}`;
}

function formatDuration(duration) {
  if (duration < MINUTE) {
    return `${duration} s`;
  }

  if (duration > HOUR) {
    return formatHours(duration);
  }

  if (duration > MINUTE) {
    return formatMinutes(duration);
  }
}

function avgSpeed(distance, duration) {
  if (!distance || !duration) return 0;
  return roundOf(distance / (duration / HOUR));
}

function getSpeed(location) {
  if (Object.keys(location).length > 0) {
    return convertMsecToKmph(location.coords.speed);
  }
  return 0;
}

function regionFrom(coords) {
  // source - https://pusher.com/tutorials/carpooling-react-native-part-2
  const {
    latitude: lat,
    longitude: lon,
    accuracy,
  } = coords;
  const oneDegreeOfLongitudeInMeters = 111.32 * 1000;
  const circumference = (40075 / 360) * 1000;

  const latDelta = accuracy * (1 / (Math.cos(lat) * circumference));
  const lonDelta = (accuracy / oneDegreeOfLongitudeInMeters);

  return {
    latitude: lat,
    longitude: lon,
    latitudeDelta: Math.max(0, latDelta),
    longitudeDelta: Math.max(0, lonDelta)
  };
}

export default {
  roundOf,
  formatDate,
  convertMsecToKmph,
  convertMsecToMiph,
  formatMinutes,
  formatHours,
  formatDuration,
  avgSpeed,
  getSpeed,
  regionFrom,
  DB_NAME,
};

