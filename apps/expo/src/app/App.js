


import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';

const Tab = createBottomTabNavigator();

const HomeScreen = () => <View><Text>Home</Text></View>;
const PointsScreen = () => <View><Text>Points</Text></View>;
const ScanScreen = () => <View><Text>Scan</Text></View>;
const ChatScreen = () => <View><Text>Chat</Text></View>;
const MenuScreen = () => <View><Text>  </Text></View>;



const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            if (route.name === 'Home') {
              return <Image source={require('./assets/casa.png')} style={{ width: size, height: size, tintColor: color }} />;
            } else if (route.name === 'Points') {
              return <Image source={require('./assets/pontos.png')} style={{ width: size, height: size, tintColor: color }} />;
            } else if (route.name === 'Chat') {
              return <Image source={require('./assets/mensagem.png')} style={{ width: size, height: size, tintColor: color }} />;
              
            }else if(route.name=='Scan'){
              return <View style={{backgroundColor:'#02391E', padding:15, borderRadius:28, marginBottom:'5rem'}}><Image source={require('./assets/QRCODE_certo.png')} style={{ width: size+4, height: size+4, tintColor: 'white' }} /></View>;

            }else if (route.name === 'Menu') {
              return <Image source={require('./assets/menu.png')} style={{ width: size, height: size, tintColor: color }} />;
            }
          },
          tabBarShowLabel: true,
          tabBarStyle: {
            position: 'absolute',
            backgroundColor: '#e0e0e0',
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            height: 70,
            paddingBottom: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
          },
          tabBarActiveTintColor: 'green',
          tabBarInactiveTintColor: 'black',
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Início' }} />
        <Tab.Screen name="Points" component={PointsScreen} options={{ tabBarLabel: 'Pontos' }} />
        <Tab.Screen
          name="Scan"
          component={ScanScreen}
          options={{
            tabBarLabel: 'Escanear',
             // Botão "Escanear" licável
          }}
        />
        <Tab.Screen name="Chat" component={ChatScreen} options={{ tabBarLabel: 'Chat' }} />
        <Tab.Screen name="Menu" component={MenuScreen} options={{ tabBarLabel: 'Menu' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;

