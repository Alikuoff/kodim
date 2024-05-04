const TelegramBot = require('node-telegram-bot-api');

const token = '6993889784:AAGVMJRiIrPFJlW6tyH7omZOVmlVpr_3gl8';
const adminId = '6990556529';

const bot = new TelegramBot(token, { polling: true });

let users = {};

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (!users[userId]) {
        bot.sendMessage(chatId, "Assalomu alaykum! Talabalar uchun yakuniy nazoratishi yozib berish xizmati botiga xush kelibsiz.\nIltimos, telefon raqamingizni yuboring:", {
            reply_markup: {
                keyboard: [[{ text: "📱 Telefon raqamingizni jo'natish", request_contact: true }]]
            }
        });
        users[userId] = { state: 'waiting_contact' };
    } else {
        bot.sendMessage(chatId, "Siz allaqachon ro'yxatdan o'tgansiz!");
    }
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const text = msg.text;

    if (users[userId]) {
        const currentState = users[userId].state;

        switch (currentState) {
            case 'waiting_contact':
                if (msg.contact) {
                    users[userId].phone = msg.contact.phone_number;
                    bot.sendMessage(chatId, "Telefon raqamingiz qabul qilindi. Endi qaysi fandan nazorat ishi kerakligni tanlang:", {
                        reply_markup: {
                            keyboard: [['🗃️ ITPM', '🐍 PYTHON'], ['📊 BIG DATA', '💻 BPM'], ['📱 MOBILE']]
                        }
                    });
                    users[userId].state = 'subject';
                } else {
                    bot.sendMessage(chatId, "Iltimos, Telefon raqamingizni yuborish uchun pastdagi tugmani bosing", {
                        reply_markup: {
                            keyboard: [[{ text: "📱 Telefon raqamingizni jo'natish", request_contact: true }]]
                        }
                    });
                }
                break;
            case 'subject':
                users[userId].subject = text;
                bot.sendMessage(adminId, `Yangi talaba ro'yxatdan o'tdi!\nTelefon raqami:   ${users[userId].phone}\nFani:   ${users[userId].subject}`);
                bot.sendMessage(chatId, "Sizning so'rovingiz qabul qilindi. Siz bilan tez orada bog'lanishadi.");
                delete users[userId];
                break;
            default:
                break;
        }
    }
});
