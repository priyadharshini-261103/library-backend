import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import db from './db.cjs';

const app = express();
const port = 3000;

app.use(cors({
  origin: '*', // Adjust this as needed for your environment
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/api/signup', async (req, res) => {
  const { fullName, dateOfBirth, address, phoneNumber, email, password } = req.body;
  const queryText = 'INSERT INTO public.users (full_name, date_of_birth, address, phone_number, email, password) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
  try {
    const result = await db.query(queryText, [fullName, dateOfBirth, address, phoneNumber, email, password]);
    console.log('User signed up successfully:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error signing up user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/admin/login', async (req, res) => {
  const { adminUsername, adminPassword } = req.body;
  console.log("Datas: ", adminUsername, adminPassword);

  try {
    const result = await db.query('SELECT * FROM admins WHERE username = $1 AND password = $2', [adminUsername, adminPassword]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.status(200).json({ message: 'Admin login successful' });
  } catch (error) {
    console.error('Error authenticating admin:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  console.log("Datas: ", username, password);
  
  try {
    const result = await db.query('SELECT full_name FROM users WHERE email = $1 AND password = $2', [username, password]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = result.rows[0];
    res.status(200).json({ message: 'User login successful', full_name: user.full_name });
  } catch (error) {
    console.error('Error authenticating user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/books', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM book_details ORDER BY category');
    const books = result.rows;

    const categorizedBooks = books.reduce((acc, book) => {
      if (!acc[book.category]) {
        acc[book.category] = [];
      }
      acc[book.category].push(book);
      return acc;
    }, {});

    res.status(200).json(categorizedBooks);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/book-details/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM book_details WHERE id = $1', [id]);
    if (result.rows.length > 0) {
      const book = result.rows[0];
      res.status(200).json(book);
    } else {
      res.status(404).json({ error: 'Book not found' });
    }
  } catch (error) {
    console.error('Error fetching book details:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/books', async (req, res) => {
  const { id, title, author, description, cover_image, category, pdf_url } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO book_details (id, title, author, description, cover_image, category, pdf_url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [id, title, author, description, cover_image, category, pdf_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

app.delete('/api/book-details/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM book_details WHERE id = $1', [id]);
    res.status(200).json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/api/book-details/edit/:id', async (req, res) => {
  const { id } = req.params;
  const { title, author, description, cover_image, category, pdf_url } = req.body;
  const query = `
    UPDATE book_details
    SET title = $1, author = $2, description = $3, cover_image = $4, category = $5, pdf_url = $6
    WHERE id = $7
    RETURNING *
  `;

  try {
    const result = await db.query(query, [title, author, description, cover_image, category, pdf_url, id]);
    if (result.rows.length > 0) {
      res.status(200).json({ message: 'Book updated successfully', book: result.rows[0] });
    } else {
      res.status(404).json({ error: 'Book not found' });
    }
  } catch (error) {
    console.error('Error updating book:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/books', async (req, res) => {
  const { title, author, category, subject } = req.query;
  let query = 'SELECT * FROM book_details WHERE 1 = 1';
  const params = [];

  if (title) {
    params.push(`%${title}%`);
    query += ` AND title ILIKE $${params.length}`;
  }
  if (author) {
    params.push(`%${author}%`);
    query += ` AND author ILIKE $${params.length}`;
  }
  if (category) {
    params.push(`%${category}%`);
    query += ` AND category ILIKE $${params.length}`;
  }
  if (subject) {
    params.push(`%${subject}%`);
    query += ` AND description ILIKE $${params.length}`;
  }

  try {
    const result = await db.query(query, params);
    const books = result.rows;
    res.status(200).json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/books/:id/favorite', async (req, res) => {
  const { userId } = req.body;
  const { id: bookId } = req.params;

  try {
    await db.query('INSERT INTO book_favorites (user_id, book_id) VALUES ($1, $2)', [userId, bookId]);
    await db.query('UPDATE book_details SET likes = likes + 1 WHERE id = $1', [bookId]);

    res.status(201).json({ message: 'Book favorited successfully' });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/api/books/:id/unfavorite', async (req, res) => {
  const { userId } = req.body;
  const { id: bookId } = req.params;

  try {
    await db.query('DELETE FROM book_favorites WHERE user_id = $1 AND book_id = $2', [userId, bookId]);
    await db.query('UPDATE book_details SET likes = likes - 1 WHERE id = $1', [bookId]);

    res.status(200).json({ message: 'Book unfavorited successfully' });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/books/:id/likes', async (req, res) => {
  const { id: bookId } = req.params;

  try {
    const result = await db.query('SELECT likes FROM book_details WHERE id = $1', [bookId]);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching likes count:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
app.use((req, res, next) => {
  res.removeHeader('Permissions-Policy');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; frame-ancestors 'self' https://drive.google.com"
  );
  next();
  next();
});