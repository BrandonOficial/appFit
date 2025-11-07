import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
// Ainda não criámos a ProfileScreen, mas vamos importá-la já
import ProfileScreen from "../../screens/Profile/ProfileScreen";
// import SettingsScreen from '../../screens/Profile/SettingsScreen';

const Stack = createNativeStackNavigator();

const ProfileStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* NOTA: Isto vai dar um novo erro se 'ProfileScreen' não existir.
        Vamos criar esse ficheiro a seguir.
      */}
      <Stack.Screen name="Profile" component={ProfileScreen} />
      {/* <Stack.Screen name="Settings" component={SettingsScreen} /> */}
    </Stack.Navigator>
  );
};

// GARANTE QUE TENS ESTA LINHA NO FIM!
export default ProfileStack;
