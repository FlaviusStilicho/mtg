import { Alert, Button, Dialog, List, ListItem, MenuItem, Snackbar, TextField } from "@mui/material";
import { useState } from "react";
import axios from "axios";
import { parseMTGGoldfishFile } from "../../functions/parseNewDeck";
import { UploadDeckDTO } from "../../../../mtg-common/src/DTO";

export interface CreateDeckWindowProps {
    opened: boolean;
    onClose: () => void;
    fetchDecks: any;
}

const supportedFileFormats = ['mtggoldfish [txt]']

export const CreateDeckWindow: React.FC<CreateDeckWindowProps> = (props) => {
    const [name, setName] = useState<string>("")
    const formats = ["Standard", "Commander"]
    const [selectedFormat, setSelectedFormat] = useState<string>("Commander")
    const [file, setFile] = useState<File | null>(null)
    const [selectedFileFormat, setSelectedFileFormat] = useState<string>(supportedFileFormats[0])

    const [snackbarMessage, setSnackbarMessage] = useState<string>("")
    const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false)

    const onSuccessfulSubmit = () => {
        setName("")
        setSelectedFormat("")
        setFile(null)
        setSelectedFileFormat(supportedFileFormats[0])
        props.onClose()
        props.fetchDecks()
    }

    const submitNewDeck = () => {
        if (file === null) {
            axios.post(`http://localhost:8000/decks`, {
                name,
                format: selectedFormat
            }).then(response => {
                onSuccessfulSubmit()
            }).catch(req => {
                setSnackbarOpen(true)
                setSnackbarMessage(req.response.data)
            })
        } else if (selectedFileFormat === 'mtggoldfish [txt]'){
            parseMTGGoldfishFile(file).then(entries => {
                const request: UploadDeckDTO = {
                    name,
                    format: selectedFormat,
                    entries
                }
                axios.post(`http://localhost:8000/decks/upload`, request).then(response => {
                    onSuccessfulSubmit()
                }).catch(req => {
                    setSnackbarOpen(true)
                    setSnackbarMessage(req.response.data)
                })
            })
        } else {
            console.error("Unsupported file format!")
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
                    Create new deck
                </ListItem>

                <ListItem>
                    <TextField
                        defaultValue=""
                        fullWidth
                        variant="outlined"
                        required
                        label="Deck name"
                        onChange={event => setName(event.target.value)} />
                </ListItem>

                <ListItem>
                    <TextField
                        select
                        fullWidth
                        defaultValue=""
                        variant="outlined"
                        required
                        label="Format"
                        onChange={event => setSelectedFormat(event.target.value)}>
                        {formats.map(format => (
                            <MenuItem key={format}
                                value={format}>
                                {format}
                            </MenuItem>
                        ))}
                    </TextField>
                </ListItem>

                <ListItem>
                    <input type="file" onChange={e => {
                        if (e.target.files !== null) {
                            setFile(e.target.files[0])
                        }
                    }}></input>
                </ListItem>

                <ListItem>
                    <TextField
                        select
                        fullWidth
                        variant="outlined"
                        required
                        label="File format"
                        onChange={event => setSelectedFileFormat(event.target.value)}>
                        {supportedFileFormats.map(format => (
                            <MenuItem key={format}
                                value={format}>
                                {format}
                            </MenuItem>
                        ))}
                    </TextField>
                </ListItem>

                <ListItem style={{ justifyContent: 'center' }}>
                    <Button
                        variant="contained"
                        onClick={submitNewDeck}
                        sx={{ margin: "10px" }}>
                        Create Deck
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