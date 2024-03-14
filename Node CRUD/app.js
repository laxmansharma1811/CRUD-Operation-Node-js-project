const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const User = require('./models/user');
const UserData = require('./models/userData'); 
const app = express();
const port = 3000;
const db = require('./db')

db.authenticate().then(()=>{
  console.log("db connected sccessfully");
})

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
  })
);

const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  res.redirect('/login');
};

// Routes
app.get('/', isAuthenticated, async (req, res) => {
  try {
    
    const usersData = await UserData.findAll();
    res.render('index', { user: req.session.user, users: usersData });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    
    await User.create({
      username,
      password: hashedPassword,
    });

    res.redirect('/login');
  } catch (error) {
    console.error('Error creating user:', error);
    res.redirect('/signup');
  }
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
   
    const user = await User.findOne({
      where: {
        username: username,
      },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      req.session.user = username;
      res.redirect('/');
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    console.error('Error finding user:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    res.redirect('/login');
  });
});

app.get('/create', isAuthenticated, (req, res) => {
  res.render('create');
});

app.post('/create', isAuthenticated, async (req, res) => {
  const { name, address, email, phone, profession } = req.body;

  try {
    // Create a new user data entry in the database
    await UserData.create({
      name,
      address,
      email,
      phone,
      profession,
    });

    res.redirect('/');
  } catch (error) {
    console.error('Error creating user data entry:', error);
    res.status(500).send(`Internal Server Error: ${error.message}`);
  }
});


app.get('/user/:id', isAuthenticated, async (req, res) => {
  const userId = parseInt(req.params.id);

  try {

    const user = await UserData.findByPk(userId);

    if (user) {
      res.render('user', { user });
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    console.error('Error finding user data entry:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/update/:id', isAuthenticated, async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    
    const user = await UserData.findByPk(userId);

    if (user) {
      res.render('update', { user });
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    console.error('Error finding user data entry:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/update/:id', isAuthenticated, async (req, res) => {
  const userId = parseInt(req.params.id);
  const { name, address, email, phone, profession } = req.body;

  try {
    
    const user = await UserData.findByPk(userId);

    if (user) {
      await user.update({
        name,
        address,
        email,
        phone,
        profession,
      });

      res.redirect('/');
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    console.error('Error updating user data entry:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/delete/:id', isAuthenticated, async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    
    const user = await UserData.findByPk(userId);

    if (user) {
      await user.destroy();
      res.redirect('/');
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    console.error('Error deleting user data entry:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
