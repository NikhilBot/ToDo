//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _=require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-nikhil:Test123@cluster0-xdffs.mongodb.net/todolistDB", {
  useNewUrlParser: true
});


const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Buy food"
});
const item2 = new Item({
  name: "Cook food"
});
const item3 = new Item({
  name: "Eat food"
});

const defaultItems = [item1, item2, item3];

const listSchema= {
  name: String,
  items: [itemsSchema]
};

const List=mongoose.model("List",listSchema);


app.get("/", function(req, res) {


  Item.find({}, function(err, items) {
    if (!err) {

      if (items.length === 0) {
        Item.insertMany(defaultItems, function(err) {
          if (err) console.log(err);
        });

      }
      
      res.render("list", {
        listTitle:"Today" ,
        newListItems: items
      });
    } else console.log(err);
  });


});


app.get("/:customListName",function(req,res){
  const customListName=_.capitalize(req.params.customListName);


  if(List.findOne({name: customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        const list=new List({
          name:customListName,
          items: defaultItems
        });
          list.save();
          res.redirect("/"+customListName);
      }
      else{
  res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
      }
    }
  }));


});


app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName=req.body.list;
  const item = new Item({
    name: itemName
  });
  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }

});


app.post("/delete",function(req,res){
   const checkedItemID=req.body.checkbox;
   const listName=req.body.listName;
  if(listName==="Today")
  {
    Item.findByIdAndRemove(checkedItemID,function(err){
      if(!err) res.redirect("/");
    });
  }
  else{

    List.findOneAndUpdate({name:listName},{$pull: {items: {_id:checkedItemID}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }
});



let port= process.env.PORT;
if(port==null || port==""){
  port=3000;
}
app.listen(port, function() {
  console.log("Server started");
});
//https://stormy-spire-26059.herokuapp.com/
