// @ts-ignore
import VkBot from 'node-vk-bot-api';
const api = require('node-vk-bot-api/lib/api');

import { VK_TOKEN, GROUP_ID, MONGO_URL } from './settings';
import { get_database, Database, Chat } from './database';

let bot = new VkBot({
  token: VK_TOKEN,
  group_id: GROUP_ID,
});

let db: Database;

async function get_name_by_id(id: number): Promise<string> {
  return api('users.get', {
    user_ids: id,
    access_token: VK_TOKEN
  }).then((data: any) => {
    let user = data.response[0];
    return `${user.first_name} ${user.last_name}`;
  });
}

async function faggot_of_the_day(ctx: VkBot.Context, chat: Chat) {
  let faggot = chat.get_faggot_of_the_day();
  ctx.reply(`Пидор дня: *id${faggot.id} (${faggot.name})`)
    .catch((err: Error) => {
      throw err;
    });
}

async function registration(ctx: VkBot.Context, chat: Chat) {
  let id = ctx.message.from_id;
  let name = await get_name_by_id(id);
  if(chat.registration(id, name)) {
    ctx.reply(`Пользователь ${name} успешно зарегестрирован`)
      .catch((err: Error) => {
        throw err;
      });
  }
  else {
    ctx.reply(`Пользователь уже зарегестрирован`)
      .catch((err: Error) => {
        throw err;
      });
  }
}

async function statistics(ctx: VkBot.Context, chat: Chat) {
  let list = chat.get_statistics();
  let msg = "";
  if(list) {
    msg += "Статистика пидоров:\n\n";
    for(let i = 0; i < Math.min(list.length, 10); i++) {
      msg += `${i+1}. *id${list[i].id} (${list[i].name}) - ${list[i].times}\n`;
    }
    msg += "\nРасчет пидоров окончен";
  }
  else{
    msg += "Еще никто не зарегестрировался";
  }
  ctx.reply(msg)
    .catch((err: Error) => {
      throw err;
    })
}

async function help(ctx: VkBot.Context) {
  let msg = "Инструкция по преминению:\n" +
            "pidor/faggot/пидор - выбор пидора дня\n" +
            "reg/registration/регистрация - зарегестрироваться в игре\n" +
            "stat/statisctics/статистика - рейтинг пидоров"
  ctx.reply(msg)
    .catch((err: Error) => {
      throw err;
    })
}

bot.event('message_new', async (ctx: VkBot.Context) => {
  try { 
    if(ctx.message.peer_id > 2000000000) { // В беседе
      let chat = await db.get_chat_by_id(ctx.message.peer_id);
      let msg= '';
      if(ctx.message.text.length) {
        let data = ctx.message.text.split(' ');
        msg = data[data.length - 1];
      }
      switch(msg.toLowerCase()) {
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
      };
    }
    else {
      ctx.reply("Добавьте бота в беседу с помощью кнопки на нашй странице")
        .catch((err: Error) => {
          throw err;
        });
    }
  } catch (e) {
    console.error(e);
  }
});

async function start() {
  db = await get_database();
  bot.startPolling((err: Error) => {
    if(err) console.error(err);
  });
}

start().catch(err => console.log(err));

process.on("SIGINT", () => {
  db.close();
  process.exit();
});