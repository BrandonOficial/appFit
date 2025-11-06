import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/Home/HomeScreen";
// Importar os outros Stacks (WorkoutStack, ProgressStack, ProfileStack) quando estiverem prontos

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      {/* Por agora, usamos a HomeScreen diretamente. 
          No futuro, substituiremos por HomeStack, como planeado. */}
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ title: "Home" }}
      />

      {/* // Quando os Stacks estiverem prontos:
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Workouts" component={WorkoutStack} />
      <Tab.Screen name="Progress" component={ProgressStack} />
      <Tab.Screen name="Profile" component={ProfileStack} /> 
      */}
    </Tab.Navigator>
  );
};

export default TabNavigator;
