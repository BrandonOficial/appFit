import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import WorkoutsScreen from "../../screens/Workouts/WorkoutsScreen";
import CreateWorkoutScreen from "../../screens/Workouts/CreateWorkoutScreen";
import WorkoutDetailScreen from "../../screens/Workouts/WorkoutDetailScreen";

const Stack = createNativeStackNavigator();

const WorkoutStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Workouts" component={WorkoutsScreen} />
      <Stack.Screen name="CreateWorkout" component={CreateWorkoutScreen} />
      <Stack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} />
    </Stack.Navigator>
  );
};

export default WorkoutStack;
