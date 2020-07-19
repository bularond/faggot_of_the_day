import { MongoClient, Collection, Db } from "mongodb";
import { MONGO_URL, DB_NAME } from "./settings";

export async function get_database(): Promise<Database> {
  let client = new MongoClient(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true, });
  await client.connect()
    .then(() => {
      console.log("Database connected");
    })
    .catch((err) => {
      console.error(err);
    })
  return new Database(client);
}

export interface User {
  id: number, 
  name: string,
  times: number
}

interface ChatInterface {
  _id: number,
  id: number,
  date: Date,
  faggot: User,
  registered: Array<User>
}

export class Chat {
  collection: Collection;
  chat: ChatInterface;
  constructor(collection: Collection, chat: ChatInterface) {
    this.collection = collection;
    this.chat = chat;
  }

  get_faggot_of_the_day(): User {
    let chat_date = this.chat.date.getDate();
    let now_date = (new Date()).getDate();
    if(chat_date !== now_date) {
      let faggot = this.chat.registered[this.chat.registered.length * Math.random() << 0];
      faggot.times += 1;
      this.collection.updateOne(
        { _id: this.chat._id }, 
        {$set: {
          faggot: faggot,
          registered: this.chat.registered,
          date: new Date()
        }});
      return faggot;
    }
    else {
      return this.chat.faggot;
    }
  }

  registration(id: number, name: string): boolean {
    let person = this.chat.registered.find(a => a.id === id);
    if(person === undefined) {
      this.collection.updateOne(
        {_id: this.chat._id},
        {$push: {
          registered: {
            id: id,
            name: name,
            times: 0 }}})
      .catch(err => {
        if(err) console.error(err);
      });
      return true;
    }
    else {
      return false;
    }
  }

  get_statistics(): Array<User> {
    return this.chat.registered.sort((a, b) => b.times - a.times);
  }
}

export class Database {
  client: MongoClient;
  db: Db;
  chats: Collection;
  constructor(client: MongoClient) {
    this.client = client;
    this.db = this.client.db(DB_NAME);
    this.chats = this.db.collection("chats");
  }

  async get_chat_by_id(id: number): Promise<Chat> {
    let doc = await this.chats.findOne({ id: id });
    if(doc == null) {
      let date = new Date();
      date.setDate(date.getDate() - 1);
      await this.chats.insertOne({
        id: id,
        date: date,
        faggot: {},
        registered: [] 
      });
      doc = await this.chats.findOne({ id: id });
    }
    return new Chat(this.chats, doc);
  }

  close(): void {
    this.client.close();
  }
}
