import Express from "express";
import bodyParser from "body-parser";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = Express();
let workItem = [];
app.use(bodyParser.urlencoded({ extended: true }))
app.use(Express.static("public"))
import mongoose from "mongoose";
import _ from "lodash";
//import https from "https";
/************* */
//database connection 
//main().catch(err => console.log(err));

async function main() {
    await mongoose.connect("mongodb+srv://admin_usama:Test123@cluster0.gec1kk5.mongodb.net/todolistDB");
    // mongoose.connect('mongodb://localhost:27017/todolistDB');
}
main().catch(err => console.log(err));


//schema
const itemSchema = {
    name: String
};
//model
const Item = mongoose.model("Item", itemSchema);
const item1 = new Item({
    name: "welcome to your todolist"
})
const item2 = new Item({
    name: "hit + button to add new"
})
const item3 = new Item({
    name: "hit delete button to delete"
});
const defaultitem = [item1, item2, item3];
const listschema = {
    name: String,
    items: [itemSchema]
}
const List = mongoose.model("List", listschema);


//app.set("view engine","ejs");
let items = ["buy food", "cook food", "eat food"];
app.set('view engine', 'ejs');


app.get("/", function (req, res) {
    Item.find({}, function (err, founditems) {
        if (founditems.length === 0) {
            Item.insertMany(defaultitem, function (err) {
                if (err) {
                    console.log(err)
                }
                else {
                    console.log("sucessfully enter")
                }
            });
            res.redirect("/");
        } else {
            res.render("list", { listTitle: "Today", newlistitems: founditems });
        }

    });



});
app.post("/", function (req, res) {
    const itemname = (req.body.newitem);
    const listName=req.body.list;
    const item = new Item({
        name: itemname
    });
    if(listName==="Today"){
        item.save();
        res.redirect("/")
    }else{
        List.findOne({name:listName},function(err,foundlist){
            foundlist.items.push(item);
            foundlist.save();
            res.redirect("/"+listName)
        })
    }

    
    

});


app.post("/delete", function (req, res) {
    const checkedid = req.body.checkbox;
    const listName=req.body.listName;
    if(listName==="Today"){
        Item.findByIdAndRemove(checkedid, function (err) {
            if (!err) {
                console.log("sucessfully deleted")
                res.redirect("/")
            }
        });
    }
    else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedid}}},function(err,foundlist){
   if(!err){
    res.redirect("/"+listName)
   }
        });
    }




    
})



app.get("/:customlist", function (req, res) {
    const customlistname = _.capitalize(req.params.customlist);
    
    if (customlistname=== "Favicon.ico") return;
    List.findOne({ name: customlistname }, function (err, foundlist) {
        if (!err) {
            if (!foundlist) {
                //console.log("doesn't exsist")
                const list = new List({
                    name: customlistname,
                    items: defaultitem
                });

                list.save();
                res.redirect("/" + customlistname)

            }
            else {
                //   console.log("exsist")
                res.render("list", { listTitle: foundlist.name, newlistitems: foundlist.items })
            }
        }

    });


});
app.post("/work", function (req, res) {
    let item = req.body.newitem;
    workItem.push(item);
    res.redirect("/");


})
app.get("/about", function (req, res) {
    res.render("about")
})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port);
app.listen(port, function () {
    console.log("server started")
})