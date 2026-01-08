import Constants from 'expo-constants';

const manifestExtra = (Constants.manifest && (Constants.manifest as any).extra) || (Constants.expoConfig && (Constants.expoConfig as any).extra) || {};

export const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || manifestExtra.googleMapsApiKey || manifestExtra.GOOGLE_MAPS_API_KEY || '';

export default {
  GOOGLE_MAPS_API_KEY,
};
