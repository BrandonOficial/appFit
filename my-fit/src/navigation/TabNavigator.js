import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/Home/HomeScreen"; // Ou HomeStack
import { Ionicons } from "@expo/vector-icons"; // Para os ícones das Tabs
import { theme } from "../styles/theme";

// 1. IMPORTAR O NOVO STACK DE PERFIL
import ProfileStack from "./StackNavigators/ProfileStack";
// Importar os outros Stacks (WorkoutStack, ProgressStack) quando estiverem prontos

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
        // Função para definir os ícones
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Workouts") {
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
      {/* 2. ATUALIZAR AS TABS */}
      <Tab.Screen
        name="Home"
        component={HomeScreen} // Substituir por HomeStack quando pronto
        options={{ title: "Home" }}
      />

      {/* <Tab.Screen name="Workouts" component={WorkoutStack} /> */}
      {/* <Tab.Screen name="Progress" component={ProgressStack} /> */}

      <Tab.Screen
        name="ProfileStack"
        component={ProfileStack} // 3. USAR O NOVO STACK AQUI
        options={{ title: "Perfil" }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
