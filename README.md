# 🏀 Football Match Simulator API

A Node.js + REST API to simulate football matches, manage teams, players, and match events. 
Uses MySQL for data storage.

## ✨ Features
- CRUD operations for teams and players
- Match simulation and history
- REST API to simulate football matches

## ⚡ Technologies
- Node.js
- MySQL

---

## ♻️ Setup Instructions  

### 1. 📂 Clone the Repository
```bash
git clone https://github.com/yourusername/Football-simulation.git
cd Football-simulation
```
### 2. 📂 Install Dependencies
```bash
npm install
```
### 3. 📂 Configure Environment Variables
```bash
cp .env.example .env
```
Edit .env with your DB credentials.

### 4. 🔍 Setup MySQL Database
Make sure MySQL is running - ```sudo systemctl status mysql```
If not:
```bash
sudo systemctl start mysql
```    
Then execute the *football_db* to create tables:
```bash
mysql -u root -p < football_db.sql
```

### 5. 🚀 Run the Server
```bash
node api.js
```

Server will be available at `http://localhost:3000`

---

## 📊 API Endpoints

### Teams
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/teams` | List all teams |
| POST | `/api/teams` | Create a new team |
| PUT | `/api/teams/:id` | Update team info |
| DELETE | `/api/teams/:id` | Delete team |
| GET | `/api/teams/:id/matches` | List team matches |
| GET | `/api/players/:id` | Get player's name and team name |

### Matches
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/matches` | List matches |
| POST | `/api/matches` | Add a new match |
| PUT | `/api/matches/:id` | Update match info |
| DELETE | `/api/matches/:id` | Delete a match |


### Players
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/teams/:id/players` | List all players in an excect team |
| POST | `/api/teams/:id/players` | Add player to team |
| PUT | `/api/players/:id` | Update player info  |
| DELETE | `/api/players/:id` | Delete a player |


---

## 🌐 Tools for Testing
- [Postman](https://www.postman.com/)

---

## 🚀 Example API Usage
### POST `/api/teams`
```json
{
  "name": "AC Sparta",
  "country": "Czech Republic"
}
```

### PUT `/api/teams/1`
```json
{
  "name": "Sparta Praha",
  "country": "Czech Republic"
}
```

### POST `/api/matches`
```json
{
  "home_team": 1,
  "away_team": 2,
  "match_date": "2025-05-01"
}
```
