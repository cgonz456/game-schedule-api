const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
app.use(cors({ origin: 'https://nwmfc.com' }));

const teamConfigs = [
  {
    name: 'New West Manor F.C',
    url: 'https://www.cusa.ab.ca/team/11991/572/8190/302753'
  },
  {
    name: 'New West Manor Women',
    url: 'https://mycwsa.ca/team/11940/1512/13882/299659'
  },
  {
    name: 'New West Manor F.C Reserves',
    url: 'https://www.cusa.ab.ca/team/11991/572/8198/302774'
  }
];

function parseDate(dateStr) {
  return new Date(Date.parse(dateStr));
}

async function fetchNextGame(url, teamName) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const rows = $('table tbody tr');
    const upcomingGames = [];

    rows.each((i, el) => {
      const dateTimeText = $(el).find('td').eq(0).text().trim();
      const homeTeam = $(el).find('td').eq(2).text().trim();
      const visitorTeam = $(el).find('td').eq(3).text().trim();

      if (homeTeam.includes(teamName) || visitorTeam.includes(teamName)) {
        const gameDate = parseDate(dateTimeText);
        if (gameDate >= new Date()) {
          const opponent = homeTeam.includes(teamName) ? visitorTeam : homeTeam;
          upcomingGames.push({
            gameDate,
            opponent,
            time: gameDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        }
      }
    });

    upcomingGames.sort((a, b) => a.gameDate - b.gameDate);
    const nextGame = upcomingGames[0];

    if (nextGame) {
      const formattedDate = nextGame.gameDate.toLocaleDateString('en-CA', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
      return {
        team: teamName,
        gameDate: `${formattedDate} @ ${nextGame.time}`,
        opponent: nextGame.opponent
      };
    }

    return null;
  } catch (err) {
    console.error(`Failed to fetch for ${teamName} from ${url}:`, err.message);
    return null;
  }
}

app.get('/api/next-games', async (req, res) => {
  const results = await Promise.all(
    teamConfigs.map(cfg => fetchNextGame(cfg.url, cfg.name))
  );

  const responseText = results
    .filter(Boolean)
    .map(r => `${r.team}: ${r.gameDate} vs ${r.opponent}`)
    .join(' | ');

  res.json({ message: responseText });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
