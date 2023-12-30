import { Alert, Button, Dialog, List, ListItem, Snackbar } from "@mui/material";
import { useState, memo } from "react";
import axios from "axios";

export interface UploadCollectionWindowProps {
  opened: boolean;
  onClose: () => void;
  openInfoSnackbar: (message: string) => void;
  openErrorSnackbar: (message: string) => void;
}

export const UploadCollectionWindow = memo(
  (props: UploadCollectionWindowProps) => {
    const [file, setFile] = useState<File | null>(null);

    const onSuccessfulSubmit = (result: string[]) => {
      setFile(null);

      props.openInfoSnackbar("Upload successful!\n" + result.join("\n"));
      props.onClose();
    };

    const uploadCollectionFile = () => {
      if (file instanceof File) {
        let formData = new FormData();
        formData.append("csv", file);

        axios
          .post("http://localhost:8000/uploads/delver/additive", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
          .then((response) => {
            const result: string[] = response.data["result"];
            onSuccessfulSubmit(result);
          })
          .catch((err) => {
            props.openErrorSnackbar(err);
          });
      }
    };

    return (
      <Dialog
        open={props.opened}
        onClose={props.onClose}
        PaperProps={{
          style: {},
        }}
      >
        <List>
          <ListItem sx={{ py: 1.5, fontSize: 20 }}>Upload Collection</ListItem>

          <ListItem>
            <input
              type="file"
              onChange={(e) => {
                if (e.target.files !== null) {
                  setFile(e.target.files[0]);
                }
              }}
            ></input>
          </ListItem>

          <ListItem>
            <Button
              variant="contained"
              disabled={file === null}
              onClick={uploadCollectionFile}
            >
              Submit
            </Button>
          </ListItem>
        </List>
      </Dialog>
    );
  },
);
