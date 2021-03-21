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

//Setup Database

const itemsSchema = new mongoose.Schema({
  name: String
});

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);
const Item = mongoose.model("Item", itemsSchema);

//Routes

app.get('/', (req, res) => {

  Item.find({}, function(err, itemsFound) {
    if ( !err ) {
      res.render("list", {
        header: header,
        listItems: itemsFound
      });
    }
  });

});

app.get('/:customListName', (req, res) => {
  const customListName = req.params.customListName;
  console.log(customListName);

  if (req.params.customListName === "favicon.ico") return;

  List.findOne({name: customListName}, (err, foundList) => {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customListName
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        console.log(foundList.items);
        res.render("list", {
          header: foundList.name,
          listItems: foundList.items
        });
      }
    }
  });


});

app.post('/', (req, res) => {

  const itemName = req.body.newItem;
  const listName = req.body.list;


  // if (textField !== "") {
  //   const item = new Item({
  //     name: textField
  //   });
  // }

  const item = new Item({
    name: itemName
  });

  console.log(item);

  if (listName === "Today") {
    item.save(function() {
      res.redirect("/");
    });
  } else {
    List.findOne({name: listName}, (err, foundList) => {
      foundList.items.push(item);
      foundList.save(function() {
        res.redirect("/" + listName);
      });
    });
  }

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
