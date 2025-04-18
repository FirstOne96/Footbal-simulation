// api.js
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
const port = 3000;

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Error handler wrapper
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// ====CRUD operations====

// Create a new team (CREATE)
app.post('/api/teams', asyncHandler(async (req, res) => {
    const { name, country } = req.body;
    // Check if the team already exists
    const [existingTeam] = await db.query('SELECT * FROM teams WHERE name = ?', [name]);
    if (existingTeam.length > 0) {
        return res.status(400).json({ message: 'Team already exists' });
    }
    const [result] = await db.query('INSERT INTO teams (name, country) VALUES (?, ?)', [name, country]);
    res.status(201).json({ id: result.insertId, name, country });
}));

// Get all teams (READ)
app.get('/api/teams', asyncHandler(async (req, res) => {
    const [teams] = await db.query('SELECT * FROM teams');
    if (teams.length === 0) {
        return res.status(404).json({ message: 'No teams found' });
    }
    res.json(teams);
}))

// Update a team (UPDATE)
app.put('/api/teams/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, country } = req.body;
    // Check if the team exists
    const [team] = await db.query('SELECT * FROM teams WHERE id = ?', [id]);
    if (team.length === 0) {
        return res.status(404).json({ message: 'Team not found' });
    }
    await db.query('UPDATE teams SET name = ?, country = ? WHERE id = ?', [name, country, id]);
    res.status(204).end();
}));

// Delete a team (DELETE)
app.delete('/api/teams/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    // Check if the team exists
    const [team] = await db.query('SELECT * FROM teams WHERE id = ?', [id]);
    if (team.length === 0) {
        return res.status(404).json({ message: 'Team not found' });
    }
    await db.query('DELETE FROM teams WHERE id = ?', [id]);
    res.status(204).end();
}));

// Get matches (READ)
app.get('/api/matches', asyncHandler(async (req, res) => {
    const [matches] = await db.query('SELECT * FROM matches');
    if (matches.length === 0) {
        return res.status(404).json({ message: 'No matches found' });
    }
    res.json(matches);
}));

// Get team's matches (READ)
app.get('/api/teams/:id/matches', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const [matches] = await db.query('SELECT * FROM matches WHERE home_team = ? OR away_team = ?', [id, id]);
    if (matches.length === 0) {
        return res.status(404).json({ message: 'No matches found for this team' });
    }
    res.json(matches);
}));

// Get player's name and team name (READ)
app.get('/api/players/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const [player] = await db.query('SELECT players.name AS player_name, teams.name AS team_name FROM players JOIN teams ON players.team_id = teams.id WHERE players.id = ?', [id]);
    if (player.length === 0) {
        return res.status(404).json({ message: 'Player not found' });
    }
    res.json(player[0]);
}));

// Add a new player to a team (CREATE)
app.post('/api/teams/:id/players', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, age, position } = req.body;
    // Check if the team exists
    const [team] = await db.query('SELECT * FROM teams WHERE id = ?', [id]);
    if (team.length === 0) {
        return res.status(404).json({ message: 'Team not found' });
    }
    const [result] = await db.query('INSERT INTO players (name, age, position, team_id) VALUES (?, ?, ?, ?)', [name, age, position, id]);
    res.status(201).json({ id: result.insertId, name, age, position, team_id: id });
}));

// Get all players in a team (READ)
app.get('/api/teams/:id/players', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const [players] = await db.query('SELECT * FROM players WHERE team_id = ?', [id]);
    if (players.length === 0) {
        return res.status(404).json({ message: 'No players found for this team' });
    }
    res.json(players);
}));

// Update a player (UPDATE)
app.put('/api/players/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, age, position } = req.body;
    // Check if the player exists
    const [player] = await db.query('SELECT * FROM players WHERE id = ?', [id]);
    if (player.length === 0) {
        return res.status(404).json({ message: 'Player not found' });
    }
    await db.query('UPDATE players SET name = ?, age = ?, position = ? WHERE id = ?', [name, age, position, id]);
    res.status(204).end();
}));

// Delete a player (DELETE)
app.delete('/api/players/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    // Check if the player exists
    const [player] = await db.query('SELECT * FROM players WHERE id = ?', [id]);
    if (player.length === 0) {
        return res.status(404).json({ message: 'Player not found' });
    }
    await db.query('DELETE FROM players WHERE id = ?', [id]);
    res.status(204).end();
}));

// Add a new match (CREATE)
app.post('/api/matches', asyncHandler(async (req, res) => {
    const { home_team, away_team, match_date  } = req.body;
    // Check if the teams exist
    const [teams] = await db.query('SELECT * FROM teams WHERE id IN (?, ?)', [home_team, away_team]);
    if (teams.length !== 2) {
        return res.status(404).json({ message: 'One or both teams not found' });
    }
    const [result] = await db.query('INSERT INTO matches (home_team, away_team, match_date, home_score, away_score, status) VALUES (?, ?, ?, 0, 0, "scheduled")', [home_team, away_team, match_date]);
    res.status(201).json({ id: result.insertId, home_team, away_team, match_date, home_score : 0, away_score : 0, game_status : "scheduled" });
}));

// Update a match (UPDATE)
app.put('/api/matches/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { home_team, away_team, match_date, home_score, away_score, status } = req.body;
    // Check if the match exists
    const [match] = await db.query('SELECT * FROM matches WHERE id = ?', [id]);
    if (match.length === 0) {
        return res.status(404).json({ message: 'Match not found' });
    }
    await db.query('UPDATE matches SET home_team = ?, away_team = ?, match_date = ?, home_score = ?, away_score = ?, status = ? WHERE id = ?', [home_team, away_team, match_date, home_score, away_score, status, id]);
    res.status(204).end();
}));

// Delete a match (DELETE)
app.delete('/api/matches/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    // Check if the match exists
    const [match] = await db.query('SELECT * FROM matches WHERE id = ?', [id]);
    if (match.length === 0) {
        return res.status(404).json({ message: 'Match not found' });
    }
    await db.query('DELETE FROM matches WHERE id = ?', [id]);
    res.status(204).end();
}));

// Error handler middleware
app.use((err, req, res, next) => {
    console.error('API Error:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Start the server
app.listen(port, () => {
    console.log(`Football Match API running on port ${port}`);
});
