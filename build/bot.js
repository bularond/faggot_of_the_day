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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
const node_vk_bot_api_1 = __importDefault(require("node-vk-bot-api"));
const api = require('node-vk-bot-api/lib/api');
const settings_1 = require("./settings");
const database_1 = require("./database");
let bot = new node_vk_bot_api_1.default({
    token: settings_1.VK_TOKEN,
    group_id: settings_1.GROUP_ID,
});
let db;
function get_name_by_id(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return api('users.get', {
            user_ids: id,
            access_token: settings_1.VK_TOKEN
        }).then((data) => {
            let user = data.response[0];
            return `${user.first_name} ${user.last_name}`;
        });
    });
}
function faggot_of_the_day(ctx, chat) {
    return __awaiter(this, void 0, void 0, function* () {
        let faggot = chat.get_faggot_of_the_day();
        ctx.reply(`Пидор дня: *id${faggot.id} (${faggot.name})`)
            .catch((err) => {
            throw err;
        });
    });
}
function registration(ctx, chat) {
    return __awaiter(this, void 0, void 0, function* () {
        let id = ctx.message.from_id;
        let name = yield get_name_by_id(id);
        if (chat.registration(id, name)) {
            ctx.reply(`Пользователь ${name} успешно зарегестрирован`)
                .catch((err) => {
                throw err;
            });
        }
        else {
            ctx.reply(`Пользователь уже зарегестрирован`)
                .catch((err) => {
                throw err;
            });
        }
    });
}
function statistics(ctx, chat) {
    return __awaiter(this, void 0, void 0, function* () {
        let list = chat.get_statistics();
        let msg = "";
        if (list) {
            msg += "Статистика пидоров:\n\n";
            for (let i = 0; i < Math.min(list.length, 10); i++) {
                msg += `${i + 1}. *id${list[i].id} (${list[i].name}) - ${list[i].times}\n`;
            }
            msg += "\nРасчет пидоров окончен";
        }
        else {
            msg += "Еще никто не зарегестрировался";
        }
        ctx.reply(msg)
            .catch((err) => {
            throw err;
        });
    });
}
function help(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        let msg = "Инструкция по преминению:\n" +
            "pidor/faggot/пидор - выбор пидора дня\n" +
            "reg/registration/регистрация - зарегестрироваться в игре\n" +
            "stat/statisctics/статистика - рейтинг пидоров";
        ctx.reply(msg)
            .catch((err) => {
            throw err;
        });
    });
}
bot.event('message_new', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (ctx.message.peer_id > 2000000000) { // В беседе
            let chat = yield db.get_chat_by_id(ctx.message.peer_id);
            let msg = '';
            if (ctx.message.text.length) {
                let data = ctx.message.text.split(' ');
                msg = data[data.length - 1];
            }
            switch (msg.toLowerCase()) {
                case "pidor":
                case "faggot":
                case "pidorday":
                case "пидор":
                case "пидордня":
                    faggot_of_the_day(ctx, chat);
                    break;
                case "reg":
                case "registration":
                case "pidorreg":
                case "pidoreg":
                case "faggotreg":
                case "рег":
                case "регистрация":
                case "зарегестрироваться":
                case "пидоррег":
                    registration(ctx, chat);
                    break;
                case "stat":
                case "statiscics":
                case "pidorstat":
                case "faggotstat":
                case "статистика":
                    statistics(ctx, chat);
                    break;
                default:
                    help(ctx);
                    break;
            }
            ;
        }
        else {
            ctx.reply("Добавьте бота в беседу с помощью кнопки на нашй странице")
                .catch((err) => {
                throw err;
            });
        }
    }
    catch (e) {
        console.error(e);
    }
}));
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        db = yield database_1.get_database();
        bot.startPolling((err) => {
            if (err)
                console.error(err);
        });
    });
}
start().catch(err => console.log(err));
process.on("SIGINT", () => {
    db.close();
    process.exit();
});
