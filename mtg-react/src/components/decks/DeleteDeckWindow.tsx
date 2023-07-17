import { Alert, Button, Dialog, List, ListItem, Snackbar } from "@mui/material";
import { useState } from "react";
import axios from "axios";
import { DeckDTO } from '../../../../mtg-common/dist/DTO';

export interface DeleteDeckWindowProps {
    opened: boolean;
    onClose: () => void;
    deck: DeckDTO;
    fetchDecks: any;
}

export const DeleteDeckWindow: React.FC<DeleteDeckWindowProps> = (props) => {

    const [snackbarMessage, setSnackbarMessage] = useState<string>("")
    const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false)

    const submitDeleteDeck = () => {
        props.onClose()
        axios.delete(`http://localhost:8000/decks?id=${props.deck.id}`
        ).then(response => {
            props.fetchDecks()
        }).catch(req => {
            setSnackbarOpen(true)
            setSnackbarMessage(req.response.data)
        })
    }

    return (
        <Dialog
            open={props.opened}
            onClose={props.onClose}
            PaperProps={{
                style: {

                },
            }}
        >
            <List>
                <ListItem 
                sx={{ py: 1.5, fontSize: 20 }}
                style={{justifyContent:'center'}} >
                    Delete deck
                </ListItem>

                <ListItem>
                    Are you sure you want to delete deck {props.deck != null ? props.deck.name : ""}?
                </ListItem>

                <ListItem  style={{justifyContent:'center'}} >
                    <Button
                        variant="contained"
                        onClick={submitDeleteDeck}
                        sx={{ margin: "10px"}}>
                        Delete Deck
                    </Button>
                    <Button
                        variant="contained"
                        onClick={props.onClose}
                        sx={{ margin: "10px"}}>
                        Cancel
                    </Button>
                </ListItem>
            </List>
            <Snackbar
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                open={snackbarOpen}
                autoHideDuration={6000}>
                <Alert severity="error" sx={{ width: '100%' }}>{snackbarMessage}</Alert>
            </Snackbar>

        </Dialog>
    )
}