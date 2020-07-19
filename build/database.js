"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = exports.Chat = exports.get_database = void 0;
const mongodb_1 = require("mongodb");
const settings_1 = require("./settings");
function get_database() {
    return __awaiter(this, void 0, void 0, function* () {
        let client = new mongodb_1.MongoClient(settings_1.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true, });
        yield client.connect()
            .then(() => {
            console.log("Database connected");
        })
            .catch((err) => {
            console.error(err);
        });
        return new Database(client);
    });
}
exports.get_database = get_database;
class Chat {
    constructor(collection, chat) {
        this.collection = collection;
        this.chat = chat;
    }
    get_faggot_of_the_day() {
        let chat_date = this.chat.date.getDate();
        let now_date = (new Date()).getDate();
        if (chat_date !== now_date) {
            let faggot = this.chat.registered[this.chat.registered.length * Math.random() << 0];
            faggot.times += 1;
            this.collection.updateOne({ _id: this.chat._id }, { $set: {
                    faggot: faggot,
                    registered: this.chat.registered,
                    date: new Date()
                } });
            return faggot;
        }
        else {
            return this.chat.faggot;
        }
    }
    registration(id, name) {
        let person = this.chat.registered.find(a => a.id === id);
        if (person === undefined) {
            this.collection.updateOne({ _id: this.chat._id }, { $push: {
                    registered: {
                        id: id,
                        name: name,
                        times: 0
                    }
                } })
                .catch(err => {
                if (err)
                    console.error(err);
            });
            return true;
        }
        else {
            return false;
        }
    }
    get_statistics() {
        return this.chat.registered.sort((a, b) => b.times - a.times);
    }
}
exports.Chat = Chat;
class Database {
    constructor(client) {
        this.client = client;
        this.db = this.client.db(settings_1.DB_NAME);
        this.chats = this.db.collection("chats");
    }
    get_chat_by_id(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let doc = yield this.chats.findOne({ id: id });
            if (doc == null) {
                let date = new Date();
                date.setDate(date.getDate() - 1);
                yield this.chats.insertOne({
                    id: id,
                    date: date,
                    faggot: {},
                    registered: []
                });
                doc = yield this.chats.findOne({ id: id });
            }
            return new Chat(this.chats, doc);
        });
    }
    close() {
        this.client.close();
    }
}
exports.Database = Database;
