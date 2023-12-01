import express, { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import * as database from "./cards.database"
import { CardRes, UnitCard } from "./cards.interface"

export const cardRouter = express.Router()
let regexEmail = /^\w+(\.-?\w+)*@\w+(\.-?\w+)*(\.\w{2,3})+$/;
let regexCard = /^[0-9]{13,16}$/gm;
let regexCVV = /^[0-9]{3,4}$/gm;
let regexAge = /(([1][9][0-9][0-9])|([2][0-9][0-9][0-9]))/gm;
let regexMount = /^[+]?(0[1-9]|1[0-2])/gm;
let api_key = 'test_qulqui_5ce01a4f';
let fechaActual = new Date();
let age:any;
let ageNow:any;
let ageExp : any;


cardRouter.get("/tokens/:id", async (req : Request, res : Response) => {
    try {
        const key  = req.headers.authorization
        const card : UnitCard = await database.findOne(req.params.id)

        if(!key || key !== api_key){
            return res.status(StatusCodes.UNAUTHORIZED).json({error : `Api Key Invalido`})
        }
        if (!card) {
            return res.status(StatusCodes.NOT_FOUND).json({error : `No existe Tarjeta`})
        }

        age  = card.token_expiration;
        ageNow  = fechaActual;
        age = Date.parse(age);
        ageNow = Date.parse(ageNow);
        if(age < ageNow){
            return res.status(StatusCodes.REQUEST_TIMEOUT).json({error : `Token a expirado`})
        }

        const cards : CardRes = {
            email:card.email,
            card_number:card.card_number,
            expiration_year:card.expiration_year,
            expiration_mount:card.expiration_mount
        }

        return res.status(StatusCodes.OK).json({cards})
    } catch (error) {
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error})
    }
})

cardRouter.post("/tokens", async (req : Request, res : Response) => {
    try {
        const  key  = req.headers.authorization

        if(!key || key !== api_key){
            return res.status(StatusCodes.UNAUTHORIZED).json({error : `Api Key Invalido`})
        }

        const { email, card_number, cvv, expiration_year, expiration_mount } = req.body

        age  = Number.parseInt(expiration_year);
        ageNow  = fechaActual.getFullYear();
        ageExp  = age - ageNow;

        if (!email || !card_number || !cvv || !expiration_year || !expiration_mount) {
            return res.status(StatusCodes.BAD_REQUEST).json({error : `Por favor ingrese su datos`})
        }

        
        if(!regexEmail.test(email)){
            return res.status(StatusCodes.BAD_REQUEST).json({error : `email invalido`})
        }

        if(!regexCard.test(card_number)){
            return res.status(StatusCodes.BAD_REQUEST).json({error : `número de tarjeta invalido`})
        }

        if(!regexCVV.test(cvv)){
            return res.status(StatusCodes.BAD_REQUEST).json({error : `cvv invalido`})
        }

        if(!regexAge.test(expiration_year) || ageExp < 0){
            return res.status(StatusCodes.BAD_REQUEST).json({error : `año invalido`})
        }

        if(!regexMount.test(expiration_mount)){
            return res.status(StatusCodes.BAD_REQUEST).json({error : ` mes invalido`})
        }

        const card = await database.findByCardNumber(card_number);

        if (card) {
            return res.status(StatusCodes.BAD_REQUEST).json({error : `La tarjeta ingresa existe`})
        }

        const newCard  = await database.create(req.body)

        return res.status(StatusCodes.CREATED).json({newCard})

    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error})
    }
})