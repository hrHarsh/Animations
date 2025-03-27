import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { normalize, vh, vw } from '@wanderobe/utils/dimensions';

const TimeDigit = ({ digit, prevDigit, shouldAnimate }: { digit: string; prevDigit: string; shouldAnimate: boolean }) => {
  const flipAnimation = useSharedValue(0);
  const [displayDigit, setDisplayDigit] = useState(digit);

  useEffect(() => {
    if (shouldAnimate) {
      setDisplayDigit(prevDigit);
      flipAnimation.value = 0;
      flipAnimation.value = withSequence(
        withTiming(1, { 
          duration: 300,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1)
        }, (finished) => {
          'worklet';
          if (finished) {
            runOnJS(setDisplayDigit)(digit);
          }
        })
      );
    } else {
      setDisplayDigit(digit);
    }
  }, [digit, shouldAnimate]);

  const topStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { translateY: (35) },
      { rotateX: `${flipAnimation.value * -90}deg` },
      { translateY: (-35) }
    ],
    backfaceVisibility: 'hidden',
    backgroundColor: '#1a1a1a',
    zIndex: flipAnimation.value >= 0.5 ? 0 : 1,
  }));

  return (
    <View style={styles.digitContainer}>
      <View style={styles.bottomCard}>
        <Text style={styles.digitText}>{digit}</Text>
      </View>
      
      <View style={styles.middleLine} />
      
      <View style={[styles.topCard]}>
        <Text style={styles.digitText}>{digit}</Text>
      </View>

      <Animated.View style={[styles.topCard, topStyle]}>
        <Text style={styles.digitText}>{displayDigit}</Text>
      </Animated.View>
    </View>
  );
};

export const DigitalClock = () => {
  const [time, setTime] = useState(new Date());
  const [prevTime, setPrevTime] = useState(new Date());

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      // Calculate delay to next second
      const delay = 1000 - now.getMilliseconds();
      
      setTimeout(() => {
        setPrevTime(time);
        setTime(now);
        // Schedule next update
        updateClock();
      }, delay);
    };

    // Start the update cycle
    updateClock();

    return () => {
      // No need to clear timeout as the effect cleanup will handle it
    };
  }, [time]);

  const format = (num: number) => num.toString().padStart(2, '0');

  const hours = format(time.getHours());
  const prevHours = format(prevTime.getHours());
  const minutes = format(time.getMinutes());
  const prevMinutes = format(prevTime.getMinutes());
  const seconds = format(time.getSeconds());
  const prevSeconds = format(prevTime.getSeconds());

  return (
    <View style={styles.container}>
      <TimeDigit digit={hours[0]} prevDigit={prevHours[0]} shouldAnimate={hours[0] !== prevHours[0]} />
      <TimeDigit digit={hours[1]} prevDigit={prevHours[1]} shouldAnimate={hours[1] !== prevHours[1]} />
      <View style={styles.separator}>
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
      <TimeDigit digit={minutes[0]} prevDigit={prevMinutes[0]} shouldAnimate={minutes[0] !== prevMinutes[0]} />
      <TimeDigit digit={minutes[1]} prevDigit={prevMinutes[1]} shouldAnimate={minutes[1] !== prevMinutes[1]} />
      <View style={styles.separator}>
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
      <TimeDigit digit={seconds[0]} prevDigit={prevSeconds[0]} shouldAnimate={seconds[0] !== prevSeconds[0]} />
      <TimeDigit digit={seconds[1]} prevDigit={prevSeconds[1]} shouldAnimate={seconds[1] !== prevSeconds[1]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  digitContainer: {
    width: vw(45),
    height: vh(70),
    margin: vw(2),
    position: 'relative',
  },
  topCard: {
    position: 'absolute',
    width: '100%',
    height: '50%',
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderBottomWidth: 0,
  },
  bottomCard: {
    position: 'absolute',
    top: '50%',
    width: '100%',
    height: '50%',
    backgroundColor: '#1a1a1a',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderTopWidth: 0,
  },
  digitText: {
    fontSize: normalize(55),
    color: '#ffffff',
    fontWeight: Platform.OS === 'ios' ? '900' : 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-black',
    includeFontPadding: false,
    height: vh(70),
    lineHeight: vh(70),
    textAlign: 'center',
  },
  separator: {
    height: vh(60),
    justifyContent: 'center',
    alignItems: 'center',
    gap: vh(8),
    marginHorizontal: vw(2),
  },
  dot: {
    width: vw(3),
    height: vw(3),
    borderRadius: vw(1.5),
    backgroundColor: '#1a1a1a',
  },
  middleLine: {
    position: 'absolute',
    top: '50%',
    width: '100%',
    height: 1,
    backgroundColor: '#000',
    opacity: 0.3,
    zIndex: 2,
  },
});
