import {
  Text,
  Pressable,
  PressableProps,
  TextInput,
  TextInputProps,
} from "react-native";
import classNames from "classnames";

export const CustomTextInput = (props: TextInputProps) => {
  return (
    <TextInput
      className="bg-white dark:bg-slate-800 border focus:bg-slate-50 dark:focus:bg-slate-900 border-slate-800 dark:border-white p-2 mt-2 rounded w-10/12 dark:text-white text-[16px]"
      {...props}
    />
  );
};

interface CustomButtonProps extends PressableProps {
  title: string;
  variant?: "primary" | "secondary" | "outline";
}

export const CustomButton = (props: CustomButtonProps) => {
  return (
    <Pressable
      className={classNames(
        "w-10/12 mt-2 p-2 rounded",
        props.variant === "primary" &&
          "bg-slate-800 active:bg-slate-900 dark:bg-white dark:active:bg-slate-300",
        props.variant === "secondary" &&
          "dark:bg-slate-900 active:bg-slate-100 dark:active:bg-slate-700 border border-slate-900",
        props.variant === "outline" &&
          "dark:bg-slate-700 active:bg-slate-100 dark:active:bg-slate-500 border border-slate-500"
      )}
      {...props}
    >
      <Text
        className={classNames(
          "text-[16px] font-bold text-center text-slate-100 dark:text-slate-900",
          props.variant === "primary"
            ? "dark:text-slate-900"
            : "text-slate-900 dark:text-white"
        )}
      >
        {props.title}
      </Text>
    </Pressable>
  );
};
