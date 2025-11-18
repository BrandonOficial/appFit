import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/Home/HomeScreen";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../styles/theme";

import ProfileStack from "./StackNavigators/ProfileStack";
import WorkoutStack from "./StackNavigators/WorkoutStack"; // ← ⭐ ADICIONAR

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "WorkoutsTab") {
            // ← ⭐ ADICIONAR
            iconName = focused ? "barbell" : "barbell-outline";
          } else if (route.name === "Progress") {
            iconName = focused ? "stats-chart" : "stats-chart-outline";
          } else if (route.name === "ProfileStack") {
            iconName = focused ? "person" : "person-outline";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Home" }}
      />

      {/* ⭐ ADICIONAR ESTA TAB */}
      <Tab.Screen
        name="WorkoutsTab"
        component={WorkoutStack}
        options={{ title: "Treinos" }}
      />

      {/* <Tab.Screen name="Progress" component={ProgressStack} /> */}

      <Tab.Screen
        name="ProfileStack"
        component={ProfileStack}
        options={{ title: "Perfil" }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
