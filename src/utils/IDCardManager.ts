import localforage from "localforage"

export interface ParsedResult {
  Surname:string,
  GivenName:string,
  IDNumber:string,
  DateOfBirth:string,
  DateOfExpiry:string
}

export interface ScannedIDCard {
  backImage:string,
  frontImage:string,
  info:ParsedResult,
  timestamp:number
}

export class IDCardManager {
  private store:LocalForage;
  constructor(){
    this.store = localforage.createInstance({
      name: "idcards"
    });
  }
  
  async saveIDCard(card:ScannedIDCard) {
    await this.store.setItem(card.timestamp.toString(),JSON.stringify(card));
  }

  async deleteIDCard(key:string) {
    await this.store.removeItem(key);
  }

  async getKeys(){
    return await this.store.keys();
  }

  async getIDCard(key:string){
    let jsonStr:string|null = await this.store.getItem(key);
    if (jsonStr) {
      let card:ScannedIDCard = JSON.parse(jsonStr);
      return card;
    }else{
      return null;
    }
  }

  async listIDCards(){
    let cards:ScannedIDCard[] = [];
    let keys = await this.getKeys();
    for (let index = 0; index < keys.length; index++) {
      const key = keys[index];
      let card = await this.getIDCard(key);
      if (card) {
        cards.push(card);
      }
    }
    return cards;
  }
}