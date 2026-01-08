import {RFValue} from 'react-native-responsive-fontsize';

export const colors = {
  white: '#fff',
  black: '#000',
  primary: '#0F1944',
  grey: '#8B8C88',
  darkGrey: '#5A5A5A',
  lightPrimary: '#1A2B5C',
};

export const fontFamily = {
  regular: 'Lato-Regular',
  medium: 'Lato-Medium',
  italic: 'Lato-Italic',
  semiBold: 'Lato-SemiBold',
  bold: 'Lato-Bold',
};

export const fontSize = val => RFValue(val, 812);
