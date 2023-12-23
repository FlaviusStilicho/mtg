import { Request, Response } from "express";
import { Color } from "mtg-common";

export const colors: Color[] = [
  {
    name: "G",
    displayName: "Green",
    iconUrl: "G.png",
  },
  {
    name: "U",
    displayName: "Blue",
    iconUrl: "U.png",
  },
  {
    name: "B",
    displayName: "Black",
    iconUrl: "B.png",
  },
  {
    name: "R",
    displayName: "Red",
    iconUrl: "R.png",
  },
  {
    name: "W",
    displayName: "White",
    iconUrl: "W.png",
  },
  {
    name: "C",
    displayName: "Colorless",
    iconUrl: "C.png",
  },
];

export const GetColors = async (req: Request, res: Response) => {
  res.send({
    data: colors,
  });
};
