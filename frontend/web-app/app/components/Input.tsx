import {useController, UseControllerProps} from "react-hook-form";
import {Label, TextInput} from "flowbite-react";
import {HTMLInputTypeAttribute} from "react";

type Props = {
    label: string;
    type?: HTMLInputTypeAttribute;
    showLabel?: boolean;
} & UseControllerProps;

export default function Input(props: Props) {
    const {fieldState: {error, isDirty}, field} = useController({...props, defaultValue: ''});

    return (
        <div className={'mb-3'}>
            {props.showLabel &&
                <div className={'mb-2 block'}>
                    <Label htmlFor={field.name} value={props.label}/>
                </div>
            }
            <TextInput
                {...props}
                {...field}
                placeholder={props.label}
                color={error ? 'failure' : !isDirty ? '' : 'success'}
                helperText={error?.message as string}
            />
        </div>
    )
}