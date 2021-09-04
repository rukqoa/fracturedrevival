const { Client, Intents, MessageEmbed } = require('discord.js')
const client = new Client({ intents: [Intents.FLAGS.GUILDS] })

const https = require('https')
const config = require('dotenv').config()

mainLoop()
setInterval(mainLoop, 1000 * 30)

let previousMaxPlayer = 0

function mainLoop() {
    let totalPlayers = 0
    getServerData((data) => {
        console.log('Getting server data')

        let servers = JSON.parse(data)
        servers.items.forEach((server) => {
            let session = server.session

            let name = session.name
            let playerCount = session.attributes.playerCount

            totalPlayers += playerCount
        })

        if (totalPlayers > previousMaxPlayer && totalPlayers > 0) {
            console.log('Total Players: ', totalPlayers)
            botSendMessage(totalPlayers)
        }

        previousMaxPlayer = totalPlayers
    })
}

function botSendMessage(players) {
    client.login(process.env.BOT_TOKEN)

    const messageEmbed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Players online: ' + players)
        .setURL('https://lifeline.returnvector.net/static/servers.html')
        .setDescription('Join the fun!\n For instructions, join KS3 discord: https://discord.gg/9CPqpcJ')
        .setThumbnail('https://cdn.discordapp.com/app-icons/518348437125857280/a4871861053e2c667d93b9716227cf82.png?size=512')
        .setTimestamp()

    client.channels.fetch('883604394699030529', { allowUnknownGuild: true })
        .then(channel => {
            channel.send({ embeds: [messageEmbed] })
        })
        .catch(console.error)
}

function getServerData(callback) {
    const options = {
        hostname: 'lifeline.returnvector.net',
        port: 443,
        path: '/o/_instances/list',
        method: 'GET',
        json: true
    }

    const req = https.request(options, res => {
        let body = ''

        res.on('data', (chunk) => {
            body += chunk
        })

        res.on('end', () => {
            try {
                callback(body)
            } catch (error) {
                console.error(error.message)
            }
        })
    })

    req.on('error', error => {
        console.error(error)
    })

    req.end()
}