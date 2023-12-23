import { Request, Response } from "express";
import { MTGSetDTO } from "mtg-common";
import { MTGSetRepository } from "../repository/MTGSet.repository.ts";

const listedSetTypes: string[] = ["core", "expansion", "commander"];

export const GetSets = async (req: Request, res: Response) => {
  const dtos: MTGSetDTO[] = await MTGSetRepository.find().then((sets) =>
    sets
      .filter((set) => listedSetTypes.includes(set.setType))
      .sort((a, b) => b.releaseDate.getTime() - a.releaseDate.getTime())
      .map((set) => set.toDTO()),
  );
  res.send({
    data: dtos,
  });
};
