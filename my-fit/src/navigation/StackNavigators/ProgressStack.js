import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProgressScreen from "../../screens/Progress/ProgressScreen";

const Stack = createNativeStackNavigator();

const ProgressStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Progress" component={ProgressScreen} />
    </Stack.Navigator>
  );
};

export default ProgressStack;
