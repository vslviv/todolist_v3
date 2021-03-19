const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');

const app = express();

app.use(express.static('public'));

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({
  extended: true
})); // for parsing application/x-www-form-urlencoded

mongoose.connect('mongodb+srv://admin-yurii:dfvgsh2005@cluster0.dzap0.mongodb.net/todoDB?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

//Check errors when connect to database

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Succesfylly connected to database");
});

app.set('view engine', 'ejs');

//Setup

let title = "Todolist";
let header = "Today";
let listItems = [{name: "Buy milk"}, {name: "Clean house"}, {name: "Learn to code"}];

//Setup Database

const itemsSchema = new mongoose.Schema({
  name: String,
  items: Array
});

const listSchema = new mongoose.Schema({
  name: String,
  items: itemsSchema
});

const List = mongoose.model("List", listSchema);
const Item = mongoose.model("Item", itemsSchema);

//Routes

app.get('/', (req, res) => {

  Item.find({}, function(err, itemsFound) {
    if ( !err ) {
      res.render("list", {
        title: title,
        header: header,
        listItems: itemsFound
      });
    }
  });

});

app.get('/:listParam', (req, res) => {
  const listParam = req.params.listParam;
  console.log(listParam);
  const list = new List({
    name: listParam
  });
  list.save();
});

app.post('/', (req, res) => {

  const textField = req.body.textField;

  if (textField !== "") {
    const item = new Item({
      name: textField
    });
    item.save();
  }

  res.redirect("/");

});

app.post('/delete', (req, res) => {

  const itemId = req.body.checkbox;

  Item.findByIdAndDelete(itemId, (err) => {
    if (!err) {
      console.log("Item was succesfylly deleted");
    }
  });

  res.redirect("/");

});

//Port listening

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
