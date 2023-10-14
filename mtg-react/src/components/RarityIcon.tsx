import { Box } from "@mui/material"
import { colorIconSize } from "../constants"

export interface RarityIconProps {
    rarity: string
}

export default function RarityIcon(props: RarityIconProps){
    return <Box
        component="img"
        key={props.rarity}
        sx={{
        height: colorIconSize,
        width: colorIconSize,
        maxHeight: colorIconSize,
        maxWidth: colorIconSize,
        }}
        src={`http://localhost:3000/${props.rarity}.png`}
        />
}