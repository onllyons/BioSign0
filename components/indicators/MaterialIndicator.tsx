import React, { useCallback } from 'react';
import {View, Animated, Easing, ViewStyle, StyleSheet, StyleProp} from 'react-native';
import Indicator from './Indicator';

type MaterialIndicatorProps = {
    animationDuration?: number;
    trackWidth?: number;
    color?: string;
    size?: number;
    style?: StyleProp<ViewStyle>;
};

type RenderComponentParams = {
    index: number;
    count: number;
    progress: Animated.Value;
};

const MaterialIndicator: React.FC<MaterialIndicatorProps> = ({
    animationDuration = 4000,
    color = 'rgb(0, 0, 0)',
    size = 40,
    trackWidth,
    style,
    ...props
}) => {
    const renderComponent = useCallback(({ index, count, progress }: RenderComponentParams) => {
        const borderWidth = trackWidth ?? size / 10;
        const frames = Math.round((60 * animationDuration) / 1000);
        const easing = Easing.bezier(0.4, 0.0, 0.7, 1.0);

        const sa = 7.5;
        const ea = 30;
        const sequences = 3;
        const rotations = 5;

        const inputRange = Array.from({ length: frames }, (_, frameIndex) => frameIndex / (frames - 1));

        const outputRange = inputRange.map((_, frameIndex) => {
            let progressValue = (2 * sequences * frameIndex) / (frames - 1);
            let rotation = index ? 360 - sa : -(180 - sa);
            let sequence = Math.ceil(progressValue);

            if (sequence % 2) {
                progressValue = progressValue - sequence + 1;
            } else {
                progressValue = sequence - progressValue;
            }

            const direction = index ? -1 : 1;
            return `${direction * (180 - (sa + ea)) * easing(progressValue) + rotation}deg`;
        });

        const layerStyle: ViewStyle = {
            width: size,
            height: size,
            transform: [
                { rotate: `${90 - sa}deg` },
                {
                    rotate: progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', `${360 * rotations}deg`],
                    }),
                },
            ],
        };

        const viewportStyle: ViewStyle = {
            width: size,
            height: size,
            transform: [
                { translateY: index ? -size / 2 : 0 },
                { rotate: progress.interpolate({ inputRange, outputRange }) },
            ],
        };

        const containerStyle: ViewStyle = {
            width: size,
            height: size / 2,
            overflow: 'hidden',
        };

        const offsetStyle = index ? { top: size / 2 } : {};

        const lineStyle: ViewStyle = {
            width: size,
            height: size,
            borderColor: color,
            borderRadius: size / 2,
            borderWidth,
        };

        return (
            <Animated.View style={styles.layer} key={index}>
                <Animated.View style={layerStyle}>
                    <Animated.View style={[containerStyle, offsetStyle]} collapsable={false}>
                        <Animated.View style={viewportStyle}>
                            <Animated.View style={containerStyle} collapsable={false}>
                                <Animated.View style={lineStyle} />
                            </Animated.View>
                        </Animated.View>
                    </Animated.View>
                </Animated.View>
            </Animated.View>
        );
    }, [animationDuration, color, size, trackWidth]);

    return (
        <View style={[styles.container, style]}>
            <Indicator
                style={{ width: size, height: size }}
                renderComponent={renderComponent}
                {...props}
                count={2}
                animationDuration={animationDuration}
            />
        </View>
    );
};

export default MaterialIndicator;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    layer: {
        ...StyleSheet.absoluteFillObject,

        justifyContent: 'center',
        alignItems: 'center',
    },
});
