const express = require('express');
const bodyParser = require('body-parser');

let films = require('./top250.json');
let actors = require('./actors.json');
const utils = require('./utils.js');

const app = express();
app.use(bodyParser.json());

const filmsRouter = express.Router();
const actorsRouter = express.Router();
const apiRouter = express.Router();

const mods = {Forward: "F", Backward: "B" };

const shiftFilm = (position, mod) =>{
  if (mod == mods.Forward){
    films.filter( (film) =>{
      if (film.position >= position) film.position++;
    });
  }else if (mod = mods.Backward){
    films.filter( (film) =>{
      if (film.position > position) film.position--;
    });
  }
}

const deletePositionSpaces = (position) =>{
  const arr = utils.sortArray(films, 'position', 'ASC');
  const lastItem = arr[arr.length-1];
  if (position - lastItem.position != 1){
    position = lastItem.position + 1;
  }
  return position;
}

const createFilm = (title, rating, year, budget, gross, poster, position) =>{
  let film ={
    id: Date.now(),
    title: "",
    rating: "",
    year: 0,
    budget: 0,
    gross: 0,
    poster: "",
    position: 0
  };

  if (year && year >= 1900 && year <= new Date().getFullYear()){
    film.year = year;
  }else{
    return {Error: year, ErrorField: 'year'};
  }

  if (budget && budget >= 0){
    film.budget = budget;
  }else{
    return {Error: budget, ErrorField: 'budget'};
  }

  if (gross && gross >= 0){
    film.gross = gross;
  }else{
    return {Error: gross, ErrorField: 'gross'};
  }

  if (title) film.title = title;
  if (rating) film.rating = rating;
  if (poster) film.poster = poster;
  if (position){
    if (position <= 0) return {Error: position, ErrorField: 'position'};
    film.position = deletePositionSpaces(position);
    const res = films.filter(film => film.position == position);
    if (res){
      console.log('Film positions were shifted');
      shiftFilm(position, 'F');
    }
  }

  films.push(film);
  utils.writeJson('./top250.json', JSON.stringify(films));
  films = require('./top250.json');

  return film;
}

const deleteFilm = (id) =>{
  let index;
  let result;

  films.forEach((item, i) => {
    if (item.id == id){
      index = i;
      result = item;
    }
  });

  if (!result){
    return {Error: '404 Not Found'};
  }


  films.splice(index, 1);
  shiftFilm(result.position, 'B');
  utils.writeJson('./top250.json', JSON.stringify(films));
  films = require('./top250.json');

  return result;
}

const addActor = (name, birth, films, liked, photo) =>{
  let actor ={
    id: Date.now(),
    name: "",
    birth: "",
    films: 0,
    liked: 0,
    photo: "",
  };

  if (films && films >= 0){
    actor.films = films;
  }else{
    return {Error: films, ErrorField: 'films'};
  }

  if (liked && liked >= 0){
    actor.liked = liked;
  }else{
    return {Error: liked, ErrorField: 'liked'};
  }

  if (name) actor.name = name;
  if (birth) actor.birth = birth;
  if (photo) actor.photo = photo;

  actors.push(actor);
  utils.writeJson('./actors.json', JSON.stringify(actors));
  actors = require('./actors.json');

  return actor;
}

filmsRouter.get('/readall', (req, res) => {
  res.send(utils.sortArray(films, 'position', 'ASC'));
});

filmsRouter.get('/read', (req, res) => {
  const result = films.filter(film => film.id == req.query.id);
  res.send(result);
});

filmsRouter.post('/api/films/create', (req, res) => {
  res.send(createFilm(req.body.title, req.body.rating, req.body.year, req.body.budget, req.body.gross, req.body.poster, req.body.position));
});

filmsRouter.post('/api/films/delete', (req, res) => {
  res.send(deleteFilm(req.body.id));
});

app.use("/api/films", filmsRouter);

actorsRouter.get('/readall', (req, res) => {
  res.send(utils.sortArray(actors, 'liked', 'DESC'));
});

actorsRouter.get('/read', (req, res) => {
  const result = actors.filter(actor => actor.id == req.query.id);
  res.send(result);
});

filmsRouter.post('/create', (req, res) => {
  res.send(createActor(req.body.name, req.body.birth, req.body.films, req.body.liked, req.body.photo));
});

app.use("/api/actors", actorsRouter);

app.listen(3000, () => {
  console.log('Server app listening on port 3000!');
})
