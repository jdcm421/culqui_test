import bcrypt from "bcryptjs";
import fs from "fs";
import { v4 as random } from "uuid";
import { Cards, UnitCard } from "./cards.interface";

let cards: Cards = loadCards() 
let expiration : Date = new Date();
expiration.setMinutes(expiration.getMinutes()+15);

function loadCards () : Cards {
  try {
    const data = fs.readFileSync("./cards.json", "utf-8")
    return JSON.parse(data)
  } catch (error) {
    console.log(`Error ${error}`)
    return {}
  }
}

function saveCards () {
  try {
    fs.writeFileSync("./cards.json", JSON.stringify(cards), "utf-8")
    console.log(`Tarjeta registrada !`)
  } catch (error) {
    console.log(`Error : ${error}`)
  }
}

export const findAll = async (): Promise<UnitCard[]> => Object.values(cards);

export const findOne = async (token: string): Promise<UnitCard> => cards[token];

export const create = async (cardData: UnitCard): Promise<String | null> => {

  let token = await bcrypt.genSalt(16);

  let check_card = await findOne(token);
  

  while (check_card) {
    token = random()
    check_card = await findOne(token)
  }

  const card : UnitCard = {
        token:token,
        email:cardData.email,
        card_number:cardData.card_number,
        cvv:cardData.cvv,
        expiration_year:cardData.expiration_year,
        expiration_mount:cardData.expiration_mount,
        token_expiration:expiration
  };

  cards[token] = card;

  saveCards()

  return card.token;
};

export const findByCardNumber = async (card_number: string): Promise<null | UnitCard> => {

    const allcards = await findAll();
  
    const getCard = allcards.find(result => card_number === result.card_number);
  
    if (!getCard) {
      return null;
    }
  
    return getCard;
  };

