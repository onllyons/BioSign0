import React, {useEffect, useRef} from 'react';
import {Animated, Easing, ViewProps} from 'react-native';

type IndicatorProps = ViewProps & {
    animationEasing?: (value: number) => number;
    animationDuration?: number;
    hideAnimationDuration?: number;
    animating?: boolean;
    interaction?: boolean;
    hidesWhenStopped?: boolean;
    renderComponent?: (params: { index: number; count: number; progress: Animated.Value }) => React.ReactNode;
    count?: number;
};

const Indicator: React.FC<IndicatorProps> = ({
    animationEasing = Easing.linear,
    animationDuration = 1200,
    hideAnimationDuration = 200,
    animating = true,
    interaction = true,
    hidesWhenStopped = true,
    renderComponent,
    count = 1,
    style = {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    },
    ...props
}) => {
    const progress = useRef(new Animated.Value(0)).current;
    const hideAnimation = useRef(new Animated.Value(animating ? 1 : 0)).current;
    const animationState = useRef(0);
    const savedValue = useRef(0);

    useEffect(() => {
        if (animating) {
            startAnimation();
        } else {
            stopAnimation();
        }

        Animated.timing(hideAnimation, {
            toValue: animating ? 1 : 0,
            duration: hideAnimationDuration,
            useNativeDriver: true,
        }).start();
    }, [animating]);

    const startAnimation = () => {
        if (animationState.current !== 0) return;

        Animated.loop(
            Animated.timing(progress, {
                duration: animationDuration,
                easing: animationEasing,
                useNativeDriver: true,
                isInteraction: interaction,
                toValue: 1,
            })
        ).start();

        animationState.current = 1;
    };

    const stopAnimation = () => {
        if (animationState.current !== 1) return;

        progress.stopAnimation((value) => {
            savedValue.current = value;
            animationState.current = 0;
        });

        animationState.current = -1;
    };

    const renderAnimatedComponent = (item: any, index: number) => {
        if (typeof renderComponent === 'function') {
            return renderComponent({index, count, progress});
        }
        return null;
    };

    return (
        <Animated.View {...props} style={[hidesWhenStopped ? {opacity: hideAnimation} : {}, style]}>
            {Array.from({length: count}, (_, i) => renderAnimatedComponent(null, i))}
        </Animated.View>
    );
};

export default Indicator;
