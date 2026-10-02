import { Text, View } from "react-native";
import { ThemeProvider, useColors } from "@aazenc/ui-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

function Screen() {
  const colors = useColors();

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        backgroundColor: colors.background,
      }}
    >
      <Text style={{ color: colors.foreground, fontSize: 22 }}>AazenC UI</Text>
      <Text
        style={{
          color: colors.mutedForeground,
          marginTop: 8,
          textAlign: "center",
        }}
      >
        Native playground skeleton. Components are added one by one.
      </Text>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Screen />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
