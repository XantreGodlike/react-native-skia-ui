/**
 * Port of Flutter Material Progress Indicator https://github.com/flutter/flutter/blob/74e054f04ae59cd9e721710f183f53897b3c9ded/packages/flutter/lib/src/material/progress_indicator.dart#L411
 */

import {
  Canvas,
  createPicture,
  PaintStyle,
  Picture,
  type Size,
  type SkCanvas,
  Skia,
  StrokeCap,
} from '@shopify/react-native-skia';
import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  clamp,
  type SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';
import type { SetNonNullable, SetOptional } from 'type-fest';
import {
  K_INTERMEDIATE_CIRCULAR_DURATION,
  offsetTween,
  rotationTween,
  strokeHeadTween,
  strokeTailTween,
} from './constants';
import { rad2deg, type OrPlainValueProp } from '../utils';
import {
  useDuration,
  useToSharedValue,
  useToSharedValueOptional,
} from '../hooks';

type RenderCircularProgressProps = {
  backgroundColor: string | null;
  valueColor: string;

  value: number | null;

  headValue: number;
  tailValue: number;
  offsetValue: number;
  rotationValue: number;
  strokeWidth: number;
  strokeAlign: number;

  strokeCap: StrokeCap;
};

const renderCircularProgressIndicator = (
  canvas: SkCanvas,
  size: Size,
  props: RenderCircularProgressProps
) => {
  'worklet';

  const _twoPi = Math.PI * 2.0;
  const _epsilon = 0.001;
  const _sweep = _twoPi - _epsilon;
  const _startAngle = -Math.PI / 2.0;

  let arcStart: number | null = null;
  let arcSweep: number | null = null;
  if (props.value === null) {
    arcStart =
      _startAngle +
      ((props.tailValue * 3) / 2) * Math.PI +
      props.rotationValue * Math.PI * 2.0 +
      props.offsetValue * 0.5 * Math.PI;
    arcSweep = Math.max(
      ((props.headValue * 3) / 2) * Math.PI -
        ((props.tailValue * 3) / 2) * Math.PI,
      _epsilon
    );
  } else {
    arcStart = _startAngle;
    arcSweep = clamp(props.value, 0.0, 1.0) * _sweep;
  }

  // painting
  const paint = Skia.Paint();
  paint.setColor(Skia.Color(props.valueColor));
  paint.setStrokeWidth(props.strokeWidth);
  paint.setStyle(PaintStyle.Stroke);
  const strokeOffset = (props.strokeWidth / 2) * -props.strokeAlign;

  const arcRect = Skia.XYWHRect(
    strokeOffset,
    strokeOffset,
    size.width - strokeOffset * 2,
    size.height - strokeOffset * 2
  );

  paint.setStrokeCap(props.strokeCap ?? StrokeCap.Square);
  if (props.backgroundColor) {
    const bgPaint = paint.copy();
    bgPaint.setColor(Skia.Color(props.backgroundColor));

    canvas.drawArc(arcRect, rad2deg(0), rad2deg(_twoPi), false, bgPaint);
  }

  canvas.drawArc(arcRect, rad2deg(arcStart), rad2deg(arcSweep), false, paint);
};

type InternalProps = {
  size: SharedValue<number>;
  /**
   * Value between 0 and 1
   * If undefined, the progress indicator will be indeterminate
   */
  value: SharedValue<number | undefined>;
  stopped: SharedValue<boolean>;

  backgroundColor: SharedValue<string | undefined>;
  valueColor: SharedValue<string>;

  strokeCap?: 'round' | 'square' | 'butt';
  strokeWidth: SharedValue<number>;
  strokeAlign?: number;
};

const _Content = ({
  size: _size,
  strokeWidth,
  value,
  strokeCap = 'square',
  backgroundColor,
  valueColor,
  stopped,
  strokeAlign,
}: InternalProps) => {
  const size = useDerivedValue(() => ({
    width: _size.value,
    height: _size.value,
  }));

  const animationValue = useDuration({
    stopped: useDerivedValue(
      () => stopped.value || value.value !== undefined,
      [stopped, value]
    ),
    timing: K_INTERMEDIATE_CIRCULAR_DURATION,
  });

  const headValue = useDerivedValue(() =>
    strokeHeadTween(animationValue.value)
  );
  const tailValue = useDerivedValue(() =>
    strokeTailTween(animationValue.value)
  );
  const offsetValue = useDerivedValue(() => offsetTween(animationValue.value));
  const rotationValue = useDerivedValue(() =>
    rotationTween(animationValue.value)
  );

  return (
    <Animated.View style={useAnimatedStyle(() => size.value)}>
      <Canvas style={StyleSheet.absoluteFill}>
        <Picture
          picture={useDerivedValue(() => {
            const sizeValue = size.value;
            const params: RenderCircularProgressProps = {
              value: value.value ?? null,
              headValue: headValue.value,
              offsetValue: offsetValue.value,
              rotationValue: rotationValue.value,
              tailValue: tailValue.value,

              valueColor: valueColor.value,
              backgroundColor: backgroundColor.value ?? null,

              strokeAlign: strokeAlign ?? -1.0,
              strokeWidth: strokeWidth.value,
              strokeCap:
                strokeCap === 'butt'
                  ? StrokeCap.Butt
                  : strokeCap === 'round'
                    ? StrokeCap.Round
                    : StrokeCap.Square,
            };

            return createPicture((canvas) => {
              renderCircularProgressIndicator(canvas, sizeValue, params);
            }, sizeValue);
          })}
        />
      </Canvas>
    </Animated.View>
  );
};

export type InternalOrSharedProps = OrPlainValueProp<
  InternalProps,
  | 'size'
  | 'value'
  | 'strokeWidth'
  | 'backgroundColor'
  | 'valueColor'
  | 'stopped'
>;

export type DefaultedKeys = 'strokeWidth' | 'backgroundColor';
export type MaterialCircularProgressIndicatorProps = SetOptional<
  InternalOrSharedProps,
  DefaultedKeys | 'stopped' | 'value'
>;

export type DeterminateMaterialCircularProgressIndicatorProps = SetOptional<
  SetNonNullable<Omit<InternalOrSharedProps, 'stopped'>, 'value'>,
  DefaultedKeys
>;

export type IndeterminateMaterialCircularProgressIndicatorProps = SetOptional<
  Omit<InternalOrSharedProps, 'value'>,
  DefaultedKeys | 'stopped'
>;

const MaterialCircularProgressIndicator_ = (
  props: MaterialCircularProgressIndicatorProps
) => (
  <_Content
    {...props}
    size={useToSharedValue(props.size)}
    value={useToSharedValue(props.value)}
    stopped={useToSharedValueOptional(props.stopped, false)}
    strokeWidth={useToSharedValueOptional(props.strokeWidth, 4)}
    backgroundColor={useToSharedValue(props.backgroundColor)}
    valueColor={useToSharedValue(props.valueColor)}
  />
);

const IndeterminateMaterialCircularProgressIndicator = (
  props: IndeterminateMaterialCircularProgressIndicatorProps
) => (
  <_Content
    {...props}
    size={useToSharedValue(props.size)}
    value={useSharedValue(undefined)}
    stopped={useToSharedValueOptional(props.stopped, false)}
    strokeWidth={useToSharedValueOptional(props.strokeWidth, 4)}
    backgroundColor={useToSharedValue(props.backgroundColor)}
    valueColor={useToSharedValue(props.valueColor)}
  />
);

const DeterminateMaterialCircularProgressIndicator = (
  props: DeterminateMaterialCircularProgressIndicatorProps
) => (
  <_Content
    {...props}
    size={useToSharedValue(props.size)}
    value={useToSharedValue(props.value)}
    stopped={useSharedValue(false)}
    strokeWidth={useToSharedValueOptional(props.strokeWidth, 4)}
    backgroundColor={useToSharedValue(props.backgroundColor)}
    valueColor={useToSharedValue(props.valueColor)}
  />
);

/**
 *
 * @description Component has two modes: determinate and indeterminate. Which are controlled by the `value` prop.
 * If `value` is undefined, the progress indicator will be indeterminate.
 * If `value` is a number between 0 and 1, the progress indicator will be determinate.
 *
 *
 * Not all props applies to both modes. For more type safety, use `MaterialCircularProgressIndicator.Determinate` and `MaterialCircularProgressIndicator.Indeterminate` components.
 */
export const MaterialCircularProgressIndicator = Object.assign(
  MaterialCircularProgressIndicator_,
  {
    Indeterminate: IndeterminateMaterialCircularProgressIndicator,
    Determinate: DeterminateMaterialCircularProgressIndicator,
  }
);

export {
  /**
   * @deprecated use `MaterialCircularProgressIndicator.Indeterminate` instead
   */
  IndeterminateMaterialCircularProgressIndicator,
  /**
   * @deprecated use `MaterialCircularProgressIndicator.Determinate` instead
   */
  DeterminateMaterialCircularProgressIndicator,
};
