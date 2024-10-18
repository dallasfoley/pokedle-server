import { sql } from "../api/index.js"; // Assuming neon.js is in the same directory
import { formatDate } from "../lib/utils.js";

export const login = async (req, res) => {
  const q = `SELECT * FROM users WHERE email = ${req.body.email} AND password = ${req.body.password};`;
  try {
    const result = await sql` ${q} `;
    if (result.length > 0) {
      const user = result[0];
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
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const createUser = async (req, res) => {
  const q = `insert into users (email, password) values (${req.body.email}, ${req.body.password});`;
  try {
    await sql`${q}`;
    console.log("User Created Successfully");
    // ... rest of the logic
  } catch (error) {
    console.error("Error creating user:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

export const getUserById = async (req, res) => {
  const q = `select * from users where id = ${req.params.id};`;
  try {
    const result = await sql`${q}`;
    return res.status(201).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const toggleUserThemeById = async (req, res) => {
  const q = `update users set darkTheme = ${theme} where id = ${req.params.id};`;
  try {
    await sql`${q}`, [theme, id];
    return res.status(201).json({ message: "Theme toggled successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const resetStreakById = async (req, res) => {
  const id = req.params.id;
  const streak = req.body.streak;
  const q = `UPDATE users SET ${sql.escapeId(streak)} = 0 WHERE id = ${id};`;
  try {
    await sql`${q}`;
    return res.status(201).json({ message: "Streak reset successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const updateStreakById = async (req, res) => {
  const { game, guesses } = req.body;
  try {
    const currentDate = new Date().toISOString().slice(0, 10);

    const q1 = `SELECT * FROM users WHERE id = ${req.params.id}`;
    const userData = await sql`${q1}`;

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
      await sql` ${q2} `,
        [currentStreak, currentGuesses + guesses, currentWins, currentDate, id];

      if (currentStreak > (userData[maxField] || 0)) {
        const q3 = `UPDATE users SET ${maxField} = ? WHERE id = ?`;
        await sql` ${q3} `, [currentStreak, id];
      }
    }

    return res.json({
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
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
