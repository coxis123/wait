import { Tabs } from 'expo-router';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Colors, BorderRadius, Spacing } from '../../lib/constants';

function TabBarIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    index: '🏠',
    list: '📋',
    stats: '📊',
  };

  return (
    <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
      <View style={styles.icon}>
        <View style={{ opacity: focused ? 1 : 0.5 }}>
          <View style={styles.emojiContainer}>
            {/* Using text for emoji icons */}
            <View style={{ transform: [{ scale: focused ? 1.1 : 1 }] }}>
              <View style={styles.emojiText}>
                {icons[name] === '🏠' && <HomeIcon focused={focused} />}
                {icons[name] === '📋' && <ListIcon focused={focused} />}
                {icons[name] === '📊' && <StatsIcon focused={focused} />}
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

function HomeIcon({ focused }: { focused: boolean }) {
  return (
    <View style={[styles.svgIcon, { opacity: focused ? 1 : 0.5 }]}>
      <View style={styles.homeIconHouse} />
      <View style={styles.homeIconRoof} />
    </View>
  );
}

function ListIcon({ focused }: { focused: boolean }) {
  return (
    <View style={[styles.svgIcon, { opacity: focused ? 1 : 0.5 }]}>
      <View style={styles.listIconLine} />
      <View style={[styles.listIconLine, { marginTop: 4 }]} />
      <View style={[styles.listIconLine, { marginTop: 4 }]} />
    </View>
  );
}

function StatsIcon({ focused }: { focused: boolean }) {
  return (
    <View style={[styles.svgIconRow, { opacity: focused ? 1 : 0.5 }]}>
      <View style={[styles.statsBar, { height: 12 }]} />
      <View style={[styles.statsBar, { height: 18 }]} />
      <View style={[styles.statsBar, { height: 8 }]} />
    </View>
  );
}

function AddButton() {
  return (
    <TouchableOpacity
      style={styles.addButton}
      onPress={() => router.push('/add')}
      activeOpacity={0.8}
    >
      <View style={styles.addButtonInner}>
        <View style={styles.addButtonPlus}>
          <View style={styles.plusHorizontal} />
          <View style={styles.plusVertical} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function TabsLayout() {
  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerTintColor: Colors.text,
          headerTitleStyle: {
            fontWeight: '600',
          },
          tabBarStyle: {
            backgroundColor: Colors.background,
            borderTopColor: Colors.cardBorder,
            height: 90,
            paddingBottom: 30,
            paddingTop: 10,
          },
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textTertiary,
          tabBarShowLabel: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            headerShown: false,
            tabBarIcon: ({ focused }) => <TabBarIcon name="index" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="list"
          options={{
            title: 'Your Items',
            headerShown: false,
            tabBarIcon: ({ focused }) => <TabBarIcon name="list" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="stats"
          options={{
            title: 'Your Stats',
            headerShown: false,
            tabBarIcon: ({ focused }) => <TabBarIcon name="stats" focused={focused} />,
          }}
        />
      </Tabs>
      <AddButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerFocused: {},
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgIconRow: {
    width: 24,
    height: 24,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 3,
  },
  homeIconHouse: {
    width: 14,
    height: 10,
    backgroundColor: Colors.text,
    borderRadius: 2,
    marginTop: 6,
  },
  homeIconRoof: {
    position: 'absolute',
    top: 0,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: Colors.text,
  },
  listIconLine: {
    width: 18,
    height: 3,
    backgroundColor: Colors.text,
    borderRadius: 2,
  },
  statsBar: {
    width: 5,
    backgroundColor: Colors.text,
    borderRadius: 2,
  },
  addButton: {
    position: 'absolute',
    bottom: 45,
    alignSelf: 'center',
    zIndex: 100,
  },
  addButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonPlus: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusHorizontal: {
    position: 'absolute',
    width: 20,
    height: 3,
    backgroundColor: Colors.white,
    borderRadius: 2,
  },
  plusVertical: {
    position: 'absolute',
    width: 3,
    height: 20,
    backgroundColor: Colors.white,
    borderRadius: 2,
  },
});
