import * as React from 'react';

import { StyleSheet, Text, View } from 'react-native';
import { MaterialCircularProgressIndicator } from 'react-native-skia-ui/material-circular-progress-indicator';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { CupertinoActivityIndicator } from 'react-native-skia-ui/cupertino-activity-indicator';
export default function App() {
  const progress = useSharedValue(0);
  React.useEffect(() => {
    const id = setInterval(() => {
      progress.value = withTiming(Math.random(), { duration: 1000 });
    }, 1000);

    return () => clearInterval(id);
  });
  return (
    <View style={styles.container}>
      <Text>Determinate progress indicators</Text>
      <MaterialCircularProgressIndicator.Determinate
        size={56}
        valueColor="green"
        strokeWidth={5}
        strokeCap="round"
        value={progress}
      />
      <MaterialCircularProgressIndicator.Determinate
        size={100}
        valueColor="blue"
        strokeWidth={4}
        strokeCap="round"
        value={progress}
      />
      <CupertinoActivityIndicator.PartiallyRevealed
        color="black"
        progress={progress}
        radius={50}
      />

      <Text>Indeterminate progress indicators</Text>
      <MaterialCircularProgressIndicator.Indeterminate
        size={40}
        valueColor="black"
      />
      <MaterialCircularProgressIndicator.Indeterminate
        size={100}
        valueColor="red"
        backgroundColor={'#f0f0f0'}
        strokeWidth={8}
        strokeCap="round"
      />
      <CupertinoActivityIndicator color="black" radius={50} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    gap: 20,
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    backgroundColor: 'blue',
    marginVertical: 20,
  },
});
