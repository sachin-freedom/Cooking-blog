require("../models/database");
const Category = require("../models/Category");
const Recipe = require("../models/Recipe");
const fs = require("fs");
const path = require("path");

/* Get Homepage */
exports.homepage = async (req, res) => {
  try {
    const limitNumber = 5; // You can set this to whatever limit you need
    const categories = await Category.find({}).limit(limitNumber);
    const latest = await Recipe.find({}).sort({ _id: -1 }).limit(limitNumber);
    const thai = await Recipe.find({ category: "Thai" }).limit(limitNumber);
    const chinese = await Recipe.find({ category: "Chinese" }).limit(
      limitNumber
    );
    const american = await Recipe.find({ category: "American" }).limit(
      limitNumber
    );
    const indian = await Recipe.find({ category: "Indian" }).limit(limitNumber);
    const mexicon = await Recipe.find({ category: "Mexicon" }).limit(limitNumber);

    const food = { latest, thai, american, chinese, indian,mexicon };
    res.render("index.ejs", {
      title: "Cooking Blog - Home",
      categories: categories,
      food: food,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

//Category get route method
exports.exploreCategories = async (req, res) => {
  try {
    const limitNumber = 20; // You can set this to whatever limit you need
    const categories = await Category.find({}).limit(limitNumber);
    res.render("categories.ejs", {
      title: "Cooking Blog - Categories",
      categories: categories,
    });
  } catch (error) {
    console.log("Some error occure.", +error);
  }
};

//Category get route via id method
exports.exploreCategoryById = async (req, res) => {
  try {
    let { id } = req.params;
    const limitNumber = 20; // You can set this to whatever limit you need
    const categoryById = await Recipe.find({ category: id }).limit(limitNumber);
    console.log(categoryById[0].category);
    res.render("categories.ejs", {
      title: "Cooking Blog - Categories",
      categoryById,
    });
  } catch (error) {
    console.log("Some error occure.", +error);
  }
};

//Recipe Get route Method

exports.exploreRecipe = async (req, res) => {
  try {
    let { id } = req.params;
    const recipe = await Recipe.findById(id);
    console.log(recipe);

    res.render("recipe.ejs", {
      title: `Cooking Blog - ${recipe.name}`,
      recipe,
    });
  } catch (error) {
    res.render(error);
  }
};

//search route

exports.searchRecipe = async (req, res) => {
  try {
    const { searchTerm } = req.body;

    if (!searchTerm || typeof searchTerm !== "string") {
      return res
        .status(400)
        .render("error.ejs", { message: "Invalid search term" });
    }

    console.log(searchTerm);

    let recipes = await Recipe.find({
      $text: { $search: searchTerm, $diacriticSensitive: true },
    });

    res.render("search.ejs", { title: "Cooking Blog - Search", recipes });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .render("error.ejs", { message: "An error occurred during the search" });
  }
};

exports.exploreLatest = async (req, res) => {
  try {
    const limitNumber = 20;
    const recipes = await Recipe.find({}).sort({ _id: -1 }).limit(limitNumber);
    res.render("explore-latest.ejs", {
      title: "Cooking Blog - Explore Latest",
      recipes,
    });
  } catch (error) {
    res.send(error);
  }
};
exports.exploreRandom = async (req, res) => {
  try {
    let count = await Recipe.find().countDocuments();
    let random = Math.floor(Math.random() * count);

    let recipes = await Recipe.findOne().skip(random).exec();

    res.render("explore-random.ejs", {
      title: "Cooking Blog - Random Recipe",
      recipes,
    });
  } catch (error) {
    res.send(error);
  }
};

exports.submitRecipe = (req, res) => {
  const infoErrorsObj = req.flash("infoErrors");
  const infoSubmitObj = req.flash("infoSubmit");

  res.render("submit-recipe.ejs", {
    title: "Cooking Blog - Submit your recipe",
    infoErrorsObj,
    infoSubmitObj,
  });
};

exports.submitRecipeOnPost = async (req, res) => {
  try {
    let imageUploadFile;
    let uploadPath;
    let newImageName;

    if (!req.files || Object.keys(req.files).length === 0) {
      console.log("No files were uploaded");
    } else {
      imageUploadFile = req.files.image;
      newImageName = Date.now() + imageUploadFile.name;

      uploadPath = require("path").join("./public/uploads/", newImageName);

      // ALTERNATE WAY OF DOING THE SAME THING
      // uploadPath = require('path').resolve('./') + '/public/uploads/' + newImageName;

      imageUploadFile.mv(uploadPath, function (err) {
        if (err) return res.status(500).send(err);
      });
    }

    const newRecipe = new Recipe({
      name: req.body.name,
      description: req.body.description,
      email: req.body.email,
      ingredients: req.body.ingredients,
      category: req.body.category,
      image: newImageName,
    });

    await newRecipe.save();

    req.flash("infoSubmit", "Recipe has been added.");
    res.redirect("/submit-recipe");
  } catch (error) {
    req.flash("infoErrors", error);
    res.redirect("/submit-recipe");
  }
};

exports.updateRecipeForm = async (req, res) => {
  const { id } = req.params;
  const recipe = await Recipe.findById(id);

  res.render("update-form.ejs", {
    title: "Cooking Blog - Submit your recipe",
    id,
    recipe,
  });
};

exports.updateRecipeFormSubmit = async (req, res) => {
  const { id } = req.params;

  try {
    let imageUploadFile;
    let uploadPath;
    let newImageName;

    if (!req.files || Object.keys(req.files).length === 0) {
      console.log("No files were uploaded");
    } else {
      imageUploadFile = req.files.image;
      newImageName = Date.now() + imageUploadFile.name;

      uploadPath = path.join("./public/uploads/", newImageName);
      console.log(uploadPath);

      // ALTERNATE WAY OF DOING THE SAME THING
      // uploadPath = require('path').resolve('./') + '/public/uploads/' + newImageName;

      imageUploadFile.mv(uploadPath, function (err) {
        if (err) return res.status(500).send(err);
      });
    }

    // Retrieve the recipe by its ID
    const recipe = await Recipe.findById(id);
    if (!recipe) {
      // Handle case where recipe is not found
      return res.status(404).send("Recipe not found");
    }

    // Prepare update object
    const updateData = {
      name: req.body.name,
      description: req.body.description,
      email: req.body.email,
      category: req.body.category,
      ingredients: Array.isArray(req.body.ingredients)
        ? req.body.ingredients
        : [req.body.ingredients],
      image: newImageName || recipe.image, // Use the new image if uploaded, otherwise keep the existing one
    };


    if (updateData.image !== recipe.image && recipe.image) {
      const imagePath = path.join(__dirname,"../../public/uploads/",recipe.image);

      fs.unlink(imagePath, (err) => {
        if (err) {
          console.log("Failed to delete Image file.", err);
          // You can choose to not return here and continue with the recipe deletion
          // return res.status(500).send("Failed to delete image file");
        } else {
          console.log("Image file deleted successfully");
        }
      });
    }

    // Update the recipe
    await Recipe.findByIdAndUpdate(id, updateData, { new: true });

    // Update the properties of the retrieved recipe
    // const res = await Recipe.updateMany(
    //   {
    //     name: recipe.name,
    //     description: recipe.description,
    //     email: recipe.email,
    //     category: recipe.category,
    //     ingredients: recipe.ingredients,
    //     image: recipe.image,
    //   },
    //   {
    //     name: req.body.name,
    //     description: req.body.description,
    //     email: req.body.email,
    //     category: req.body.category,
    //     ingredients: req.body.ingredients,
    //     image: newImageName,
    //   }
    // );

    res.redirect(`/recipe/${id}`);
  } catch (error) {
    res.status(500).send(error);
  }
};







exports.deleteRecipe = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the recipe by ID
    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return res.status(404).send("Recipe not found");
    }

    // If the recipe has an associated image, attempt to delete it
    if (recipe.image) {
      const imagePath = path.join(__dirname,"../../public/uploads/",recipe.image);

      fs.unlink(imagePath, (err) => {
        if (err) {
          console.log("Failed to delete Image file.", err);
          // You can choose to not return here and continue with the recipe deletion
          // return res.status(500).send("Failed to delete image file");
        } else {
          console.log("Image file deleted successfully");
        }
      });
    }

    // Delete the recipe from the database
    await Recipe.findByIdAndDelete(id);

    // Redirect to the homepage
    res.redirect("/");
  } catch (error) {
    console.error("Error deleting recipe:", error);
    res.status(500).send("An error occurred while deleting the recipe");
  }
};


exports.getContact = (req,res) =>{
  res.render("contact.ejs");
}


exports.getAbout = (req,res) =>{
  res.render("about-us.ejs");
}






// exports.deleteRecipe = async (req, res) => {
//   const { id } = req.params;
//   const recipe = await Recipe.findById(id);
//   if(recipe.image){
//   const imagePath = path.join(__dirname, "../../public/uploads/", recipe.image);
//   fs.unlink(imagePath, (err) => {
//     if (err) {
//       console.log("Failed to delete Image file.", err);
//       return res.status(500).send("Failed to delete image file");
//     }

//     //Delete Recipe
    
//    });
//   }
//   await Recipe.findByIdAndDelete(id);
//   res.redirect("/");
// };


// async function insertDymmyCategoryData(){
//     try {

//         await Category.insertMany([
//             {
//                 "name" : "Thai",
//                 "image": "thai-food.jpg"
//             },
//             {
//                 "name" : "American",
//                 "image": "american-food.jpg"
//             },
//             {
//                 "name" : "Chinese",
//                 "image": "chinese-food.jpg"
//             },
//             {
//                 "name" : "Mexican",
//                 "image": "mexican-food.jpg"
//             },
//             {
//                 "name" : "Indian",
//                 "image": "indian-food.jpg"
//             },
//             {
//                 "name" : "Spanish",
//                 "image": "spanish-food.jpg"
//             }
//         ]);

//     } catch (error) {
//         console.log(error);
//     }
// }

// insertDymmyCategoryData();

// async function insertDymmyRecipeData(){
//     try {

//         await Recipe.insertMany([
//           {
//             name: "Southern Fried Chicken",
//             description: `Classic southern fried chicken with a crispy crust and tender meat.`,
//             email: "recipeemail@raddy.co.uk",
//             ingredients: [
//               "1 whole chicken, cut into pieces",
//               "1 cup buttermilk",
//               "1 cup all-purpose flour",
//               "1 tablespoon salt",
//               "1 tablespoon black pepper",
//               "1 teaspoon baking powder",
//               "1 teaspoon cayenne pepper",
//               "1 teaspoon hot smoked paprika",
//               "Vegetable oil for frying",
//             ],
//             category: "American",
//             image: "southern-fried-chicken.jpg",
//           },
//           {
//             name: "Pad Thai",
//             description:
//               "A classic Thai stir-fried noodle dish with peanuts and lime.",
//             email: "recipeemail@raddy.co.uk",
//             ingredients: [
//               "8 oz rice noodles",
//               "2 tablespoons vegetable oil",
//               "2 cloves garlic, minced",
//               "1 shallot, thinly sliced",
//               "1/2 cup tofu, diced",
//               "2 eggs, beaten",
//               "1/4 cup fish sauce",
//               "1/4 cup tamarind paste",
//               "1/4 cup sugar",
//               "1 cup bean sprouts",
//               "1/4 cup roasted peanuts, chopped",
//               "1 lime, cut into wedges",
//             ],
//             category: "Thai",
//             image: "pad_thai.jpg",
//           },
//           {
//             name: "Chinese Steak Tofu",
//             description:
//               "Tender steak slices with tofu in a savory Chinese-style sauce.",
//             email: "recipeemail@raddy.co.uk",
//             ingredients: [
//               "1 lb beef steak, thinly sliced",
//               "1 block firm tofu, cubed",
//               "1/4 cup soy sauce",
//               "2 tablespoons oyster sauce",
//               "1 tablespoon cornstarch",
//               "1 tablespoon sesame oil",
//               "2 cloves garlic, minced",
//               "1 teaspoon grated ginger",
//               "1 red bell pepper, sliced",
//               "1 cup broccoli florets",
//               "Cooking oil",
//             ],
//             category: "Chinese",
//             image: "chinese-steak-tofu.jpg",
//           },
//           {
//             name: "Chocolate Banoffee Pie",
//             description:
//               "Decadent chocolate banoffee pie with layers of chocolate, caramel, banana, and whipped cream.",
//             email: "recipeemail@raddy.co.uk",
//             ingredients: [
//               "1 1/2 cups graham cracker crumbs",
//               "6 tablespoons unsalted butter, melted",
//               "1/4 cup granulated sugar",
//               "1 cup semi-sweet chocolate chips",
//               "1 can sweetened condensed milk",
//               "3 ripe bananas, sliced",
//               "1 1/2 cups heavy cream",
//               "2 tablespoons powdered sugar",
//               "1 teaspoon vanilla extract",
//               "Chocolate shavings for garnish",
//             ],
//             category: "Indian",
//             image: "chocolate-banoffee.jpg",
//           },
//           {
//             name: "Crab Cakes",
//             description:
//               "Golden brown crab cakes with a crispy crust and juicy crab meat inside.",
//             email: "recipeemail@raddy.co.uk",
//             ingredients: [
//               "1 lb lump crab meat",
//               "1/2 cup breadcrumbs",
//               "1/4 cup mayonnaise",
//               "1 egg",
//               "2 tablespoons Dijon mustard",
//               "1 tablespoon Worcestershire sauce",
//               "1/4 cup chopped parsley",
//               "1/4 cup chopped green onions",
//               "1 teaspoon Old Bay seasoning",
//               "Salt and pepper to taste",
//               "2 tablespoons butter",
//               "Lemon wedges for serving",
//             ],
//             category: "American",
//             image: "crab-cakes.jpg",
//           },
//           {
//             name: "Grilled Lobster Roll",
//             description:
//               "Buttery grilled lobster in a toasted bun with a touch of lemon and herbs.",
//             email: "recipeemail@raddy.co.uk",
//             ingredients: [
//               "2 lobster tails, cooked and meat removed",
//               "4 tablespoons unsalted butter, melted",
//               "4 hot dog buns, split",
//               "1/4 cup mayonnaise",
//               "2 tablespoons chopped chives",
//               "1 tablespoon lemon juice",
//               "Salt and pepper to taste",
//               "Lettuce leaves",
//             ],
//             category: "Indian",
//             image: "grilled-lobster-roll.jpg",
//           },
//         ]);

//     } catch (error) {
//         console.log(error);
//     }
// }

// insertDymmyRecipeData();
