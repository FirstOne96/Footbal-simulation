-- This SQL script creates a database for storing football match data, including teams, players, matches and events.
CREATE DATABASE IF NOT EXISTS football_db;
USE football_db;

DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS players;
DROP TABLE IF EXISTS teams;

CREATE TABLE IF NOT EXISTS teams
(
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100) NOT NULL UNIQUE,
    country    VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS players
(
    id        INT AUTO_INCREMENT PRIMARY KEY,
    name      VARCHAR(100) NOT NULL UNIQUE ,
    age       INT NOT NULL,
    position  ENUM('goalkeeper', 'defender', 'midfielder', 'forward') NOT NULL,
    team_id   INT NOT NULL,
    FOREIGN KEY (team_id) REFERENCES teams(id)
);

CREATE TABLE IF NOT EXISTS matches
(
    id          INT AUTO_INCREMENT PRIMARY KEY,
    home_team   INT NOT NULL,
    away_team   INT NOT NULL,
    match_date  DATETIME NOT NULL,
    home_score  INT DEFAULT 0,
    away_score  INT DEFAULT 0,
    status      ENUM('scheduled', 'in_progress', 'finished') DEFAULT 'scheduled',
    FOREIGN KEY (home_team) REFERENCES teams(id),
    FOREIGN KEY (away_team) REFERENCES teams(id)
);

CREATE TABLE IF NOT EXISTS events
(
    id          INT AUTO_INCREMENT PRIMARY KEY,
    match_id    INT NOT NULL,
    team_id     INT NOT NULL,
    player_id   INT NOT NULL,
    event_type  ENUM('goal', 'yellow_card', 'red_card') NOT NULL,
    event_time  INT NOT NULL,
    FOREIGN KEY (match_id) REFERENCES matches(id),
    FOREIGN KEY (player_id) REFERENCES players(id)
);