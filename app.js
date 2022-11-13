//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const connectDB = require("./config/db");
connectDB();

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
const Schema = mongoose.Schema;
const itemsSchema = new Schema({
  name: String,
});
const Item = mongoose.model("item", itemsSchema);
const item1 = new Item({
  name: "Welcome to DO list",
});
const item2 = new Item({
  name: "Hit + button",
});
const item3 = new Item({
  name: "hit back button",
});

const defaultItems = [item1, item2, item3];
const listSchema = new Schema({
  name: String,
  items: [itemsSchema],
});
const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("success");
        }
      });
    }
    res.render("list", { listTitle: "Today", newListItems: foundItems });
  });
});

app.post("/", function (req, res) {
  const newItem = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: newItem,
  });

  if (listName == "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});
app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function (err) {
      if (!err) {
        console.log("Success");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } },
      function (err, foundList) {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

app.get("/:customListName", function (req, res) {
  //dynamic routing by express
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        //create new list
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        //list exists hence show old list
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    }
  });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log("Port running on 3000");
  }
});
