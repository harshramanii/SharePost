import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { hp, wp } from '../../helper/constants';
import { fontFamily, fontSize } from '../../helper/utils';
import { useTheme } from '../../hooks/useTheme';
import Icon from './Icon';

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.tabBarContainer}>
      <View
        style={[
          styles.tabBar,
          { backgroundColor: colors.surface, borderTopColor: colors.border },
        ]}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          let iconName = 'home';
          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Create') {
            iconName = 'create';
          } else if (route.name === 'Profile') {
            iconName = 'profile';
          }
          const iconColor = isFocused ? colors.white : colors.textSecondary;

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={[
                styles.tabItem,
                isFocused && [
                  styles.activeTabItem,
                  { backgroundColor: colors.primary },
                ],
              ]}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.tabIconContainer,
                  isFocused && [styles.activeTabIconContainer],
                ]}
              >
                <Icon name={iconName} size={wp(6)} color={iconColor} />
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  { color: colors.textSecondary },
                  isFocused && [styles.activeTabLabel, { color: colors.white }],
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    // height: hp(12),
    paddingTop: hp(1.5),
    // paddingBottom: hp(2),
    backgroundColor: 'transparent',
  },
  tabBar: {
    height: hp(8.5),
    flexDirection: 'row',
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(0.5),
  },
  activeTabItem: {},
  tabIconContainer: {
    width: wp(11),
    height: wp(11),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(0.4),
    backgroundColor: 'transparent',
  },
  activeTabIconContainer: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  tabLabel: {
    fontSize: fontSize(14),
    fontFamily: fontFamily.regular,
    paddingBottom: hp(2),
  },
  activeTabLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize(14),
  },
});

export default CustomTabBar;
