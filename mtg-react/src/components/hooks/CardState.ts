import { useState } from 'react';
import { MTGCardDTO, MTGCardVersionDTO } from 'mtg-common';
import { UpdateCardOwnedCopiesQueryParams } from 'mtg-common';
import axios from 'axios';
import useConstant from 'use-constant';
import { debounce } from 'lodash';

export class CardState {
    card: MTGCardDTO
    primaryVersion: MTGCardVersionDTO
    primaryImage: string;
    variantImages: string[];
    flipCard: any;
    ownedCopies: number
    subtractOwnedCopy: any
    addOwnedCopy: any

    constructor(card: MTGCardDTO, primaryVersion: MTGCardVersionDTO, primaryImage: string, variantImages: string[], flipCard: any, ownedCopies: number, subtractOwnedCopy: any, addOwnedCopy: any) {
        this.card = card
        this.primaryVersion = primaryVersion
        this.primaryImage = primaryImage
        this.variantImages = variantImages
        this.flipCard = flipCard
        this.ownedCopies = ownedCopies
        this.subtractOwnedCopy = subtractOwnedCopy
        this.addOwnedCopy = addOwnedCopy
    }
}

export const useCardState = (card: MTGCardDTO) => {

    const primaryVersion: MTGCardVersionDTO = card.versions.filter(version => version.isPrimaryVersion)[0]
    const variantVersions: MTGCardVersionDTO[] = card.versions.filter(version => version.isPrimaryVersion === false)

    const [frontSideUp, setFrontSideUp] = useState<boolean>(true);
    const [primaryImage, setPrimaryImage] = useState<string>(primaryVersion.frontImageUri);
    const [variantImages, setVariantImages] = useState<string[]>(variantVersions.map(version => version.frontImageUri));

    function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
        return value !== null && value !== undefined;
    }

    function flipCard(): void {
        const primaryImage = card.versions.filter(version => version.isPrimaryVersion).map(version => frontSideUp ? version.frontImageUri : version.backImageUri).filter(notEmpty)[0]
        setPrimaryImage(primaryImage)
        const variantImages: string[] = card.versions.filter(version => version.isPrimaryVersion === false).map(version => frontSideUp ? version.frontImageUri : version.backImageUri).filter(notEmpty)
        setVariantImages(variantImages)
        setFrontSideUp(!frontSideUp)
    }

    const [ownedCopies, setOwnedCopies] = useState<number>(card.ownedCopies);

    function subtractOwnedCopy(): void {
        if (ownedCopies > 0) {
            handleChangeOwnedCopies(ownedCopies - 1)
        }
    }

    function addOwnedCopy(): void {
        handleChangeOwnedCopies(ownedCopies + 1)
    }

    const postUpdatedOwnedCopies = useConstant(() => debounce((body: UpdateCardOwnedCopiesQueryParams) => {
        axios.post(`http://localhost:8000/cards/ownedCopies`, body)
    }, 1500))

    function handleChangeOwnedCopies(newValue: number): void {
        setOwnedCopies(newValue)
        const body: UpdateCardOwnedCopiesQueryParams = {
            cardId: card.id,
            ownedCopies: newValue
        }
        postUpdatedOwnedCopies(body)
    }

    return { primaryVersion, primaryImage, variantImages, flipCard, ownedCopies, subtractOwnedCopy, addOwnedCopy }
}