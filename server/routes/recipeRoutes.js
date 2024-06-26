const router = require("express").Router();
const recipeController = require("../controllers/recipeController.js");
const methodOverride = require("method-override");

router.use(methodOverride("_method"));

router.get('/', recipeController.homepage);

router.get('/recipe/:id', recipeController.exploreRecipe);
router.get("/categories", recipeController.exploreCategories);
router.get("/categories/:id", recipeController.exploreCategoryById);
router.post("/search", recipeController.searchRecipe);
router.get("/explore-latest", recipeController.exploreLatest);
router.get("/random-recipe", recipeController.exploreRandom);
router.get("/submit-recipe", recipeController.submitRecipe);
router.post("/submit-recipe", recipeController.submitRecipeOnPost);
router.get("/categories/:id/update", recipeController.updateRecipeForm);
router.put("/categories/:id", recipeController.updateRecipeFormSubmit);
router.delete("/categories/:id", recipeController.deleteRecipe);
router.get("/contact", recipeController.getContact);
router.get("/about", recipeController.getAbout);


module.exports = router;