import { Box } from "@mui/material"
import { colorIconSize } from "../constants"

export interface ColorIconProps {
    color: string
}

export default function ColorIcon(props: ColorIconProps){
    return <Box
        component="img"
        key={props.color}
        sx={{
        height: colorIconSize,
        width: colorIconSize,
        maxHeight: colorIconSize,
        maxWidth: colorIconSize,
        }}
        src={`http://localhost:3000/mana/${props.color}.png`}
        />
}