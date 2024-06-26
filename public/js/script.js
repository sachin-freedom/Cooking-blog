const ingredientBtn = document.querySelector("#addIngredientsBtn");
const ingredientDiv = document.querySelector(".ingredientDiv");
let ingredientList = document.querySelector(".ingredientList");

   

ingredientBtn.addEventListener("click", ()=>{
    let newIngredients = ingredientDiv.cloneNode(true);
    let input = newIngredients.getElementsByTagName('input')[0];
    input.value = '';
    ingredientList.appendChild(newIngredients);

});