import { StyleSheet } from 'react-native';
import Constants from 'expo-constants';

const mainStyle = StyleSheet.create({
  container: {
    marginTop: Constants.statusBarHeight,
    flex: 0,
    flexDirection: 'column',
    padding: 10,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
    marginTop: 10,
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
  mapView: {
  },
  map: {
    height: 200,
  }
});

export { mainStyle };
