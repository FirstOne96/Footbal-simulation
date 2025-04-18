//const mysql = require('mysql2/promise');
const db = require('./db');

// Function to get random minutes in between 1 and 90
function getRandomMinute() {
    return Math.floor(Math.random() * 90) + 1;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to generate random players names
function getRandomPlayerName() {
    const firstNames = ['Alex', 'Jamie', 'Jordan', 'Casey', 'Taylor', 'Morgan', 'Pat', 'Sam', 'Chris', 'Robin'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson'];

    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

async function simulateMatch(team1, country1, team2, country2) {

    try {
        // Insert teams if they don't exist
        await db.query(`
                    INSERT INTO teams (name, country)
                    VALUES (?, ?),
                           (?, ?)
                    ON DUPLICATE KEY UPDATE name=name;`
            , [team1, country1, team2, country2]);


        // Get team IDs
        const [teams] = await db.query('SELECT id FROM teams WHERE name IN (?, ?)', [team1, team2]);
        const homeTeamId = teams[0].id;
        const awayTeamId = teams[1].id;

        // Player positions
        const positions = ['goalkeeper', 'defender', 'defender', 'defender', 'defender',
            'midfielder', 'midfielder', 'midfielder',
            'forward', 'forward', 'forward'];

        for (let j = 0; j < 2; j++) {
            const teamId = j === 0 ? homeTeamId : awayTeamId;
            // Add players to teams if they don't exist
            const [existingPlayers] = await db.query('SELECT COUNT(*) AS count FROM players WHERE team_id = ?', [teamId]);
            const playerCount = 11; // Number of players per team
            if (existingPlayers[0].count < playerCount) {
                for (let i = 0; i < playerCount; i++) {
                    const playerName = getRandomPlayerName();
                    const playerAge = Math.floor(Math.random() * 10) + 20; // Random age between 20 and 30
                    const playerPosition = positions[i];
                    await db.query(`
                                INSERT INTO players (name, age, position, team_id)
                                VALUES (?, ?, ?, ?)
                                ON DUPLICATE KEY UPDATE name=name;`
                        , [playerName, playerAge, playerPosition, teamId]);
                }
            }
        }

        // Create a new match
        const matchDate = new Date();
        const [matchResult] = await db.query(
            'INSERT INTO matches (home_team, away_team, match_date, status) VALUES (?, ?, ?, ?)',
            [homeTeamId, awayTeamId, matchDate, 'in_progress']
        );

        const matchId = matchResult.insertId;
        console.log(`Created match #${matchId} between team #${homeTeamId} and team #${awayTeamId}`);

        // Generate match events
        const events = [];

        // Generate at least 3 goals
        const goalCount = getRandomInt(3, 6); // Random number of goals between 3 and 6
        for (let i = 0; i < goalCount; i++) {
            const scoringTeamId = Math.random() > 0.5 ? homeTeamId : awayTeamId;
            const minute = getRandomMinute();
            const [players] = await db.query('SELECT id FROM players WHERE team_id = ?', [scoringTeamId]);
            const playerId = players[Math.floor(Math.random() * players.length)].id;

            events.push({
                match_id: matchId,
                team_id: scoringTeamId,
                player_id: playerId,
                event_type: 'goal',
                minute: minute
            });
        }

        // Generate at least 1 yellow card
        const yellowCardCount = getRandomInt(1, 4); // Random number of yellow cards between 1 and 4
        for (let i = 0; i < yellowCardCount; i++) {
            const teamId = Math.random() > 0.5 ? homeTeamId : awayTeamId;
            const minute = getRandomMinute();
            const [players] = await db.query('SELECT id FROM players WHERE team_id = ?', [teamId]);
            const playerId = players[Math.floor(Math.random() * players.length)].id;

            events.push({
                match_id: matchId,
                team_id: teamId,
                player_id: playerId,
                event_type: 'yellow_card',
                minute: minute
            });
        }

        // Generate at least 1 red card
        const redCardCount = getRandomInt(1, 2) // Random number of red cards between 1 and 2
        for (let i = 0; i < redCardCount; i++) {
            const teamId = Math.random() > 0.5 ? homeTeamId : awayTeamId;
            // Red cards usually happen later in the game
            const minute = getRandomInt(20, 90);
            const [players] = await db.query('SELECT id FROM players WHERE team_id = ?', [teamId]);
            // Get random player id from the team
            const playerId = players[Math.floor(Math.random() * players.length)].id;

            events.push({
                match_id: matchId,
                team_id: teamId,
                player_id: playerId,
                event_type: 'red_card',
                minute: minute
            });
        }

        // Sort events by minute
        events.sort((a, b) => a.minute - b.minute);

        // Insert all events into the database
        for (const event of events) {
            await db.query(
                'INSERT INTO events (match_id, team_id, player_id, event_type, event_time) VALUES (?, ?, ?, ?, ?)',
                [event.match_id, event.team_id, event.player_id, event.event_type, event.minute]
            );

            // Update match score if the event is a goal
            if (event.event_type === 'goal') {
                if (event.team_id === homeTeamId) {
                    await db.query('UPDATE matches SET home_score = home_score + 1 WHERE id = ?', [matchId]);
                } else {
                    await db.query('UPDATE matches SET away_score = away_score + 1 WHERE id = ?', [matchId]);
                }
            }

            console.log(`${event.minute}': ${event.player_id} - ${event.event_type}`);
        }

        // Update match status to completed
        await db.query('UPDATE matches SET status = ? WHERE id = ?', ['finished', matchId]);

        // Get final score
        const [matchDetails] = await db.query('SELECT home_score, away_score FROM matches WHERE id = ?', [matchId]);
        console.log(`Final score: ${matchDetails[0].home_score} - ${matchDetails[0].away_score}`);

    } catch (error) {
        console.error('Error simulating match:', error);
    } finally {
        // Close database db
        await db.end();
    }
}

const teams = [
    {name: 'AC Sparta', country: 'Czech Republic'},
    {name: 'SK Slavia', country: 'Czech Republic'},
    {name: 'FC Barcelona', country: 'Spain'},
    {name: 'Real Madrid', country: 'Spain'},
    {name: 'Manchester United', country: 'England'},
    {name: 'Liverpool', country: 'England'},
    {name: 'Bayern Munich', country: 'Germany'},
    {name: 'Borussia Dortmund', country: 'Germany'},
];

// Choose two random teams from the list
randomTeam1 = teams[Math.floor(Math.random() * teams.length)];
randomTeam2 = teams[Math.floor(Math.random() * teams.length)];
while (randomTeam1.name === randomTeam2.name) {
    randomTeam2 = teams[Math.floor(Math.random() * teams.length)];
}

simulateMatch(randomTeam1.name, randomTeam1.country, randomTeam2.name, randomTeam2.country).then(() => {
    console.log('Match simulation completed.');
})
    .catch((error) => {
        console.error('Error during match simulation:', error);
    });
