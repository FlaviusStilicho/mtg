import { Dialog } from "@mui/material";
import { DeckDTO } from '../../../../mtg-common/src/DTO';

export interface EditDeckWindowProps {
    deck: DeckDTO
    opened: boolean;
    onClose: () => void;
}

const MTGCardPopup: React.FC<EditDeckWindowProps> = (props) => {
    const deck = props.deck

    const listStyle: any = {
        "display": "flex",
        "overflow-x": "auto",
        "flexDirection": 'row',
    }

    return (
        <Dialog
            open={props.opened}
            onClose={props.onClose}
            fullWidth
            maxWidth="md"
            PaperProps={{
                style: {
                    backgroundColor: 'transparent',
                    boxShadow: 'none',
                    textAlign: 'center',
                    display: "flex",
                    justifyContent: 'center',
                    alignItems: 'center'
                },
            }}
        >
    
        </Dialog>
    )
}