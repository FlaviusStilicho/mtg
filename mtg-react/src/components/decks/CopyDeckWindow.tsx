import { Alert, Button, Dialog, List, ListItem, Snackbar, TextField } from "@mui/material";
import { useState } from "react";
import axios from "axios";
import { DeckDTO } from "../../../../mtg-common/src/DTO";
import { CopyDeckRequest } from "../../../../mtg-common/src/requests";

export interface CopyDeckWindowProps {
    opened: boolean;
    onClose: () => void;
    deck: DeckDTO;
    fetchDecks: () => void;
}

export const CopyDeckWindow: React.FC<CopyDeckWindowProps> = (props) => {
    const [newName, setNewName] = useState<string>("")

    const [snackbarMessage, setSnackbarMessage] = useState<string>("")
    const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false)

    const submitCopyDeck = () => {
        if (props.deck.id === undefined) {
            return
        } else {
            const request: CopyDeckRequest = {
                deckId: props.deck.id,
                name: newName
            }
            axios.post(`http://localhost:8000/decks/copy`, request).then(response => {
                props.onClose()
                props.fetchDecks()
            }).catch(req => {
                setSnackbarOpen(true)
                setSnackbarMessage(req.response.data)
            })
        }
    }

    return (
        <Dialog
            open={props.opened}
            onClose={props.onClose}>
            <List>
                <ListItem
                    style={{ justifyContent: 'center' }}
                    sx={{ py: 1.5, fontSize: 20 }}>
                    Copy deck
                </ListItem>

                <ListItem>
                    <TextField
                        defaultValue=""
                        variant="outlined"
                        required
                        label="Deck name"
                        onChange={event => setNewName(event.target.value)} />
                </ListItem>

                <ListItem style={{ justifyContent: 'center' }}>
                    <Button
                        variant="contained"
                        onClick={submitCopyDeck}
                        sx={{ margin: "10px" }}>
                        Copy Deck
                    </Button>
                    <Button
                        variant="contained"
                        onClick={props.onClose}
                        sx={{ margin: "10px" }}>
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