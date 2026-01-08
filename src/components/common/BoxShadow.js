//import liraries
import React, { memo } from "react";
import { StyleSheet } from "react-native";

import DropShadow from "react-native-drop-shadow";

// create a component
const BoxShadow = memo(({ children, contianerStyle }) => (
  <DropShadow style={[styles.container, contianerStyle]}>{children}</DropShadow>
));

// define your styles
const styles = StyleSheet.create({
  container: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});

//make this component available to the app
export default BoxShadow;
