import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "../screens/Home/HomeScreen";
import ProfileStack from "./StackNavigators/ProfileStack";
import WorkoutStack from "./StackNavigators/WorkoutStack";
import { theme } from "../styles/theme";

const Tab = createBottomTabNavigator();

// ============================================================================
// CONSTANTS
// ============================================================================

const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 85 : 70;
const ICON_SIZE = 24;
const FAB_SIZE = 64;
const FAB_ICON_SIZE = 32;

// ============================================================================
// PLACEHOLDER COMPONENT (para tabs futuras)
// ============================================================================

function PlaceholderScreen() {
  return <View style={{ flex: 1, backgroundColor: theme.colors.background }} />;
}

// ============================================================================
// CUSTOM TAB BAR COMPONENT
// ============================================================================

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const getTabConfig = (routeName) => {
    switch (routeName) {
      case "Home":
        return { label: "Início", icon: "home", iconOutline: "home-outline" };
      case "WorkoutsTab":
        return {
          label: "Treinos",
          icon: "barbell",
          iconOutline: "barbell-outline",
        };
      case "ProgressTab":
        return {
          label: "Progresso",
          icon: "stats-chart",
          iconOutline: "stats-chart-outline",
        };
      case "ProfileStack":
        return {
          label: "Perfil",
          icon: "person",
          iconOutline: "person-outline",
        };
      default:
        return { label: "", icon: "ellipse", iconOutline: "ellipse-outline" };
    }
  };

  const handleFABPress = () => {
    navigation.navigate("WorkoutsTab", {
      screen: "CreateWorkout",
    });
  };

  // Verifica se está na tela Home para mostrar o FAB
  const currentRoute = state.routes[state.index].name;
  const showFAB = currentRoute === "Home";

  return (
    <View style={styles.tabBarContainer}>
      {/* Tab Bar Background */}
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const tabConfig = getTabConfig(route.name);
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const iconName = isFocused ? tabConfig.icon : tabConfig.iconOutline;
          const color = isFocused
            ? theme.colors.primary
            : theme.colors.textSecondary;

          return (
            <React.Fragment key={`${route.key}-fragment`}>
              <TouchableOpacity
                style={styles.tabButton}
                onPress={onPress}
                activeOpacity={0.7}
              >
                <Ionicons name={iconName} size={ICON_SIZE} color={color} />
                {tabConfig.label && (
                  <Text style={[styles.tabLabel, { color }]}>
                    {tabConfig.label}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Spacer for FAB após o segundo tab (index 1) - apenas quando FAB está visível */}
              {index === 1 && showFAB && (
                <View style={styles.fabSpace} key={`fab-spacer`} />
              )}
            </React.Fragment>
          );
        })}
      </View>

      {/* Floating Action Button - apenas na tela Home */}
      {showFAB && (
        <TouchableOpacity
          style={styles.fabContainer}
          onPress={handleFABPress}
          activeOpacity={0.8}
        >
          <View style={styles.fab}>
            <Ionicons
              name="add"
              size={FAB_ICON_SIZE}
              color={theme.colors.background}
            />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Início" }}
      />

      <Tab.Screen
        name="WorkoutsTab"
        component={WorkoutStack}
        options={{ title: "Treinos" }}
      />

      {/* Placeholder para futuro ProgressStack */}
      <Tab.Screen
        name="ProgressTab"
        component={PlaceholderScreen}
        options={{ title: "Progresso" }}
      />

      <Tab.Screen
        name="ProfileStack"
        component={ProfileStack}
        options={{ title: "Perfil" }}
      />
    </Tab.Navigator>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  // Container principal
  tabBarContainer: {
    position: "relative",
  },

  // Barra de navegação
  tabBar: {
    flexDirection: "row",
    backgroundColor: theme.colors.background,
    height: TAB_BAR_HEIGHT,
    paddingBottom: Platform.OS === "ios" ? 20 : 8,
    paddingTop: 8,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  // Botão de cada tab
  tabButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },

  // Label do tab
  tabLabel: {
    fontSize: 12,
    fontWeight: "700",
    fontFamily: theme.fonts.bold,
  },

  // Espaço para o FAB
  fabSpace: {
    flex: 1,
  },

  // Container do FAB
  fabContainer: {
    position: "absolute",
    bottom: TAB_BAR_HEIGHT - FAB_SIZE / 2 + (Platform.OS === "ios" ? 20 : 8),
    left: "50%",
    marginLeft: -FAB_SIZE / 2,
    zIndex: 10,
  },

  // Floating Action Button
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});

export default TabNavigator;
