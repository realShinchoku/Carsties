import {useController, UseControllerProps} from "react-hook-form";
import 'react-datepicker/dist/react-datepicker.css';
import ReactDatePicker, {ReactDatePickerProps} from "react-datepicker";

type Props = {
    label: string;
} & UseControllerProps & Partial<ReactDatePickerProps>;

export default function DateInput(props: Props) {
    const {fieldState: {error, isDirty, invalid}, field} = useController({...props, defaultValue: ''});

    return (
        <div className={'block'}>
            <ReactDatePicker
                {...props}
                {...field}
                onChange={value => field.onChange(value)}
                selected={field.value}
                placeholderText={props.label}
                className={`
                    rounded-lg w-[100%] flex flex-col
                    ${error ? 'bg-red-50 border-red-500 text-red-900'
                    : !invalid && isDirty ? 'bg-green-50 border-green-500 text-green-900' : ''}
                `}
            />
            {error && <div className={'text-red-500 text-sm'}>{error.message}</div>}
        </div>
    )
}