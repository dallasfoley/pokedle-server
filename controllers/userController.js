import db from "../config/db.js";
import { formatDate } from "../lib/utils.js";

export const login = (req, res) => {
  const q = "SELECT * FROM users WHERE email = ? AND password = ?;";
  const values = [req.body.email, req.body.password];
  db.query(q, values, (e, data) => {
    if (e) return res.status(500).json(e);
    if (data.length > 0) {
      const user = data[0];
      return res.json({
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          password: user.password,
          darkTheme: user.darkTheme,
          blurryStreak: user.blurryStreak,
          classicStreak: user.classicStreak,
          zoomedStreak: user.zoomedStreak,
          blurryMax: user.blurryMax,
          classicMax: user.classicMax,
          zoomedMax: user.zoomedMax,
          blurryDate: formatDate(user.blurryDate),
          classicDate: formatDate(user.classicDate),
          zoomedDate: formatDate(user.zoomedDate),
          classicGuesses: user.classicGuesses,
          classicWins: user.classicWins,
          blurryGuesses: user.blurryGuesses,
          blurryWins: user.blurryWins,
          zoomedGuesses: user.zoomedGuesses,
          zoomedWins: user.zoomedWins,
        },
      });
    } else {
      return res.status(401).json({ error: "Invalid email or password" });
    }
  });
};

// export const logout = (req, res) => {
//   req.session.destroy((err) => {
//     if (err) {
//       console.error(e);
//       return res.status(500).json({ error: "Failed to log out" });
//     }
//     console.log("Logout Successful");
//     return res.json({ message: "Logout successful" });
//   });
// };

export const createUser = (req, res) => {
  const q = "insert into users (`email`, `password`) values (?);";
  const values = [req.body.email, req.body.password];
  db.query(q, [values], (e, data) => {
    if (e) {
      console.error("Error creating user:", e.message);
      return res.status(500).json({ error: e.message });
    }
    console.log("User Created Successfully");
    if (data.length > 0) {
      const user = data[0];
      return res.json({
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          password: user.password,
          darkTheme: user.darkTheme,
          blurryStreak: user.blurryStreak,
          classicStreak: user.classicStreak,
          zoomedStreak: user.zoomedStreak,
          blurryMax: user.blurryMax,
          classicMax: user.classicMax,
          zoomedMax: user.zoomedMax,
          blurryDate: formatDate(user.blurryDate),
          classicDate: formatDate(user.classicDate),
          zoomedDate: formatDate(user.zoomedDate),
          classicGuesses: user.classicGuesses,
          classicWins: user.classicWins,
          blurryGuesses: user.blurryGuesses,
          blurryWins: user.blurryWins,
          zoomedGuesses: user.zoomedGuesses,
          zoomedWins: user.zoomedWins,
        },
      });
    }
  });
};

export const getUserById = (req, res) => {
  const id = req.params.id;
  const q = "select * from users where id = ?;";
  db.query(q, id, (e, data) => {
    if (e) return res.status(500).json({ error: e.message });
    return res.status(201).json(data);
  });
};

export const toggleUserThemeById = (req, res) => {
  const id = req.params.id;
  const theme = req.body.newTheme;
  const q = "update users set darkTheme = ? where id = ?;";
  db.query(q, [theme, id], (e, data) => {
    console.log(e);
    if (e) return res.status(500).json({ error: e.message });
    return res.status(201).json(data);
  });
};

export const resetStreakById = async (req, res) => {
  const id = req.params.id;
  const streak = req.body.streak;
  console.log(req.body);
  const q = `UPDATE users SET ${db.escapeId(streak)} = 0 WHERE id = ?;`;
  db.query(q, [id], (e, data) => {
    if (e) return res.status(500).json({ error: e.message });
    console.log("reset successful");
    return res.status(201).json(data);
  });
};

export const updateStreakById = async (req, res) => {
  const { game, guesses } = req.body;
  const id = req.params.id;
  try {
    const currentDate = new Date().toISOString().slice(0, 10);

    const q1 = `SELECT * FROM users WHERE id = ?`;

    // Wrap db.query in a promise to use async/await
    const userData = await new Promise((resolve, reject) => {
      db.query(q1, [id], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]); // Assuming results[0] is the user data
      });
    });

    if (!userData) return res.status(404).json({ error: "User not found" });

    let streakField = `${game}Streak`;
    let totalGuessesField = `${game}Guesses`;
    let totalWinsField = `${game}Wins`;
    let dateField = `${game}Date`;
    let maxField = `${game}Max`;

    let currentStreak = userData[streakField] || 0;
    let currentGuesses = userData[totalGuessesField] || 0;
    let currentWins = userData[totalWinsField] || 0;

    if (userData[dateField] !== currentDate) {
      currentStreak++;
      currentWins++;

      const q2 = `
              UPDATE users 
              SET ${streakField} = ?, ${totalGuessesField} = ?, ${totalWinsField} = ?, ${dateField} = ?
              WHERE id = ?
          `;
      await new Promise((resolve, reject) => {
        db.query(
          q2,
          [
            currentStreak,
            currentGuesses + guesses,
            currentWins,
            currentDate,
            id,
          ],
          (err, results) => {
            if (err) reject(err);
            else resolve(results);
          }
        );
      });

      if (currentStreak > (userData[maxField] || 0)) {
        const q3 = `UPDATE users SET ${maxField} = ? WHERE id = ?`;
        await new Promise((resolve, reject) => {
          db.query(q3, [currentStreak, id], (err, results) => {
            if (err) reject(err);
            else resolve(results);
          });
        });
      }
    }

    res.json({
      message: "Streak updated successfully",
      data: {
        streak: currentStreak,
        totalGuesses: currentGuesses + guesses,
        totalWins: currentWins,
        maxStreak: currentStreak,
        date: formatDate(currentDate),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
