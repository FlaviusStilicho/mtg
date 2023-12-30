import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { PriceInformation } from "mtg-common";
import React from "react";
import { sortPriceInfo } from "../../functions/cardPrice";

interface PriceInfoTableProps {
  priceInfo: PriceInformation[];
}

const PriceInfoTable: React.FC<PriceInfoTableProps> = ({ priceInfo }) => {
  return (
    <TableContainer
      sx={{
        backgroundColor: "white",
        borderRadius: "10px",
        marginTop: "10px",
        border: "3px solid black", // Add black border
      }}
    >
      <Table
        sx={{
          "& th": {
            padding: "6px",
          },
          "& td": {
            padding: "6px",
          },
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell>In Stock</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Store</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {priceInfo.sort(sortPriceInfo).map((priceInfo) => (
            <TableRow key={priceInfo.store}>
              <TableCell>{priceInfo.inStock ? "Yes" : "No"}</TableCell>
              <TableCell>
                {priceInfo.buyPrice !== null
                  ? `€ ${priceInfo.buyPrice}`
                  : "N/A"}
              </TableCell>
              <TableCell>{priceInfo.store}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PriceInfoTable;
