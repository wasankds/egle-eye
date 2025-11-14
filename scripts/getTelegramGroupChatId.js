
/* 

เมื่อมีคนส่งข้อมูลเข้ามาในกลุ่ม Telegram ที่บอทเป็นสมาชิกอยู่
ให้ดูที่ msg.chat.id เพื่อเอาไปตั้งค่าเป็น GROUP_CHAT_ID ในระบบ

*/

import TelegramBot from 'node-telegram-bot-api';

const token = '8046567910:AAG8IhMqBMfxenMqbZapeULZGS546k83s28';
const bot = new TelegramBot(token, { polling: true });

bot.on('message', (msg) => {
  console.log('msg:', msg);
  console.log('chat.id:', msg.chat.id);
});


/* 

msg: {
  message_id: 1134,
  from: {
    id: 2103372093,
    is_bot: false,
    first_name: 'Wasan',
    last_name: 'Khunnadiloksawet',
    username: 'wasankds',
    language_code: 'th'
  },
  chat: {
    id: -4557511552,
    title: 'wasankds_group',
    type: 'group',
    all_members_are_administrators: true,
    accepted_gift_types: {
      unlimited_gifts: false,
      limited_gifts: false,
      unique_gifts: false,
      premium_subscription: false
    }
  },
  date: 1763087638,
  text: '/test',
  entities: [ { offset: 0, length: 5, type: 'bot_command' } ]
}
chat.id: -4557511552

*/