const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const axios = require('axios');

const tokens = {
  SOL: {
    token: 'YOUR-TOKEN',
    api: 'solana',
    name: 'SOL',
    client: null // 
  },
  POLIS: {
    token: 'YOUR-TOKEN',
    api: 'star_atlas_polis',
    name: 'POLIS',
    client: null // 
  },
  ATLAS: {
    token: 'YOUR-TOKEN',
    api: 'star_atlas',
    name: 'ATLAS',
    client: null // 
  }
};

const API_BASE_URL = 'YOUR-API';
const getArrow = (percentageChange, roleColor) => {
  if (roleColor === '#00FF00' || percentageChange > 0) {
    return '⬈'; // Seta para cima se a cor for verde ou se a mudança for positiva
  } else if (roleColor === '#FF0000' || percentageChange < 0) {
    return '⬊'; // Seta para baixo se a cor for vermelha ou se a mudança for negativa
  } else {
    return ''; // Vazio se a mudança for 0% ou se a cor não for verde nem vermelha
  }
};
const updateBotActivity = async (token, percentageChange, priceUSD) => {
  const status = `${getFormattedPercentage(percentageChange)}`;
  const arrow = getArrow(percentageChange);
  const guild = token.client.guilds.cache.get('ID-GROUP1');   // GROUP 1 
  const guild2 = token.client.guilds.cache.get('ID-GROUP2'); // GROUP 2
  const guild3 = token.client.guilds.cache.get('ID-GROUP3'); // GROUP 3
  // Set the presence status
  if (percentageChange > 0) {
    await token.client.user.setPresence({ activities: [{ name: status, type: ActivityType.Playing }], status: 'online' });
  } else if (percentageChange < 0) {
    await token.client.user.setPresence({ activities: [{ name: status, type: ActivityType.Playing }], status: 'dnd' });
  } else {
    await token.client.user.setPresence({ activities: [{ name: status, type: ActivityType.Playing }], status: 'online' });
  }

  let roleName;

  switch (token.name) {
    case 'POLIS':
      roleName = 'POLIS';
      break;
    case 'SOL':
      roleName = 'SOL';
      break;
    case 'ATLAS':
      roleName = 'ATLAS';
      break;
    default:
      console.error('Nome do token não reconhecido:', token.name);
      return;
  }
  
  const role = guild.roles.cache.find((r) => r.name === roleName); // Encontra a Role com o nome correspondente
  const role2 = guild2.roles.cache.find((r) => r.name === roleName); // Encontra a Role com o nome correspondente
  const role3 = guild3.roles.cache.find((r) => r.name === roleName); // Encontra a Role com o nome correspondente

  // Mudar cor do nome e nick
  if (percentageChange > 0) {
    await role.edit({ color: '#00FF00' }); // Verde - cor para mudança positiva
  } else if (percentageChange < 0) {
    await role.edit({ color: '#FF0000' }); // Vermelho - cor para mudança negativa
  } else {
    await role.edit({ color: '#FFFFFF' }); // Branco - cor para nenhuma mudança (0%)
  }
  
  // Mudar cor do nome e nick
  if (percentageChange > 0) {
    await role2.edit({ color: '#00FF00' }); // Verde - cor para mudança positiva
  } else if (percentageChange < 0) {
    await role2.edit({ color: '#FF0000' }); // Vermelho - cor para mudança negativa
  } else {
    await role2.edit({ color: '#FFFFFF' }); // Branco - cor para nenhuma mudança (0%)
  }
  if (percentageChange > 0) {
    await role3.edit({ color: '#00FF00' }); // Verde - cor para mudança positiva
  } else if (percentageChange < 0) {
    await role3.edit({ color: '#FF0000' }); // Vermelho - cor para mudança negativa
  } else {
    await role3.edit({ color: '#FFFFFF' }); // Branco - cor para nenhuma mudança (0%)
  }
  // Meu grupo
  guild.members.fetch();
  guild.members.me.setNickname(`${token.name} ${arrow} $${priceUSD}`);
  guild2.members.fetch();
  guild2.members.me.setNickname(`${token.name} ${arrow} $${priceUSD}`);
  guild3.members.fetch();
  guild3.members.me.setNickname(`${token.name} ${arrow} $${priceUSD}`);

};

const fetchCryptoData = async (token) => {
  try {
    const response = await axios.get(API_BASE_URL);
    const data = response.data[token.api];
    const priceUSD = data.price;
    const percentageChangeStr = data.change24hr;
    const percentageChange = parseFloat(percentageChangeStr.replace('%', '')) / 100;

    await updateBotActivity(token, percentageChange, priceUSD);
  } catch (error) {
    console.error('Erro ao obter dados das criptomoedas:', error);
  }
};

const getFormattedPercentage = (percent) => {
  return `${(percent * 100).toFixed(2)}%`;
};

const startBot = (tokenInfo) => {
  const token = tokenInfo.token;
  const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

  client.on('ready', () => {
    console.log(`O bot ${tokenInfo.name} foi iniciado como ${client.user.tag}!`);
    setInterval(() => fetchCryptoData(tokenInfo), 12000); 
  });
  client.rest.on('rateLimited', rate => {
    console.log(rate);
  });
  client.login(token);
  tokenInfo.client = client;
};

// Start all the bots
for (const tokenInfo of Object.values(tokens)) {
  startBot(tokenInfo);
}
