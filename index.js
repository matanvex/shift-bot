
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

const client = new Client({
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

const TARGET_KEYWORDS = [
    "לוקח שני ערב", "לוקחת שני ערב", "מי מוסר", "מחליף שני בוקר על ערב", "מוסר שני בוקר או מחליף לערב"
];

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
    console.log('📱 Scan the QR code to log in to WhatsApp');
});

client.on('ready', () => {
    console.log('✅ Successfully connected to WhatsApp!');
});

client.on('message', async message => {
    if (message.from.includes("@g.us")) {
        const text = message.body.toLowerCase();
        const found = TARGET_KEYWORDS.some(keyword => text.includes(keyword.toLowerCase()));

        if (found) {
            const now = new Date().toLocaleString("en-GB", { timeZone: "Asia/Jerusalem" });
            const senderId = message.author || message.from;
            const privateChatId = senderId.replace("@c.us", "") + "@c.us";

            console.log(`🚨 Keyword detected!`);
            console.log(`💬 Message: ${message.body}`);
            console.log(`👥 Group ID: ${message.from}`);
            console.log(`👤 Sender ID: ${senderId}`);

            try {
                await client.sendMessage(privateChatId, "היי, אני אשמח למסור");
                console.log(`📩 Private message sent to ${privateChatId}`);
            } catch (err) {
                console.error(`❌ Failed to send private message:`, err);
            }

            const logEntry = `[${now}] Message: "${message.body}" | From: ${senderId} | Group: ${message.from}
`;
            fs.appendFile('log.txt', logEntry, (err) => {
                if (err) console.error('❌ Failed to write to log file:', err);
                else console.log('📝 Message logged to log.txt');
            });
        }
    }
});

client.initialize();
