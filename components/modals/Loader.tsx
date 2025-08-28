import React from "react";
import {
    Modal,
    Platform,
    StyleSheet,
    ActivityIndicator,
    View, Dimensions,
} from "react-native";
import MaterialIndicator from "@/components/indicators/MaterialIndicator";

interface SpinnerPropTypes {
    overlayColor?: string;
    size?: number;
    visible?: boolean;
    mode?: "modal" | "container";
}

interface IndicatorProps {
    options?: {
        key?: string | number;
        size?: number;
        [key: string]: any; // Ca să putem da mai departe și alte props
    };
}

const Indicator: React.FC<IndicatorProps> = ({options}) => {
    // Extragem explicit `key` și restul proprietăților
    const {key, size, ...restProps} = options || {};

    return Platform.OS === "ios" ? (
        <ActivityIndicator
            size={"large"}
            color="#1cb0f6"
            {...restProps}
        />
    ) : (
        <MaterialIndicator
            /* dacă ai nevoie efectiv de key, îl pui explicit */
            key={key}
            size={size || 50}
            color="#57cc04"
            style={styles.activityIndicator}
            {...restProps}
        />
    );
};

const Loader: React.FC<SpinnerPropTypes> = React.memo(
    ({
         overlayColor = "transparent",
         size = 50,
         visible = false,
         mode = "modal"
     }) => {
        return mode === "container" ? (
            <View style={[
                !visible && {display: "none"},
                styles.containerAbsolute,
                styles.container,
                {backgroundColor: overlayColor}
            ]}>
                <Indicator options={{size}}/>
            </View>
        ) : (
            <Modal
                animationType="none"
                transparent={true}
                visible={visible}
                statusBarTranslucent={true}
            >
                <View
                    style={[
                        styles.container,
                        {
                            backgroundColor: overlayColor,
                            margin: 0,
                            marginTop: 0,
                            marginBottom: 0,
                        },
                    ]}
                >
                    {/* Trimitem ce avem nevoie (aici doar `size`), fără `key` */}
                    <Indicator options={{size}}/>
                </View>
            </Modal>
        );
    }
);

export default Loader;

const styles = StyleSheet.create({
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "transparent",
    },
    container: {
        backgroundColor: "transparent",
        height: Dimensions.get("screen").height,
        width: Dimensions.get("screen").width,
        alignItems: "center",
        justifyContent: "center",
    },
    containerAbsolute: {
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 10
    },
    activityIndicator: {
        width: 50,
        height: 50,
        backgroundColor: "transparent",
    },
});





